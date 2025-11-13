'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithPhone, verifyOTP, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/shop');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render login form if user is already logged in
  if (user) {
    return null;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast.success('Login successful!');
      router.push('/shop');
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      
      // Check if it's an email verification error
      if (errorMessage.includes('verify your email')) {
        toast.error(errorMessage, {
          duration: 6000,
          action: {
            label: 'Resend',
            onClick: () => handleResendVerification(),
          },
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      // Use production URL for email verification redirects
      const redirectUrl = process.env.NEXT_PUBLIC_SITE_URL 
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
        : 'https://Infineight.house/auth/callback';
      
      await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error('Failed to resend verification email. Please try again later.');
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithPhone(formData.phone);
      setOtpSent(true);
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpVerifying(true);

    try {
      await verifyOTP(formData.phone, formData.otp);
      toast.success('Login successful!');
      router.push('/shop');
    } catch (error: any) {
      toast.error(error.message || 'OTP verification failed');
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mb-4 flex flex-col items-center">
              <Image
                src="/images/logo.png"
                alt="Infineight"
                width={120}
                height={60}
                className="mb-2"
              />
              <p className="text-sm text-muted-foreground">Wear moments, Beyond time!</p>
            </div>
            <CardTitle className="text-3xl text-foreground">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Login to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email" className="space-y-4">
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="phone" className="space-y-4">
                {!otpSent ? (
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleOTPVerification} className="space-y-4">
                    <div>
                      <Label htmlFor="otp" className="text-foreground">Enter OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={formData.otp}
                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                        required
                        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        OTP sent to {formData.phone}
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={otpVerifying}
                    >
                      {otpVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setFormData({ ...formData, otp: '' });
                      }}
                    >
                      Back to Phone Number
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 space-y-2">
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/auth/forgot-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
