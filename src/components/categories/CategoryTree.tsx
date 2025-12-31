import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category } from '@/lib/api';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CategoryTreeProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (category: Category) => void;
  onAddChild?: (parentCategory: Category) => void;
}

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  onEdit,
  onDelete,
  onAddChild,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

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

    return (
      <div key={category.id}>
        <motion.div
          className={cn(
            "group flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors",
            level > 0 && "ml-8"
          )}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Expand/Collapse Button */}
          <button
            className={cn(
              "w-6 h-6 flex items-center justify-center rounded transition-colors",
              hasChildren ? "hover:bg-accent" : "opacity-0"
            )}
            onClick={() => hasChildren && toggleCategory(category.id)}
            disabled={!hasChildren}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )
            )}
          </button>

          {/* Icon */}
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-xl">
            {category.icon || '📁'}
          </div>

          {/* Name */}
          <div className="flex-1">
            <p className="font-medium text-foreground">{category.name}</p>
            {category.is_global && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Global
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
              onClick={() => onAddChild?.(category)}
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent"
              onClick={() => onEdit?.(category)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete?.(category)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Children */}
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

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-3xl">🏷️</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No categories yet</h3>
        <p className="text-sm text-muted-foreground">Create your first category to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {categories.map((category) => renderCategoryItem(category))}
    </div>
  );
};
