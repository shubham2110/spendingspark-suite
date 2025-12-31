import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Category, Transaction } from '@/lib/api';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { Calendar, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  note: z.string().max(200, 'Note must be less than 200 characters').optional(),
  person_name: z.string().max(100, 'Person name must be less than 100 characters').optional(),
  category_id: z.number().min(1, 'Please select a category'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData & { type: 'income' | 'expense' }) => Promise<void>;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
}) => {
  const { categories, selectedWallet } = useApp();
  const [type, setType] = useState<'income' | 'expense'>(
    transaction?.amount && transaction.amount >= 0 ? 'income' : 'expense'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: transaction ? Math.abs(transaction.amount) : undefined,
      note: transaction?.note || '',
      person_name: transaction?.person_name || '',
      category_id: transaction?.category_id,
    },
  });

  const selectedCategoryId = watch('category_id');

  const handleFormSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({ ...data, type });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryItem = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <div key={category.id}>
        <motion.div
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
            isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            level > 0 && "ml-6"
          )}
          onClick={() => {
            setValue('category_id', category.id);
            if (hasChildren) toggleCategory(category.id);
          }}
          whileHover={{ x: 2 }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <span className="text-xl">{category.icon || '📁'}</span>
          <span className="font-medium text-sm">{category.name}</span>
        </motion.div>
        
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              {category.children!.map((child) => renderCategoryItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Transaction Type */}
      <Tabs value={type} onValueChange={(v) => setType(v as 'income' | 'expense')}>
        <TabsList className="w-full grid grid-cols-2 h-12">
          <TabsTrigger 
            value="expense" 
            className="data-[state=active]:bg-expense data-[state=active]:text-expense-foreground"
          >
            Expense
          </TabsTrigger>
          <TabsTrigger 
            value="income"
            className="data-[state=active]:bg-income data-[state=active]:text-income-foreground"
          >
            Income
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
            $
          </span>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            className={cn(
              "pl-12 text-3xl font-bold h-16",
              type === 'expense' ? "text-expense" : "text-income"
            )}
            {...register('amount', { valueAsNumber: true })}
          />
        </div>
        {errors.amount && (
          <p className="text-sm text-destructive">{errors.amount.message}</p>
        )}
      </div>

      {/* Category Selection */}
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="bg-muted/50 rounded-xl p-2 max-h-64 overflow-y-auto scrollbar-hide">
          {categories.length > 0 ? (
            categories.map((category) => renderCategoryItem(category))
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No categories available
            </p>
          )}
        </div>
        {errors.category_id && (
          <p className="text-sm text-destructive">{errors.category_id.message}</p>
        )}
      </div>

      {/* Note */}
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          placeholder="Add a note..."
          className="resize-none"
          rows={3}
          {...register('note')}
        />
        {errors.note && (
          <p className="text-sm text-destructive">{errors.note.message}</p>
        )}
      </div>

      {/* Person Name */}
      <div className="space-y-2">
        <Label htmlFor="person_name">With (optional)</Label>
        <Input
          id="person_name"
          placeholder="Person or place name..."
          {...register('person_name')}
        />
        {errors.person_name && (
          <p className="text-sm text-destructive">{errors.person_name.message}</p>
        )}
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
          className={cn(
            "flex-1",
            type === 'expense' ? "gradient-expense" : "gradient-income"
          )}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            transaction ? 'Update Transaction' : 'Add Transaction'
          )}
        </Button>
      </div>
    </form>
  );
};
