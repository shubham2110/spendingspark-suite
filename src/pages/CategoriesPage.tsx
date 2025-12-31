import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { CategoryTree } from '@/components/categories/CategoryTree';
import { CategoryForm } from '@/components/categories/CategoryForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { Category, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, Tags } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const { categories, selectedWallet, isLoading, refreshCategories } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Count total categories
  const countCategories = (cats: Category[]): number => {
    return cats.reduce((sum, cat) => sum + 1 + countCategories(cat.children || []), 0);
  };
  const totalCategories = countCategories(categories);

  const handleCreateCategory = async (data: any) => {
    if (!selectedWallet) {
      toast.error('Please select a wallet first');
      return;
    }

    try {
      await createCategory(selectedWallet.id, {
        name: data.name,
        icon: data.icon,
        parent_id: parentCategory?.id || null,
        is_global: data.is_global,
      });
      toast.success('Category created successfully');
      setIsFormOpen(false);
      setParentCategory(null);
      refreshCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (data: any) => {
    if (!selectedWallet || !editingCategory) return;

    try {
      await updateCategory(selectedWallet.id, editingCategory.id, {
        name: data.name,
        icon: data.icon,
        is_global: data.is_global,
      });
      toast.success('Category updated successfully');
      setEditingCategory(null);
      refreshCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedWallet || !deletingCategory) return;

    try {
      await deleteCategory(selectedWallet.id, deletingCategory.id);
      toast.success('Category deleted successfully');
      setDeletingCategory(null);
      refreshCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const handleAddChild = (parent: Category) => {
    setParentCategory(parent);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!selectedWallet) {
    return (
      <EmptyState
        icon="💰"
        title="No wallet selected"
        description="Please select a wallet to manage categories"
      />
    );
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
          <h1 className="text-3xl font-heading font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your transactions with categories
          </p>
        </div>
        <Button onClick={() => { setParentCategory(null); setIsFormOpen(true); }} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
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
            <Tags className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Categories in {selectedWallet.name}</p>
            <p className="text-3xl font-heading font-bold text-foreground">
              {totalCategories}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Organize your transactions
            </p>
          </div>
        </div>
      </motion.div>

      {/* Categories Tree */}
      <div className="bg-card rounded-xl shadow-card p-4">
        {categories.length > 0 ? (
          <CategoryTree
            categories={categories}
            onEdit={(cat) => setEditingCategory(cat)}
            onDelete={(cat) => setDeletingCategory(cat)}
            onAddChild={handleAddChild}
          />
        ) : (
          <EmptyState
            icon="🏷️"
            title="No categories yet"
            description="Create categories to organize your transactions"
            action={{
              label: 'Create Category',
              onClick: () => setIsFormOpen(true),
            }}
          />
        )}
      </div>

      {/* Create Category Sheet */}
      <Sheet open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) setParentCategory(null); }}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {parentCategory ? 'Add Subcategory' : 'Create Category'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <CategoryForm
              parentCategory={parentCategory || undefined}
              onSubmit={handleCreateCategory}
              onCancel={() => { setIsFormOpen(false); setParentCategory(null); }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Category Sheet */}
      <Sheet open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editingCategory && (
              <CategoryForm
                category={editingCategory}
                onSubmit={handleUpdateCategory}
                onCancel={() => setEditingCategory(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? ${deletingCategory?.children?.length ? 'This will also delete all subcategories.' : ''}`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteCategory}
      />
    </motion.div>
  );
};

export default CategoriesPage;
