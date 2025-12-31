import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Wallet } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const walletSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  icon: z.string().max(10).optional(),
  balance: z.number().optional(),
  is_enabled: z.boolean().optional(),
});

type WalletFormData = z.infer<typeof walletSchema>;

const WALLET_ICONS = ['💰', '💵', '💳', '🏦', '💎', '🪙', '📈', '🎯', '🏠', '🚗', '✈️', '🎓'];

interface WalletFormProps {
  wallet?: Wallet;
  onSubmit: (data: WalletFormData) => Promise<void>;
  onCancel: () => void;
}

export const WalletForm: React.FC<WalletFormProps> = ({
  wallet,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(wallet?.icon || '💰');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: wallet?.name || '',
      icon: wallet?.icon || '💰',
      balance: wallet?.balance || 0,
      is_enabled: wallet?.is_enabled ?? true,
    },
  });

  const isEnabled = watch('is_enabled');

  const handleFormSubmit = async (data: WalletFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, icon: selectedIcon });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Icon Selection */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-6 gap-2">
          {WALLET_ICONS.map((icon) => (
            <button
              key={icon}
              type="button"
              className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                selectedIcon === icon
                  ? 'bg-primary text-primary-foreground shadow-card'
                  : 'bg-muted hover:bg-accent'
              }`}
              onClick={() => {
                setSelectedIcon(icon);
                setValue('icon', icon);
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Wallet Name</Label>
        <Input
          id="name"
          placeholder="e.g., Main Wallet"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Initial Balance */}
      <div className="space-y-2">
        <Label htmlFor="balance">Initial Balance</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
            $
          </span>
          <Input
            id="balance"
            type="number"
            step="0.01"
            placeholder="0.00"
            className="pl-8"
            {...register('balance', { valueAsNumber: true })}
          />
        </div>
        {errors.balance && (
          <p className="text-sm text-destructive">{errors.balance.message}</p>
        )}
      </div>

      {/* Enabled Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
        <div>
          <Label htmlFor="is_enabled" className="font-medium">Active Wallet</Label>
          <p className="text-sm text-muted-foreground">Include in total balance</p>
        </div>
        <Switch
          id="is_enabled"
          checked={isEnabled}
          onCheckedChange={(checked) => setValue('is_enabled', checked)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 gradient-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            wallet ? 'Update Wallet' : 'Create Wallet'
          )}
        </Button>
      </div>
    </form>
  );
};
