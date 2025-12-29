
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useBackendServices = () => {
  const sendSMSVerification = async (phone: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phone }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('SMS sending error:', error);
      toast({
        title: "SMS Error",
        description: error.message || "Failed to send SMS verification",
        variant: "destructive",
      });
      throw error;
    }
  };

  const verifyPhoneCode = async (phone: string, code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-phone-code', {
        body: { phone, code }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify phone number",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendEmailNotification = async (to: string, subject: string, html: string, type: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-email-notification', {
        body: { to, subject, html, type }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Email sending error:', error);
      toast({
        title: "Email Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
      throw error;
    }
  };

  const generateConnectionCode = async (userId: string, options?: {
    expirationMinutes?: number;
    maxUses?: number;
    isPermanent?: boolean;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-connection-code', {
        body: { userId, ...options }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Connection code generation error:', error);
      toast({
        title: "Code Generation Error",
        description: error.message || "Failed to generate connection code",
        variant: "destructive",
      });
      throw error;
    }
  };

  const validateConnectionCode = async (code: string, requestingUserId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-connection-code', {
        body: { code, requestingUserId }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Connection code validation error:', error);
      toast({
        title: "Connection Error",
        description: error.message || "Failed to validate connection code",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    sendSMSVerification,
    verifyPhoneCode,
    sendEmailNotification,
    generateConnectionCode,
    validateConnectionCode,
  };
};
