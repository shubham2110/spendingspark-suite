import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { checkServerStatus, initDatabase } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PiggyBank, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';
import { toast } from 'sonner';

const initSchema = z.object({
  force_migrate: z.boolean().optional(),
  default_wallet_name: z.string().min(1, 'Wallet name is required').max(50),
  admin_username: z.string().min(3, 'Username must be at least 3 characters').max(50),
  admin_password: z.string().min(6, 'Password must be at least 6 characters'),
  admin_email: z.string().email('Invalid email address'),
  admin_name: z.string().min(1, 'Name is required').max(100),
});

type InitFormData = z.infer<typeof initSchema>;

interface InitializationScreenProps {
  onInitialized: () => void;
}

export const InitializationScreen: React.FC<InitializationScreenProps> = ({ onInitialized }) => {
  const [status, setStatus] = useState<'checking' | 'not_initialized' | 'initialized' | 'error'>('checking');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InitFormData>({
    resolver: zodResolver(initSchema),
    defaultValues: {
      force_migrate: false,
      default_wallet_name: 'My Wallet',
      admin_username: 'admin',
      admin_password: '',
      admin_email: '',
      admin_name: 'Administrator',
    },
  });

  const forceMigrate = watch('force_migrate');

  useEffect(() => {
    checkInitStatus();
  }, []);

  const checkInitStatus = async () => {
    setStatus('checking');
    setErrorMessage(null);

    try {
      const response = await checkServerStatus();

      // The API returns the initialization status
      // If initialized, response should be true
      const isInitialized = response === true || response === 'true' || (typeof response === 'string' && response.toLowerCase() === 'true') || response?.initialized === true;
      if (isInitialized) {
        setStatus('initialized');
        setTimeout(() => onInitialized(), 1000);
      } else {
        setStatus('not_initialized');
      }
    } catch (error: any) {

      // If the endpoint returns 404 or other error indicating not initialized
      if (error.response?.status === 404 || error.response?.status === 500) {
        setStatus('not_initialized');
      } else {
        // Server might be down or other error - still show init form
        setStatus('not_initialized');
        setErrorMessage('Could not connect to server. Please ensure the API is running.');
      }
    }
  };

  const handleInitialize = async (data: InitFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await initDatabase({
        force_migrate: data.force_migrate,
        default_wallet_name: data.default_wallet_name,
        admin_username: data.admin_username,
        admin_password: data.admin_password,
        admin_email: data.admin_email,
        admin_name: data.admin_name,
      });
      
      toast.success('Database initialized successfully!');
      setStatus('initialized');
      setTimeout(() => onInitialized(), 1500);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to initialize database';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Checking status
  if (status === 'checking') {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <PiggyBank className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            MoneyLover
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking server status...</span>
          </div>
        </div>
      </div>
    );
  }

  // Already initialized
  if (status === 'initialized') {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-income flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <CheckCircle className="w-10 h-10 text-income-foreground" />
          </motion.div>
          
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">
            Ready to go!
          </h1>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  // Not initialized - show form
  return (
    <div className="fixed inset-0 bg-background overflow-auto">
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
              <Database className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Initialize Database
            </h1>
            <p className="text-muted-foreground mt-2">
              Set up your MoneyLover instance
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMessage}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleInitialize)} className="space-y-5">
            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-heading font-semibold text-foreground">Admin Account</h2>
              
              <div className="space-y-2">
                <Label htmlFor="admin_name">Full Name</Label>
                <Input
                  id="admin_name"
                  placeholder="Administrator"
                  {...register('admin_name')}
                />
                {errors.admin_name && (
                  <p className="text-sm text-destructive">{errors.admin_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_username">Username</Label>
                <Input
                  id="admin_username"
                  placeholder="admin"
                  {...register('admin_username')}
                />
                {errors.admin_username && (
                  <p className="text-sm text-destructive">{errors.admin_username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  placeholder="admin@example.com"
                  {...register('admin_email')}
                />
                {errors.admin_email && (
                  <p className="text-sm text-destructive">{errors.admin_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_password">Password</Label>
                <Input
                  id="admin_password"
                  type="password"
                  placeholder="••••••••"
                  {...register('admin_password')}
                />
                {errors.admin_password && (
                  <p className="text-sm text-destructive">{errors.admin_password.message}</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6 space-y-4">
              <h2 className="font-heading font-semibold text-foreground">Default Wallet</h2>
              
              <div className="space-y-2">
                <Label htmlFor="default_wallet_name">Wallet Name</Label>
                <Input
                  id="default_wallet_name"
                  placeholder="My Wallet"
                  {...register('default_wallet_name')}
                />
                {errors.default_wallet_name && (
                  <p className="text-sm text-destructive">{errors.default_wallet_name.message}</p>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="force_migrate" className="font-medium">Force Migration</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reset database if it already exists
                  </p>
                </div>
                <Switch
                  id="force_migrate"
                  checked={forceMigrate}
                  onCheckedChange={(checked) => setValue('force_migrate', checked)}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 gradient-primary text-lg font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5 mr-2" />
                  Initialize Database
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={checkInitStatus}
              disabled={isSubmitting}
            >
              Check Status Again
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
