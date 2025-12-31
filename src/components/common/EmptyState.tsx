import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon | string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        {typeof Icon === 'string' ? (
          <span className="text-4xl">{Icon}</span>
        ) : Icon ? (
          <Icon className="w-10 h-10 text-muted-foreground" />
        ) : (
          <span className="text-4xl">📭</span>
        )}
      </div>
      
      <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground max-w-sm mb-6">
          {description}
        </p>
      )}
      
      {action && (
        <Button onClick={action.onClick} className="gradient-primary">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
};
