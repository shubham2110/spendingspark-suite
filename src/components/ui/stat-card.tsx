import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'income' | 'expense' | 'primary';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-card',
    income: 'bg-card border-l-4 border-l-income',
    expense: 'bg-card border-l-4 border-l-expense',
    primary: 'gradient-primary text-primary-foreground',
  };

  const iconBg = {
    default: 'bg-muted',
    income: 'bg-income/10',
    expense: 'bg-expense/10',
    primary: 'bg-primary-foreground/20',
  };

  const iconColor = {
    default: 'text-muted-foreground',
    income: 'text-income',
    expense: 'text-expense',
    primary: 'text-primary-foreground',
  };

  return (
    <motion.div
      className={cn(
        "rounded-xl p-5 shadow-card transition-all duration-300 hover:shadow-card-hover",
        variants[variant],
        className
      )}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold mt-1 font-heading",
            variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs mt-1",
              variant === 'primary' ? 'text-primary-foreground/70' : 'text-muted-foreground'
            )}>
              {subtitle}
            </p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                "text-xs font-medium",
                trend === 'up' && 'text-income',
                trend === 'down' && 'text-expense',
                trend === 'neutral' && 'text-muted-foreground'
              )}>
                {trend === 'up' && '↑'}
                {trend === 'down' && '↓'}
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            iconBg[variant]
          )}>
            <Icon className={cn("w-5 h-5", iconColor[variant])} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
