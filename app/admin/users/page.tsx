'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Shield, 
  UserPlus, 
  UserMinus, 
  Search,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminUserManagement() {
  return (
    <AdminGuard>
      <AdminUserManagementContent />
    </AdminGuard>
  );
}

function AdminUserManagementContent() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [promotingUser, setPromotingUser] = useState<string | null>(null);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user || !profile?.is_admin) {
        toast.error('Access denied. Admin privileges required.');
        window.location.href = '/';
        return;
      }
      
      // Double-check admin status from database
      const { data: currentProfile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error || !currentProfile?.is_admin) {
        toast.error('Access denied. Admin privileges required.');
        await supabase.auth.signOut();
        window.location.href = '/';
        return;
      }
      
      loadUsers();
    };

    checkAdminAccess();
  }, [user, profile]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Cannot modify your own admin status');
      return;
    }

    setPromotingUser(userId);
    try {
      const { error } = await supabase.rpc('promote_to_admin', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error promoting user:', error);
        toast.error('Failed to promote user to admin');
        return;
      }

      toast.success('User promoted to admin successfully');
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user to admin');
    } finally {
      setPromotingUser(null);
    }
  };

  const demoteFromAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast.error('Cannot modify your own admin status');
      return;
    }

    setPromotingUser(userId);
    try {
      const { error } = await supabase.rpc('demote_from_admin', {
        target_user_id: userId
      });

      if (error) {
        console.error('Error demoting user:', error);
        toast.error('Failed to demote user from admin');
        return;
      }

      toast.success('User demoted from admin successfully');
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error demoting user:', error);
      toast.error('Failed to demote user from admin');
    } finally {
      setPromotingUser(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary">User Management</h1>
              <p className="text-muted-foreground">Manage user accounts and admin privileges</p>
            </div>
            <Button onClick={loadUsers} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold text-primary">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Admin Users</p>
                    <p className="text-2xl font-bold text-primary">
                      {users.filter(u => u.is_admin).length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Regular Users</p>
                    <p className="text-2xl font-bold text-primary">
                      {users.filter(u => !u.is_admin).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((userProfile) => (
                  <Card key={userProfile.id} className="bg-secondary border-border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {userProfile.is_admin ? (
                              <Shield className="h-5 w-5 text-primary" />
                            ) : (
                              <Users className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {userProfile.full_name || 'No Name'}
                            </h3>
                            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(userProfile.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={userProfile.is_admin ? "default" : "secondary"}>
                            {userProfile.is_admin ? 'Admin' : 'User'}
                          </Badge>
                          <div className="flex gap-2">
                            {userProfile.is_admin ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => demoteFromAdmin(userProfile.id)}
                                disabled={promotingUser === userProfile.id || userProfile.id === user?.id}
                                className="text-red-600 hover:text-red-700"
                              >
                                <UserMinus className="h-4 w-4 mr-1" />
                                Demote
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => promoteToAdmin(userProfile.id)}
                                disabled={promotingUser === userProfile.id}
                                className="text-green-600 hover:text-green-700"
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Promote
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              <strong>Security Notice:</strong> Admin privileges grant full access to the system. 
              Only promote trusted users to admin status. Admin actions are logged and monitored.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

