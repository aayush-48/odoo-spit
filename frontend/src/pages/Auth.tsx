import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '@/context/InventoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, AlertCircle, UserCog, Warehouse } from 'lucide-react';

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'inventory_manager' | 'warehouse_staff'>('inventory_manager');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, signup } = useInventory();
  const navigate = useNavigate();

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
        // Mock password reset
        toast.success('Password reset link sent to your email!');
        setTimeout(() => setMode('login'), 2000);
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
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' && 'Enter your credentials to access your inventory'}
              {mode === 'signup' && 'Sign up to start managing your inventory'}
              {mode === 'forgot' && 'Enter your email to receive a password reset link'}
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
              )}

              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading}
              >
                {loading ? 'Processing...' : mode === 'login' ? 'SIGN IN' : mode === 'signup' ? 'SIGN UP' : 'Reset Password'}
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
                {(mode === 'signup' || mode === 'forgot') && (
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-sm text-accent hover:underline"
                  >
                    Already have an account? Sign in
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
