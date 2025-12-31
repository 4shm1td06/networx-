-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.calls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  caller_id uuid,
  receiver_id uuid,
  type text CHECK (type = ANY (ARRAY['audio'::text, 'video'::text])),
  status text CHECK (status = ANY (ARRAY['ringing'::text, 'accepted'::text, 'rejected'::text, 'ended'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT calls_pkey PRIMARY KEY (id),
  CONSTRAINT calls_caller_id_fkey FOREIGN KEY (caller_id) REFERENCES auth.users(id),
  CONSTRAINT calls_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id)
);
CREATE TABLE public.connection_code (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  owner_user_id uuid,
  verified boolean DEFAULT false,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  connected_user_id uuid,
  CONSTRAINT connection_code_pkey PRIMARY KEY (id),
  CONSTRAINT connection_code_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES auth.users(id),
  CONSTRAINT connection_code_connected_user_id_fkey FOREIGN KEY (connected_user_id) REFERENCES public.users(id)
);
CREATE TABLE public.dm_messages (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  thread_id uuid,
  sender_id uuid,
  receiver_id uuid,
  content text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  attachment_url text,
  attachment_type text,
  CONSTRAINT dm_messages_pkey PRIMARY KEY (id),
  CONSTRAINT dm_messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.dm_threads(id),
  CONSTRAINT dm_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id),
  CONSTRAINT dm_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES auth.users(id)
);
CREATE TABLE public.dm_threads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1 uuid,
  user2 uuid,
  created_at timestamp with time zone DEFAULT now(),
  blocked_by uuid,
  blocked_at timestamp with time zone,
  CONSTRAINT dm_threads_pkey PRIMARY KEY (id),
  CONSTRAINT dm_threads_user1_fkey FOREIGN KEY (user1) REFERENCES auth.users(id),
  CONSTRAINT dm_threads_user2_fkey FOREIGN KEY (user2) REFERENCES auth.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  name text,
  profile_image text,
  created_at timestamp with time zone DEFAULT now(),
  is_online boolean DEFAULT false,
  last_seen timestamp without time zone,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);