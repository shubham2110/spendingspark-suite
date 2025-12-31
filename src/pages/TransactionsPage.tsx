import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { EmptyState } from '@/components/common/EmptyState';
import { Transaction, createTransaction, updateTransaction, deleteTransaction } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

type DateFilter = 'all' | 'today' | 'week' | 'month' | 'custom';
type TypeFilter = 'all' | 'income' | 'expense';
type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    transactions, 
    categories, 
    selectedWallet, 
    selectedUser,
    isLoading,
    refreshTransactions 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.note?.toLowerCase().includes(query) ||
        t.person_name?.toLowerCase().includes(query) ||
        t.category?.name?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter === 'income') {
      filtered = filtered.filter(t => t.amount >= 0);
    } else if (typeFilter === 'expense') {
      filtered = filtered.filter(t => t.amount < 0);
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'today') {
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      filtered = filtered.filter(t => {
        const date = new Date(t.transaction_time || t.entry_time || 0);
        return date >= todayStart;
      });
    } else if (dateFilter === 'week') {
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      filtered = filtered.filter(t => {
        const date = new Date(t.transaction_time || t.entry_time || 0);
        return date >= weekStart && date <= weekEnd;
      });
    } else if (dateFilter === 'month') {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      filtered = filtered.filter(t => {
        const date = new Date(t.transaction_time || t.entry_time || 0);
        return date >= monthStart && date <= monthEnd;
      });
    } else if (dateFilter === 'custom' && dateRange?.from) {
      filtered = filtered.filter(t => {
        const date = new Date(t.transaction_time || t.entry_time || 0);
        const fromDate = dateRange.from!;
        const toDate = dateRange.to || fromDate;
        return date >= fromDate && date <= toDate;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.transaction_time || a.entry_time || 0);
      const dateB = new Date(b.transaction_time || b.entry_time || 0);
      
      switch (sortOption) {
        case 'date-desc':
          return dateB.getTime() - dateA.getTime();
        case 'date-asc':
          return dateA.getTime() - dateB.getTime();
        case 'amount-desc':
          return Math.abs(b.amount) - Math.abs(a.amount);
        case 'amount-asc':
          return Math.abs(a.amount) - Math.abs(b.amount);
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, searchQuery, dateFilter, typeFilter, sortOption, dateRange]);

  // Calculate totals
  const totals = useMemo(() => {
    const income = filteredTransactions.filter(t => t.amount >= 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    return { income, expenses, net: income - expenses };
  }, [filteredTransactions]);

  const handleCreateTransaction = async (data: any) => {
    if (!selectedWallet || !selectedUser) {
      toast.error('Please select a wallet and user');
      return;
    }

    try {
      const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
      await createTransaction({
        wallet_id: selectedWallet.id,
        category_id: data.category_id,
        amount,
        note: data.note,
        person_name: data.person_name,
        user_id: selectedUser.id,
      });
      toast.success('Transaction created successfully');
      setIsFormOpen(false);
      refreshTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create transaction');
    }
  };

  const handleUpdateTransaction = async (data: any) => {
    if (!editingTransaction) return;

    try {
      const amount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
      await updateTransaction(editingTransaction.id, {
        category_id: data.category_id,
        amount,
        note: data.note,
        person_name: data.person_name,
      });
      toast.success('Transaction updated successfully');
      setEditingTransaction(null);
      refreshTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update transaction');
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    try {
      await deleteTransaction(deletingTransaction.id);
      toast.success('Transaction deleted successfully');
      setDeletingTransaction(null);
      refreshTransactions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete transaction');
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
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
          <h1 className="text-3xl font-heading font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your financial activities
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-income" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Income</p>
            <p className="text-xl font-bold text-income">
              +${totals.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
            <TrendingDown className="w-6 h-6 text-expense" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold text-expense">
              -${totals.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net</p>
            <p className={`text-xl font-bold ${totals.net >= 0 ? 'text-income' : 'text-expense'}`}>
              {totals.net >= 0 ? '+' : ''}${totals.net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Date Filter */}
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>

        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px]">
                {dateRange?.from ? (
                  dateRange.to ? (
                    `${format(dateRange.from, 'MMM dd')} - ${format(dateRange.to, 'MMM dd')}`
                  ) : (
                    format(dateRange.from, 'MMM dd, yyyy')
                  )
                ) : (
                  'Pick a date range'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        )}

        {/* Type Filter */}
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
          <SelectTrigger className="w-[140px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="amount-desc">Highest Amount</SelectItem>
            <SelectItem value="amount-asc">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      {filteredTransactions.length > 0 ? (
        <TransactionList
          transactions={filteredTransactions}
          onEdit={(t) => setEditingTransaction(t)}
          onDelete={(t) => setDeletingTransaction(t)}
        />
      ) : (
        <EmptyState
          icon="💸"
          title="No transactions found"
          description={searchQuery || dateFilter !== 'all' || typeFilter !== 'all' 
            ? "Try adjusting your filters" 
            : "Start tracking your expenses by adding your first transaction"}
          action={{
            label: 'Add Transaction',
            onClick: () => setIsFormOpen(true),
          }}
        />
      )}

      {/* Create Transaction Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Transaction</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <TransactionForm
              onSubmit={handleCreateTransaction}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Edit Transaction Sheet */}
      <Sheet open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Transaction</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {editingTransaction && (
              <TransactionForm
                transaction={editingTransaction}
                onSubmit={handleUpdateTransaction}
                onCancel={() => setEditingTransaction(null)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingTransaction}
        onOpenChange={() => setDeletingTransaction(null)}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteTransaction}
      />
    </motion.div>
  );
};

export default TransactionsPage;
