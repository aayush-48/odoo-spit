import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useInventory } from '@/context/InventoryContext';
import { User, Mail, Shield, Save, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useInventory();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
    setIsEditing(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'manager':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'staff':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Please log in to view your profile</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information Card */}
          <Card className="lg:col-span-2 border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-accent" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your account details
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>User ID</Label>
                  <Input
                    value={user.id}
                    disabled
                    className="bg-muted font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your unique user identifier
                  </p>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Button
                      type="submit"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Account Details Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Account Details
              </CardTitle>
              <CardDescription>
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Role</Label>
                <div className="mt-2">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Account Status</Label>
                <div className="mt-2">
                  <Badge className="bg-success/10 text-success border-success/20">
                    Active
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // Navigate to change password (if implemented)
                      toast.info('Password change feature coming soon');
                    }}
                  >
                    Change Password
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      // Navigate to settings
                      window.location.href = '/settings';
                    }}
                  >
                    Account Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Summary (Optional) */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>
              Your recent activity in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold text-foreground mt-1">-</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Documents Created</p>
                <p className="text-2xl font-bold text-foreground mt-1">-</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">Last Login</p>
                <p className="text-2xl font-bold text-foreground mt-1">-</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground text-center">
                Activity tracking will be available soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;

