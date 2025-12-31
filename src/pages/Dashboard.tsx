import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { StatCard } from '@/components/ui/stat-card';
import { TransactionList } from '@/components/transactions/TransactionList';
import { WalletCard } from '@/components/wallets/WalletCard';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Plus,
  PieChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    wallets, 
    transactions, 
    selectedWallet, 
    setSelectedWallet, 
    isLoading, 
    categories 
  } = useApp();

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.transaction_time || t.entry_time || now);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });

    const totalBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
    const income = monthTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = Math.abs(monthTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const transactionCount = monthTransactions.length;

    return { totalBalance, income, expenses, transactionCount };
  }, [wallets, transactions]);

  // Get recent transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(a.transaction_time || a.entry_time || 0);
        const dateB = new Date(b.transaction_time || b.entry_time || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);
  }, [transactions]);

  // Calculate spending by category
  const categorySpending = useMemo(() => {
    const spending: Record<number, { category: typeof categories[0], total: number }> = {};
    
    transactions.filter(t => t.amount < 0).forEach(t => {
      if (!spending[t.category_id]) {
        const cat = categories.find(c => c.id === t.category_id);
        if (cat) {
          spending[t.category_id] = { category: cat, total: 0 };
        }
      }
      if (spending[t.category_id]) {
        spending[t.category_id].total += Math.abs(t.amount);
      }
    });

    return Object.values(spending)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [transactions, categories]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {format(new Date(), 'MMMM yyyy')} Overview
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={`$${stats.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${wallets.length} wallets`}
          icon={Wallet}
          variant="primary"
        />
        <StatCard
          title="Income"
          value={`$${stats.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="This month"
          icon={TrendingUp}
          variant="income"
          trend="up"
          trendValue="+12% from last month"
        />
        <StatCard
          title="Expenses"
          value={`$${stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="This month"
          icon={TrendingDown}
          variant="expense"
          trend="down"
          trendValue="-5% from last month"
        />
        <StatCard
          title="Transactions"
          value={stats.transactionCount}
          subtitle="This month"
          icon={ArrowUpDown}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Recent Transactions
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/transactions')}
                className="text-primary hover:text-primary/80"
              >
                View All →
              </Button>
            </div>
            <TransactionList
              transactions={recentTransactions}
              showActions={false}
              onClick={(t) => navigate(`/transactions/${t.id}`)}
            />
          </div>
        </motion.div>

        {/* Spending by Category */}
        <motion.div variants={itemVariants}>
          <div className="bg-card rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold text-foreground">
                Top Spending
              </h2>
              <PieChart className="w-5 h-5 text-muted-foreground" />
            </div>

            {categorySpending.length > 0 ? (
              <div className="space-y-3">
                {categorySpending.map(({ category, total }, index) => (
                  <motion.div
                    key={category.id}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                      {category.icon || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {category.name}
                      </p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{
                            width: `${(total / categorySpending[0].total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-expense">
                      ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No spending data yet
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Wallets */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-semibold text-foreground">
            Your Wallets
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/wallets')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wallets.slice(0, 4).map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              isSelected={selectedWallet?.id === wallet.id}
              onClick={() => setSelectedWallet(wallet)}
              onEdit={() => navigate(`/wallets/${wallet.id}/edit`)}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
