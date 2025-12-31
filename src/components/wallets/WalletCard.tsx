import React from 'react';
import { motion } from 'framer-motion';
import { Wallet } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WalletCardProps {
  wallet: Wallet;
  isSelected?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      className={cn(
        "relative p-5 rounded-xl cursor-pointer transition-all duration-300",
        isSelected 
          ? "gradient-primary text-primary-foreground shadow-glow" 
          : "bg-card shadow-card hover:shadow-card-hover"
      )}
      onClick={onClick}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-3 right-3 h-8 w-8",
              isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-muted"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Icon */}
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4",
        isSelected ? "bg-primary-foreground/20" : "bg-muted"
      )}>
        {wallet.icon || '💰'}
      </div>

      {/* Wallet Info */}
      <h3 className={cn(
        "font-heading font-semibold text-lg mb-1",
        isSelected ? "text-primary-foreground" : "text-foreground"
      )}>
        {wallet.name}
      </h3>

      {/* Balance */}
      <p className={cn(
        "text-2xl font-bold font-heading",
        isSelected ? "text-primary-foreground" : "text-foreground"
      )}>
        ${wallet.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
      </p>

      {/* Status */}
      <div className="flex items-center gap-2 mt-3">
        <span className={cn(
          "w-2 h-2 rounded-full",
          wallet.is_enabled ? "bg-income" : "bg-muted-foreground"
        )} />
        <span className={cn(
          "text-xs",
          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>
          {wallet.is_enabled ? 'Active' : 'Inactive'}
        </span>
      </div>
    </motion.div>
  );
};
