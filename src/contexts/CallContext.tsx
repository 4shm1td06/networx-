import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";

const socket = io("http://localhost:5000");

type IncomingCall = {
  fromUserId: string;
  offer: RTCSessionDescriptionInit;
  video: boolean;
};

const CallContext = createContext<any>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const peerRef = useRef<RTCPeerConnection | null>(null);

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  /* ================= REGISTER USER ================= */
  useEffect(() => {
    if (user?.id) {
      socket.emit("register-user", user.id);
    }
  }, [user?.id]);

  /* ================= PEER ================= */
  const createPeer = (toUserId: string) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          toUserId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    peerRef.current = peer;
    return peer;
  };

  /* ================= START CALL ================= */
  const startCall = async (toUserId: string, video: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video,
    });

    setLocalStream(stream);

    const peer = createPeer(toUserId);
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit("call-user", { toUserId, offer, video });
  };

  /* ================= ACCEPT CALL (FIXED) ================= */
  const acceptCall = async () => {
    if (!incomingCall || peerRef.current) return;

    const { fromUserId, offer, video } = incomingCall;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video, // ✅ IMPORTANT FIX
    });

    setLocalStream(stream);

    const peer = createPeer(fromUserId);

    // ✅ correct WebRTC order (CRITICAL)
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    stream.getTracks().forEach((t) => peer.addTrack(t, stream));

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("answer-call", {
      toUserId: fromUserId,
      answer,
    });

    setIncomingCall(null);
  };

  /* ================= END CALL ================= */
  const endCall = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    socket.emit("end-call");
  };

  /* ================= SOCKET EVENTS ================= */
  useEffect(() => {
    socket.on("incoming-call", setIncomingCall);

    socket.on("call-accepted", async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      await peerRef.current?.addIceCandidate(candidate);
    });

    socket.on("call-ended", () => {
      localStream?.getTracks().forEach((t) => t.stop());
      remoteStream?.getTracks().forEach((t) => t.stop());

      setLocalStream(null);
      setRemoteStream(null);
      setIncomingCall(null);

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [localStream, remoteStream]);

  return (
    <CallContext.Provider
      value={{
        startVoiceCall: (id: string) => startCall(id, false),
        startVideoCall: (id: string) => startCall(id, true),
        acceptCall,
        endCall,
        incomingCall,
        localStream,
        remoteStream,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
