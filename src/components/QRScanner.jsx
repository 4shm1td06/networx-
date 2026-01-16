import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

const QRScanner = ({ onScan, onClose }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [torchEnabled, setTorchEnabled] = useState(false);

  useEffect(() => {
    let scanner;

    try {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          rememberLastUsedCamera: true,
          facingMode: "environment",
          disableFlip: false,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Play success sound if enabled
          if (soundEnabled) {
            const audio = new Audio(
              "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA=="
            );
            audio.play().catch(() => {});
          }

          onScan(decodedText);
          scanner.clear().catch(() => {});
        },
        () => {}
      );
    } catch (err) {
      console.error("QR Scanner error:", err);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [onScan, soundEnabled]);

  const handleToggleTorch = async () => {
    try {
      const video = document.querySelector("#qr-reader video");
      if (video && video.srcObject) {
        const track = video.srcObject.getVideoTracks()[0];
        if (track) {
          const capabilities = track.getCapabilities?.();
          if (capabilities && "torch" in capabilities) {
            await track.applyConstraints({
              advanced: [{ torch: !torchEnabled }],
            });
            setTorchEnabled(!torchEnabled);
          }
        }
      }
    } catch (err) {
      console.error("Torch error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1628] rounded-xl w-full max-w-md overflow-hidden border border-[#232e48] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#0B1120] to-[#162039] border-b border-[#232e48]">
          <div>
            <h2 className="text-lg font-semibold text-networx-light">
              Scan QR Code
            </h2>
            <p className="text-xs text-networx-light/60 mt-1">
              Point camera at connection code
            </p>
          </div>
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
            className="hover:bg-[#1C2A41] transition-colors"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scanner Area */}
        <div className="p-4">
          <div id="qr-reader" className="rounded-lg overflow-hidden border-2 border-dashed border-networx-primary/30" />
        </div>

        {/* Controls */}
        <div className="px-4 pb-4 flex gap-2">
          <Button
            onClick={handleToggleTorch}
            variant="outline"
            className="flex-1 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all flex items-center justify-center gap-2"
          >
            {torchEnabled ? (
              <>
                <VolumeX className="h-4 w-4" /> Torch Off
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4" /> Torch On
              </>
            )}
          </Button>

          <Button
            onClick={() => setSoundEnabled(!soundEnabled)}
            variant="outline"
            className="flex-1 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all flex items-center justify-center gap-2"
          >
            {soundEnabled ? "🔊 Sound" : "🔇 Mute"}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-[#1C2A41] hover:bg-[#283a56] border-[#232e48] text-networx-light transition-all"
          >
            Cancel
          </Button>
        </div>

        {/* Instructions */}
        <div className="px-4 pb-4 text-xs text-networx-light/60 text-center">
          Position the QR code within the frame
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
