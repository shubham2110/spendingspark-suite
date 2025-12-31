import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Wallet, Category, Transaction, getUsers, getWallets, getCategoryTree, getTransactions } from '@/lib/api';
import { toast } from 'sonner';

interface AppContextType {
  users: User[];
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  selectedWallet: Wallet | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  setSelectedWallet: (wallet: Wallet | null) => void;
  setSelectedUser: (user: User | null) => void;
  refreshData: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshWallets: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersData, walletsData, transactionsData] = await Promise.all([
        getUsers(),
        getWallets(),
        getTransactions(),
      ]);
      


      setUsers(Array.isArray(usersData) ? usersData : []);
      setWallets(Array.isArray(walletsData) ? walletsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);

      // Set default selections
      if (!selectedUser && usersData?.length > 0) {
        setSelectedUser(usersData[0]);
      }
      if (!selectedWallet && walletsData?.length > 0) {
        setSelectedWallet(walletsData[0]);
        // Fetch categories for the first wallet
        const categoriesData = await getCategoryTree(walletsData[0].id);
        setCategories(categoriesData || []);
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
      toast.error('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to refresh transactions');
    }
  };

  const refreshWallets = async () => {
    try {
      const data = await getWallets();
      setWallets(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error('Failed to refresh wallets');
    }
  };

  const refreshCategories = async () => {
    if (selectedWallet) {
      try {
        const data = await getCategoryTree(selectedWallet.id);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err: any) {
        toast.error('Failed to refresh categories');
      }
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedWallet) {
      refreshCategories();
    }
  }, [selectedWallet]);

  return (
    <AppContext.Provider
      value={{
        users,
        wallets,
        categories,
        transactions,
        selectedWallet,
        selectedUser,
        isLoading,
        error,
        setSelectedWallet,
        setSelectedUser,
        refreshData,
        refreshTransactions,
        refreshWallets,
        refreshCategories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
