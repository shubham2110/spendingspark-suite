import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Transaction } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onClick?: (transaction: Transaction) => void;
  showActions?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onClick,
  showActions = true,
}) => {
  // Group transactions by date
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = transaction.transaction_time 
      ? format(new Date(transaction.transaction_time), 'yyyy-MM-dd')
      : format(new Date(transaction.entry_time || new Date()), 'yyyy-MM-dd');
    
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No transactions yet</h3>
        <p className="text-sm text-muted-foreground">Start tracking your expenses!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {sortedDates.map((date) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <span className="text-sm font-medium text-muted-foreground">
                {groupedTransactions[date].reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </span>
            </div>

            <div className="bg-card rounded-xl shadow-card overflow-hidden">
              {groupedTransactions[date].map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  className={cn(
                    "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                    index !== 0 && "border-t border-border"
                  )}
                  onClick={() => onClick?.(transaction)}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Category Icon */}
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                    transaction.amount >= 0 ? "bg-income/10" : "bg-expense/10"
                  )}>
                    {transaction.category?.icon || (transaction.amount >= 0 ? '💰' : '💸')}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {transaction.category?.name || 'Uncategorized'}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {transaction.note || transaction.person_name || 'No description'}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      transaction.amount >= 0 ? "text-income" : "text-expense"
                    )}>
                      {transaction.amount >= 0 ? '+' : ''}
                      {transaction.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(transaction);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete?.(transaction);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
