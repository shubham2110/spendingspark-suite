import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Category } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  icon: z.string().max(10).optional(),
  is_global: z.boolean().optional(),
  parent_id: z.number().nullable().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const CATEGORY_ICONS = [
  '🍔', '🍕', '☕', '🛒', '🚗', '✈️', '🏠', '💡', '📱', '🎬',
  '🎮', '🏥', '💊', '🎓', '📚', '👕', '💄', '🎁', '💰', '💳',
];

interface CategoryFormProps {
  category?: Category;
  parentCategory?: Category;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  parentCategory,
  onSubmit,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '📁');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || '📁',
      is_global: category?.is_global ?? false,
      parent_id: parentCategory?.id || category?.parent_id || null,
    },
  });

  const isGlobal = watch('is_global');

  const handleFormSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, icon: selectedIcon });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Parent Info */}
      {parentCategory && (
        <div className="p-3 bg-accent rounded-lg">
          <p className="text-sm text-muted-foreground">Adding subcategory to</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl">{parentCategory.icon}</span>
            <span className="font-medium">{parentCategory.name}</span>
          </div>
        </div>
      )}

      {/* Icon Selection */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-5 gap-2">
          {CATEGORY_ICONS.map((icon) => (
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
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          placeholder="e.g., Food & Dining"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Global Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
        <div>
          <Label htmlFor="is_global" className="font-medium">Global Category</Label>
          <p className="text-sm text-muted-foreground">Sync to all wallets</p>
        </div>
        <Switch
          id="is_global"
          checked={isGlobal}
          onCheckedChange={(checked) => setValue('is_global', checked)}
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
            category ? 'Update Category' : 'Create Category'
          )}
        </Button>
      </div>
    </form>
  );
};
