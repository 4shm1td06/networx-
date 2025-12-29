
export type Connection = {
  id: string;
  user_id: string;
  connected_user_id?: string;
  name: string;
  custom_name?: string;
  identity_code?: string;
  profile_image?: string;
  is_muted: boolean;
  calls_muted: boolean;
  is_industry?: boolean;
  created_at?: string;
  updated_at?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
};

export type CodeSettings = {
  expirationMinutes: number | null;
  maxUses: number | null;
  permanentCode: string | null;
  usePermanentCode: boolean;
};

export type CodeStatus = {
  code: string;
  createdAt: string;
  settings: CodeSettings;
  usesLeft: number | null;
  isExpired: boolean;
  isPermanent: boolean;
};
