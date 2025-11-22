import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Package, AlertCircle, UserCog, Warehouse, Mail, RefreshCw } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'inventory_manager' | 'warehouse_staff'>('inventory_manager');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, signup, generateOTP, verifyOTP, resetPassword } = useInventory();
  const navigate = useNavigate();

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation
    if (!name || name.trim().length === 0) {
      newErrors.name = 'Full name is required';
    }
    
    // Login ID validation (unique, 6-12 chars)
    if (!loginId) {
      newErrors.loginId = 'Login ID is required';
    } else if (loginId.length < 6 || loginId.length > 12) {
      newErrors.loginId = 'Login ID must be between 6-12 characters';
    }
    
    // Email validation (must be unique)
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    // Password validation (uppercase, lowercase, special char, 8+ chars)
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and special character';
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      let success = false;
      
      if (mode === 'login') {
        if (!loginId || !password) {
          setErrors({ form: 'Please enter Login ID and Password' });
          setLoading(false);
          return;
        }
        
        success = await login(loginId, password);
        if (success) {
          toast.success('Login successful!');
          navigate('/dashboard');
        } else {
          setErrors({ form: 'Invalid Login ID or Password' });
          toast.error('Invalid credentials');
        }
      } else if (mode === 'signup') {
        if (!validateSignup()) {
          setLoading(false);
          return;
        }
        
        success = await signup(email, password, name.trim(), loginId, role);
        if (success) {
          toast.success('Account created successfully!');
          navigate('/dashboard');
        } else {
          toast.error('Signup failed - email may already exist');
        }
      } else if (mode === 'forgot') {
        if (!email) {
          setErrors({ email: 'Please enter your email' });
          setLoading(false);
          return;
        }
        // Generate and send OTP
        const otpCode = await generateOTP(email);
        if (otpCode) {
          setOtpSent(true);
          setOtpTimer(300); // 5 minutes
          setMode('otp');
          toast.success(`OTP sent to ${email}. Code: ${otpCode} (for testing)`);
        } else {
          setErrors({ email: 'Email not found or error sending OTP' });
        }
      } else if (mode === 'otp') {
        if (!otp || otp.length !== 6) {
          setErrors({ otp: 'Please enter the 6-digit OTP' });
          setLoading(false);
          return;
        }
        const verified = await verifyOTP(email, otp);
        if (verified) {
          setMode('reset');
          toast.success('OTP verified successfully');
        } else {
          setErrors({ otp: 'Invalid OTP. Please try again.' });
          toast.error('Invalid OTP');
        }
      } else if (mode === 'reset') {
        if (!newPassword) {
          setErrors({ newPassword: 'New password is required' });
          setLoading(false);
          return;
        }
        if (newPassword.length < 8) {
          setErrors({ newPassword: 'Password must be at least 8 characters' });
          setLoading(false);
          return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(newPassword)) {
          setErrors({ newPassword: 'Password must contain uppercase, lowercase, and special character' });
          setLoading(false);
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setErrors({ confirmNewPassword: 'Passwords do not match' });
          setLoading(false);
          return;
        }
        const success = await resetPassword(email, newPassword);
        if (success) {
          toast.success('Password reset successfully!');
          setTimeout(() => {
            setMode('login');
            setEmail('');
            setOtp('');
            setNewPassword('');
            setConfirmNewPassword('');
            setOtpSent(false);
          }, 2000);
        } else {
          setErrors({ form: 'Failed to reset password' });
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-accent mb-4">
            <Package className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            StockMaster
          </h1>
          <p className="text-muted-foreground">
            Professional Inventory Management System
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-display">
              {mode === 'login' ? 'Welcome Back' : 
               mode === 'signup' ? 'Create Account' : 
               mode === 'forgot' ? 'Reset Password' :
               mode === 'otp' ? 'Verify OTP' :
               'Set New Password'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Enter your credentials to access your inventory'}
              {mode === 'signup' && 'Sign up to start managing your inventory'}
              {mode === 'forgot' && 'Enter your email to receive an OTP'}
              {mode === 'otp' && `Enter the 6-digit OTP sent to ${email}`}
              {mode === 'reset' && 'Enter your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.form && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.form}
                </div>
              )}

              {mode === 'login' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="loginId">Login ID</Label>
                    <Input
                      id="loginId"
                      type="text"
                      placeholder="Enter your login ID"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </>
              )}

              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`bg-background ${errors.name ? 'border-destructive' : ''}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loginId">Login ID *</Label>
                    <Input
                      id="loginId"
                      type="text"
                      placeholder="Choose a login ID (6-12 chars)"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className={`bg-background ${errors.loginId ? 'border-destructive' : ''}`}
                    />
                    {errors.loginId && (
                      <p className="text-xs text-destructive">{errors.loginId}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email ID *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`bg-background ${errors.email ? 'border-destructive' : ''}`}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Min 8 chars, uppercase, lowercase, special"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`bg-background ${errors.password ? 'border-destructive' : ''}`}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Re-Enter Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`bg-background ${errors.confirmPassword ? 'border-destructive' : ''}`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={role}
                      onValueChange={(value: 'inventory_manager' | 'warehouse_staff') => setRole(value)}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="inventory_manager">
                          <div className="flex items-center gap-2">
                            <UserCog className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Inventory Manager</div>
                              <div className="text-xs text-muted-foreground">Manage incoming & outgoing stock</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="warehouse_staff">
                          <div className="flex items-center gap-2">
                            <Warehouse className="w-4 h-4" />
                            <div>
                              <div className="font-medium">Warehouse Staff</div>
                              <div className="text-xs text-muted-foreground">Perform transfers, picking, shelving, and counting</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {mode === 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`bg-background pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
              )}

              {mode === 'otp' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => {
                        setOtp(value);
                        setErrors({});
                      }}
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
                    {errors.otp && (
                      <p className="text-xs text-destructive">{errors.otp}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {otpTimer > 0 ? `Resend OTP in ${Math.floor(otpTimer / 60)}:${String(otpTimer % 60).padStart(2, '0')}` : 'OTP expired'}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        const otpCode = await generateOTP(email);
                        if (otpCode) {
                          setOtpTimer(300);
                          setOtp('');
                          toast.success(`OTP resent. Code: ${otpCode} (for testing)`);
                        }
                      }}
                      disabled={otpTimer > 0}
                      className="gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Resend
                    </Button>
                  </div>
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Min 8 chars, uppercase, lowercase, special"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`bg-background ${errors.newPassword ? 'border-destructive' : ''}`}
                    />
                    {errors.newPassword && (
                      <p className="text-xs text-destructive">{errors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password *</Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`bg-background ${errors.confirmNewPassword ? 'border-destructive' : ''}`}
                    />
                    {errors.confirmNewPassword && (
                      <p className="text-xs text-destructive">{errors.confirmNewPassword}</p>
                    )}
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading || (mode === 'otp' && otpTimer === 0)}
              >
                {loading ? 'Processing...' : 
                 mode === 'login' ? 'SIGN IN' : 
                 mode === 'signup' ? 'SIGN UP' : 
                 mode === 'forgot' ? 'Send OTP' :
                 mode === 'otp' ? 'Verify OTP' :
                 'Reset Password'}
              </Button>

              <div className="text-center pt-4 space-y-2">
                {mode === 'login' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-sm text-accent hover:underline"
                    >
                      Forget Password?
                    </button>
                    <span className="text-sm text-muted-foreground"> | </span>
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-sm text-accent hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                )}
                {(mode === 'signup' || mode === 'forgot' || mode === 'otp' || mode === 'reset') && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setEmail('');
                      setOtp('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setOtpSent(false);
                      setOtpTimer(0);
                      setErrors({});
                    }}
                    className="text-sm text-accent hover:underline"
                  >
                    Back to Sign In
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
