
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, CheckCircle2, Key, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const [identityCode, setIdentityCode] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [decryptedPhone, setDecryptedPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessLog, setAccessLog] = useState<Array<{timestamp: string, code: string, admin: string}>>([]);
  const [showCredentials, setShowCredentials] = useState(false);

  // Admin credentials (in real app, this would be in a secure backend)
  const validAdminPassword = 'admin123';
  const validMfaCode = '123456';

  const handleDecrypt = async () => {
    setLoading(true);
    setError('');
    setDecryptedPhone(null);
    
    try {
      // In a real app, this would be a secure API call to the backend
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Validate admin credentials
      if (adminPassword !== validAdminPassword) {
        throw new Error('Invalid admin password');
      }
      
      // Validate MFA
      if (mfaCode !== validMfaCode) {
        throw new Error('Invalid MFA code');
      }
      
      // Bug fixed: Looking for identity code in correct local storage keys
      const allUserKeys = Object.keys(localStorage);
      // Bug fix: Check the correct key pattern
      const identityEntries = allUserKeys.filter(key => key.startsWith('networx-identity-'));
      
      let found = false;
      let phoneNumber = '';
      
      for (const key of identityEntries) {
        const storedIdentity = localStorage.getItem(key);
        if (storedIdentity === identityCode) {
          found = true;
          // Extract phone number from key (remove 'networx-identity-' prefix)
          phoneNumber = key.replace('networx-identity-', '');
          break;
        }
      }
      
      if (!found) {
        throw new Error('Identity code not found');
      }
      
      // Log this decryption access (in a real app, this would be stored securely)
      const newLog = {
        timestamp: new Date().toISOString(),
        code: identityCode,
        admin: 'Admin User' // In a real app, this would be the admin's username
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
  
  return (
    <Card className="w-full max-w-md mx-auto border border-purple-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <CardTitle>NetworX Admin Panel</CardTitle>
        </div>
        <CardDescription className="text-purple-100">
          Secure identity decryption (Admin only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 mt-4">
        {showCredentials && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <p className="text-yellow-800 font-medium text-sm">Admin Credentials (Demo Only)</p>
            </div>
            <div className="mt-2 space-y-1 pl-7">
              <p className="text-yellow-700 text-sm"><span className="font-semibold">Password:</span> admin123</p>
              <p className="text-yellow-700 text-sm"><span className="font-semibold">MFA Code:</span> 123456</p>
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full text-xs"
          onClick={() => setShowCredentials(!showCredentials)}
        >
          {showCredentials ? 'Hide Demo Credentials' : 'Show Demo Credentials'}
        </Button>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">User Identity Code</label>
          <Input 
            value={identityCode}
            onChange={(e) => setIdentityCode(e.target.value)}
            placeholder="Enter NX-XXXXX-XXXX"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Admin Password</label>
          <Input 
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Enter admin password"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">MFA Authentication Code</label>
          <Input 
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
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
          disabled={loading}
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
        
        <div className="w-full text-center">
          <p className="text-xs text-gray-500">
            In an emergency, contact the system administrator
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AdminPanel;
