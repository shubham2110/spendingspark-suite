import axios from 'axios';

const API_BASE_URL = 'https://ml.xlr.ovh/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  user_type: string;
  wallets?: Wallet[];
}

export interface Wallet {
  id: number;
  name: string;
  icon: string;
  is_enabled: boolean;
  balance: number;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  parent_id: number | null;
  is_global: boolean;
  children?: Category[];
}

export interface Transaction {
  id: number;
  wallet_id: number;
  category_id: number;
  amount: number;
  person_name?: string;
  note?: string;
  user_id: number;
  transaction_time?: string;
  entry_time?: string;
  last_modified_time?: string;
  category?: Category;
  wallet?: Wallet;
}

export interface Person {
  id: number;
  person_name: string;
  alias?: string;
}

export interface WalletGroup {
  id: number;
  wallet_group_name: string;
  wallets?: Wallet[];
}

// Init API
export const checkServerStatus = async () => {
  const response = await api.get('/initdone');
  return response.data;
};

export const initDatabase = async (data: {
  force_migrate?: boolean;
  default_wallet_name: string;
  admin_username: string;
  admin_password: string;
  admin_email: string;
  admin_name: string;
}) => {
  const response = await api.post('/init', data);
  return response.data;
};

// Users API
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (data: {
  username: string;
  name: string;
  email: string;
  password: string;
  user_type?: string;
  wallet_name?: string;
  wallet_group_name?: string;
  create_categories?: boolean;
}): Promise<User> => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: number, data: Partial<User>): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const getUserWallets = async (userId: number): Promise<Wallet[]> => {
  const response = await api.get(`/users/${userId}/wallets`);
  return response.data;
};

export const addUserToWallet = async (userId: number, walletId: number) => {
  const response = await api.post(`/users/${userId}/wallets/${walletId}`);
  return response.data;
};

export const removeUserFromWallet = async (userId: number, walletId: number) => {
  const response = await api.delete(`/users/${userId}/wallets/${walletId}`);
  return response.data;
};

// Wallets API
export const getWallets = async (): Promise<Wallet[]> => {
  const response = await api.get('/wallets');
  return response.data;
};

export const getWallet = async (id: number): Promise<Wallet> => {
  const response = await api.get(`/wallets/${id}`);
  return response.data;
};

export const createWallet = async (data: {
  name: string;
  icon?: string;
  is_enabled?: boolean;
  balance?: number;
}): Promise<Wallet> => {
  const response = await api.post('/wallets', data);
  return response.data;
};

export const updateWallet = async (id: number, data: Partial<Wallet>): Promise<Wallet> => {
  const response = await api.put(`/wallets/${id}`, data);
  return response.data;
};

export const deleteWallet = async (id: number) => {
  const response = await api.delete(`/wallets/${id}`);
  return response.data;
};

// Categories API
export const getCategories = async (walletId: number): Promise<Category[]> => {
  const response = await api.get(`/wallets/${walletId}/categories`);
  return response.data;
};

export const getCategoryTree = async (walletId: number): Promise<Category[]> => {
  const response = await api.get(`/wallets/${walletId}/categories/tree`);
  return response.data;
};

export const createCategory = async (walletId: number, data: {
  name: string;
  icon?: string;
  parent_id?: number | null;
  is_global?: boolean;
}): Promise<Category> => {
  const response = await api.post(`/wallets/${walletId}/categories`, data);
  return response.data;
};

export const updateCategory = async (walletId: number, categoryId: number, data: Partial<Category>): Promise<Category> => {
  const response = await api.put(`/wallets/${walletId}/categories/${categoryId}`, data);
  return response.data;
};

export const deleteCategory = async (walletId: number, categoryId: number) => {
  const response = await api.delete(`/wallets/${walletId}/categories/${categoryId}`);
  return response.data;
};

// Transactions API
export interface TransactionFilters {
  user_id?: number;
  wallet_id?: number;
  category_ids?: string;
  person_id?: number;
  start_transaction_time?: string;
  end_transaction_time?: string;
  start_entry_time?: string;
  end_entry_time?: string;
  amount_op?: 'gt' | 'lt' | 'eq' | 'ge' | 'le';
  amount_value?: number;
  fuzzy_note?: string;
}

export const getTransactions = async (filters?: TransactionFilters): Promise<Transaction[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  const response = await api.get(`/transactions${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

export const getWalletTransactions = async (walletId: number, filters?: TransactionFilters): Promise<Transaction[]> => {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  const response = await api.get(`/wallets/${walletId}/transactions${params.toString() ? `?${params.toString()}` : ''}`);
  return response.data;
};

export const getTransaction = async (id: number): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (data: {
  wallet_id: number;
  category_id: number;
  amount: number;
  person_name?: string;
  note?: string;
  user_id: number;
}): Promise<Transaction> => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const updateTransaction = async (id: number, data: Partial<Transaction>): Promise<Transaction> => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: number) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// Persons API
export const getPersons = async (): Promise<Person[]> => {
  const response = await api.get('/persons');
  return response.data;
};

export const createPerson = async (data: {
  person_name: string;
  alias?: string;
}): Promise<Person> => {
  const response = await api.post('/persons', data);
  return response.data;
};

export const updatePerson = async (id: number, data: Partial<Person>): Promise<Person> => {
  const response = await api.put(`/persons/${id}`, data);
  return response.data;
};

export const deletePerson = async (id: number) => {
  const response = await api.delete(`/persons/${id}`);
  return response.data;
};

// Wallet Groups API
export const getWalletGroups = async (): Promise<WalletGroup[]> => {
  const response = await api.get('/walletgroups');
  return response.data;
};

export const createWalletGroup = async (data: { wallet_group_name: string }): Promise<WalletGroup> => {
  const response = await api.post('/walletgroups', data);
  return response.data;
};

export const updateWalletGroup = async (id: number, data: { wallet_group_name: string }): Promise<WalletGroup> => {
  const response = await api.put(`/walletgroups/${id}`, data);
  return response.data;
};

export const deleteWalletGroup = async (id: number) => {
  const response = await api.delete(`/walletgroups/${id}`);
  return response.data;
};

export default api;
