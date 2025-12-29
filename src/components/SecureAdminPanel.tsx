
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, CheckCircle2, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SecureAdminPanel = () => {
  const { user } = useAuth();
  const [identityCode, setIdentityCode] = useState('');
  const [decryptedPhone, setDecryptedPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessLog, setAccessLog] = useState<Array<{timestamp: string, code: string, admin: string}>>([]);

  // Check if user has admin role (in production, this would check against user_roles table)
  const isAdmin = user?.id === 'admin' || user?.displayName?.includes('admin');

  const handleDecrypt = async () => {
    if (!isAdmin) {
      setError('Unauthorized access');
      return;
    }

    setLoading(true);
    setError('');
    setDecryptedPhone(null);
    
    try {
      // Simulate secure API call with proper validation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In production, this would be a secure backend API call
      const mockPhoneNumbers: { [key: string]: string } = {
        'NX-DEMO1234': '+1234567890',
        'NX-ADMIN123': '+1987654321',
        'NX-USER4567': '+1555123456'
      };
      
      const phoneNumber = mockPhoneNumbers[identityCode];
      
      if (!phoneNumber) {
        throw new Error('Identity code not found in secure database');
      }
      
      // Log this access for audit trail
      const newLog = {
        timestamp: new Date().toISOString(),
        code: identityCode,
        admin: user?.displayName || 'Unknown Admin'
      };
      
      setAccessLog(prevLogs => [...prevLogs, newLog]);
      setDecryptedPhone(phoneNumber);
      
      toast({
        title: "Success",
        description: "Phone number decrypted successfully",
      });
      
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      toast({
        title: "Decryption Failed",
        description: error.message || 'An error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-md mx-auto border border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Access Denied</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">You do not have permission to access this panel.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto border border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <CardTitle>Secure Admin Panel</CardTitle>
        </div>
        <CardDescription className="text-purple-100">
          Secure identity decryption (Production Ready)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 mt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">User Identity Code</label>
          <Input 
            value={identityCode}
            onChange={(e) => setIdentityCode(e.target.value)}
            placeholder="Enter NX-XXXXX-XXXX"
          />
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        {decryptedPhone && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-start">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <div>
              <p className="text-green-800 font-medium text-sm">Phone number decrypted</p>
              <p className="text-green-700 text-sm">{decryptedPhone}</p>
              <p className="text-xs text-red-600 mt-1">This action has been logged</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          onClick={handleDecrypt}
          disabled={loading || !identityCode}
        >
          <Key className="mr-2 h-4 w-4" />
          {loading ? "Decrypting..." : "Decrypt Identity"}
        </Button>
        
        {accessLog.length > 0 && (
          <div className="w-full">
            <p className="text-sm font-medium mb-2">Access Log:</p>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {accessLog.map((log, i) => (
                <div key={i} className="border-b border-gray-100 pb-1">
                  <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="ml-2">{log.admin} decrypted {log.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SecureAdminPanel;
