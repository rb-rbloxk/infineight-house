'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  Shield,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Plus,
  Trash2,
  Star,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}

interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

function ProfilePageContent() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });
  const [addressFormData, setAddressFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    is_default: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Refresh profile data on component mount to ensure we have the latest data
  useEffect(() => {
    if (user && !profile?.created_at) {
      refreshProfile();
    }
  }, [user, profile, refreshProfile]);

  // Fetch addresses when user is available
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    setAddressLoading(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Use upsert to either update existing profile or create new one
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          full_name: formData.full_name,
          phone: formData.phone,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh the profile data
      await refreshProfile();
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    });
    setIsEditing(false);
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAddAddress = () => {
    setAddressFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      is_default: addresses.length === 0, // Set as default if it's the first address
    });
    setShowAddAddress(true);
  };

  const handleEditAddress = (address: Address) => {
    setAddressFormData({
      full_name: address.full_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      is_default: address.is_default,
    });
    setEditingAddress(address.id);
  };

  const handleSaveAddress = async () => {
    if (!user) return;

    setAddressLoading(true);
    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            ...addressFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddress);

        if (error) throw error;
        toast.success('Address updated successfully!');
      } else {
        // Add new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            ...addressFormData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Address added successfully!');
      }

      // If this address is set as default, unset other defaults
      if (addressFormData.is_default) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .neq('id', editingAddress || 'new');

        // Set this address as default
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', editingAddress || 'new');
      }

      await fetchAddresses();
      setShowAddAddress(false);
      setEditingAddress(null);
      setAddressFormData({
        full_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
      });
    } catch (error: any) {
      console.error('Address save error:', error);
      toast.error('Failed to save address: ' + error.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to delete this address?')) return;

    setAddressLoading(true);
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      toast.success('Address deleted successfully!');
      await fetchAddresses();
    } catch (error: any) {
      console.error('Address delete error:', error);
      toast.error('Failed to delete address: ' + error.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user) return;

    setAddressLoading(true);
    try {
      // Unset all defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set this address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      toast.success('Default address updated!');
      await fetchAddresses();
    } catch (error: any) {
      console.error('Set default address error:', error);
      toast.error('Failed to set default address: ' + error.message);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCancelAddress = () => {
    setShowAddAddress(false);
    setEditingAddress(null);
    setAddressFormData({
      full_name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      is_default: false,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-card flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border text-center">
          <CardHeader>
            <CardTitle className="text-foreground">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to view your profile.
            </p>
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-card">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">My Profile</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-foreground hover:bg-secondary"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Email (Read-only) */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Address
                    </Label>
                    <Input
                      value={user.email || ''}
                      disabled
                      className="bg-muted text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="bg-background border-border text-foreground"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-foreground">
                          {profile?.full_name || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                        className="bg-background border-border text-foreground"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-foreground">
                          {profile?.phone || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Status */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Account Status
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={profile?.is_admin ? "default" : "secondary"}
                        className={profile?.is_admin ? "bg-primary text-primary-foreground" : ""}
                      >
                        {profile?.is_admin ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Administrator
                          </>
                        ) : (
                          'Regular User'
                        )}
                      </Badge>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="space-y-2">
                    <Label className="text-foreground flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Member Since
                    </Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-foreground">
                        {profile?.created_at 
                          ? new Date(profile.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : user?.created_at 
                            ? new Date(user.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Unknown'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                        className="text-foreground hover:bg-secondary"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manage Addresses */}
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-foreground flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Manage Addresses
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAddress}
                    className="text-foreground hover:bg-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addressLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Loading addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">No addresses saved yet</p>
                      <Button
                        variant="outline"
                        onClick={handleAddAddress}
                        className="text-foreground hover:bg-secondary"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className="p-4 border border-border rounded-lg bg-muted/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">
                                  {address.full_name}
                                </h3>
                                {address.is_default && (
                                  <Badge className="bg-primary text-primary-foreground text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">
                                {address.phone}
                              </p>
                              <p className="text-sm text-foreground mb-1">
                                {address.address}
                              </p>
                              <p className="text-sm text-foreground">
                                {address.city}, {address.state} {address.pincode}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2 sm:ml-4 mt-2 sm:mt-0">
                              {!address.is_default && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetDefaultAddress(address.id)}
                                  className="text-xs w-full sm:w-auto"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  Set Default
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAddress(address)}
                                className="text-xs w-full sm:w-auto"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                              >
                                <Trash2 className="h-3 w-3 mr-1 sm:mr-0" />
                                <span className="sm:hidden">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Address Form */}
                  {(showAddAddress || editingAddress) && (
                    <div className="mt-6 p-4 border border-border rounded-lg bg-muted/30">
                      <h3 className="font-semibold text-foreground mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">Full Name *</Label>
                            <Input
                              name="full_name"
                              value={addressFormData.full_name}
                              onChange={handleAddressInputChange}
                              placeholder="Enter full name"
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Phone Number *</Label>
                            <Input
                              name="phone"
                              value={addressFormData.phone}
                              onChange={handleAddressInputChange}
                              placeholder="Enter phone number"
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-foreground">Address *</Label>
                          <Textarea
                            name="address"
                            value={addressFormData.address}
                            onChange={handleAddressInputChange}
                            placeholder="Enter complete address"
                            className="bg-background border-border text-foreground"
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-foreground">City *</Label>
                            <Input
                              name="city"
                              value={addressFormData.city}
                              onChange={handleAddressInputChange}
                              placeholder="Enter city"
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">State *</Label>
                            <Input
                              name="state"
                              value={addressFormData.state}
                              onChange={handleAddressInputChange}
                              placeholder="Enter state"
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-foreground">Pincode *</Label>
                            <Input
                              name="pincode"
                              value={addressFormData.pincode}
                              onChange={handleAddressInputChange}
                              placeholder="Enter pincode"
                              className="bg-background border-border text-foreground"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={addressFormData.is_default}
                            onChange={handleAddressInputChange}
                            className="rounded border-border"
                          />
                          <Label htmlFor="is_default" className="text-foreground">
                            Set as default address
                          </Label>
                        </div>
                        
                        <div className="flex space-x-2 pt-4">
                          <Button
                            onClick={handleSaveAddress}
                            disabled={addressLoading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {addressLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            {editingAddress ? 'Update Address' : 'Add Address'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelAddress}
                            disabled={addressLoading}
                            className="text-foreground hover:bg-secondary"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/orders">
                    <Button variant="outline" className="w-full justify-start text-foreground hover:bg-secondary">
                      <Package className="h-4 w-4 mr-2" />
                      View Orders
                    </Button>
                  </Link>
                  <Link href="/wishlist">
                    <Button variant="outline" className="w-full justify-start text-foreground hover:bg-secondary">
                      <Heart className="h-4 w-4 mr-2" />
                      My Wishlist
                    </Button>
                  </Link>
                  <Link href="/designs">
                    <Button variant="outline" className="w-full justify-start text-foreground hover:bg-secondary">
                      <Edit className="h-4 w-4 mr-2" />
                      Saved Designs
                    </Button>
                  </Link>
                  {profile?.is_admin && (
                    <Link href="/admin">
                      <Button variant="outline" className="w-full justify-start text-primary hover:bg-secondary">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              {/* Account Stats */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Account Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Orders</span>
                    <span className="text-foreground font-semibold">0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Wishlist Items</span>
                    <span className="text-foreground font-semibold">0</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Saved Designs</span>
                    <span className="text-foreground font-semibold">0</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your account is secured with Supabase authentication.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full text-white hover:text-white hover:bg-red-700 bg-red-500"
                    onClick={() => {
                      if (confirm('Are you sure you want to sign out?')) {
                        supabase.auth.signOut();
                      }
                    }}
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
