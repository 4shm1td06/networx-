
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader } from 'lucide-react';
import InterestsSelector from '@/components/InterestsSelector';

const Signup = () => {
  const navigate = useNavigate();
  const { signupWithOTP, signupWithEmail, verifyOTP, signup } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [step, setStep] = useState<'auth' | 'otp' | 'profile' | 'interests'>('auth');
  const [authType, setAuthType] = useState<'phone' | 'email'>('phone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier) return;
    
    try {
      setIsSubmitting(true);
      await signupWithOTP(identifier);
      setStep('otp');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identifier || !password) return;
    
    try {
      setIsSubmitting(true);
      await signupWithEmail(identifier, password);
      setStep('otp');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) return;
    
    try {
      setIsSubmitting(true);
      await verifyOTP(identifier, otp, authType);
      setStep('profile');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName) return;
    
    setStep('interests');
  };
  
  const handleSignupComplete = async (selectedInterests: string[]) => {
    try {
      setIsSubmitting(true);
      setInterests(selectedInterests);
      await signup(identifier, '', displayName, selectedInterests);
      navigate('/home');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSkipInterests = async () => {
    try {
      setIsSubmitting(true);
      await signup(identifier, '', displayName, []);
      navigate('/home');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToAuth = () => {
    setStep('auth');
    setOtp('');
  };

  const handleBackToProfile = () => {
    setStep('profile');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">NetworX</CardTitle>
          <CardDescription>
            {step === 'auth' && 'Create a new account'}
            {step === 'otp' && 'Verify your account'}
            {step === 'profile' && 'Set up your profile'}
            {step === 'interests' && 'Almost done!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'auth' && (
            <Tabs value={authType} onValueChange={(value) => setAuthType(value as 'phone' | 'email')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone">Mobile</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
              </TabsList>
              
              <TabsContent value="phone">
                <form onSubmit={handlePhoneSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter your mobile number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader className="mr-2 h-4 w-4 animate-spin" /> Sending OTP</>
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="email">
                <form onSubmit={handleEmailSubmit}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader className="mr-2 h-4 w-4 animate-spin" /> Creating account</>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}
          
          {step === 'otp' && (
            <form onSubmit={handleOTPSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    We sent a verification code to {identifier}
                  </p>
                  {authType === 'phone' && (
                    <p className="text-xs text-blue-600 text-center">
                      Demo: Enter any 6-digit code to proceed
                    </p>
                  )}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || otp.length !== 6}
                >
                  {isSubmitting ? (
                    <><Loader className="mr-2 h-4 w-4 animate-spin" /> Verifying</>
                  ) : (
                    'Verify Code'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="link" 
                  className="w-full"
                  onClick={handleBackToAuth}
                >
                  Back to signup
                </Button>
              </div>
            </form>
          )}
          
          {step === 'profile' && (
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <><Loader className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                  ) : (
                    'Continue'
                  )}
                </Button>
                <Button 
                  type="button"
                  variant="link" 
                  className="w-full"
                  onClick={handleBackToProfile}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
          
          {step === 'interests' && (
            <InterestsSelector 
              selectedInterests={interests}
              onChange={handleSignupComplete}
              onSkip={handleSkipInterests}
              showSkip={true}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/auth" className="text-primary font-medium underline-offset-4 hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
