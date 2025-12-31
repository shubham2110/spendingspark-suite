import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { User, createUser, updateUser } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Users as UsersIcon, Mail, Pencil, UserCheck, UserX, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  user_type: z.string().optional(),
  wallet_name: z.string().optional(),
  wallet_group_name: z.string().optional(),
  create_categories: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

const UsersPage: React.FC = () => {
  const { users, selectedUser, setSelectedUser, isLoading, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      user_type: 'regular',
      create_categories: true,
      wallet_name: 'My Wallet',
      wallet_group_name: 'Personal',
    },
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.username?.toLowerCase().includes(query)
    );
  });

  const handleCreateUser = async (data: UserFormData) => {
    setIsSubmitting(true);
    try {
      await createUser({
        username: data.username,
        name: data.name,
        email: data.email,
        password: data.password || 'defaultPassword123!',
        user_type: data.user_type || 'regular',
        wallet_name: data.wallet_name,
        wallet_group_name: data.wallet_group_name,
        create_categories: data.create_categories ?? true,
      });
      toast.success('User created successfully');
      setIsFormOpen(false);
      reset();
      refreshData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(editingUser.id, {
        username: data.username,
        name: data.name,
        email: data.email,
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      reset();
      refreshData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    reset({
      username: user.username,
      name: user.name,
      email: user.email,
    });
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => { reset(); setIsFormOpen(true); }} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Summary */}
      <motion.div
        className="bg-card rounded-xl shadow-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <UsersIcon className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-3xl font-heading font-bold text-foreground">
              {users.length}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {users.filter(u => u.user_type === 'admin').length} admin{users.filter(u => u.user_type === 'admin').length !== 1 ? 's' : ''}, {users.filter(u => u.user_type !== 'admin').length} regular
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-card-hover transition-all cursor-pointer ${selectedUser?.id === user.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); openEditForm(user); }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.user_type === 'admin' ? 'default' : 'secondary'}>
                        {user.user_type === 'admin' ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Regular
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="👤"
          title={searchQuery ? 'No users found' : 'No users yet'}
          description={searchQuery ? 'Try a different search term' : 'Create your first user to get started'}
          action={{
            label: 'Create User',
            onClick: () => setIsFormOpen(true),
          }}
        />
      )}

      {/* Create User Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create User</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(handleCreateUser)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register('username')} placeholder="johndoe" />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register('name')} placeholder="John Doe" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} placeholder="john@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="wallet_name">Default Wallet Name</Label>
              <Input id="wallet_name" {...register('wallet_name')} placeholder="My Wallet" />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-primary" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create User'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Edit User Sheet */}
      <Sheet open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit(handleUpdateUser)} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input id="edit-username" {...register('username')} placeholder="johndoe" />
              {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" {...register('name')} placeholder="John Doe" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" {...register('email')} placeholder="john@example.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gradient-primary" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
};

export default UsersPage;
