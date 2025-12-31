import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Bell, RefreshCw, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Header: React.FC = () => {
  const { wallets, selectedWallet, setSelectedWallet, selectedUser, users, setSelectedUser, refreshData, isLoading } = useApp();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Wallet Selector */}
        {wallets.length > 0 && (
          <Select
            value={selectedWallet?.id?.toString()}
            onValueChange={(value) => {
              const wallet = wallets.find(w => w.id === parseInt(value));
              if (wallet) setSelectedWallet(wallet);
            }}
          >
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Select wallet" />
            </SelectTrigger>
            <SelectContent>
              {wallets.map((wallet) => (
                <SelectItem key={wallet.id} value={wallet.id.toString()}>
                  <div className="flex items-center gap-2">
                    <span>{wallet.icon || '💰'}</span>
                    <span>{wallet.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* User Selector */}
        {users.length > 0 && (
          <Select
            value={selectedUser?.id?.toString()}
            onValueChange={(value) => {
              const user = users.find(u => u.id === parseInt(value));
              if (user) setSelectedUser(user);
            }}
          >
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{user.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refreshData()}
          disabled={isLoading}
          className="hover:bg-accent"
        >
          <motion.div
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-accent relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <Button
          onClick={() => navigate('/transactions/new')}
          className="gradient-primary text-primary-foreground hover:opacity-90 shadow-card"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>
    </header>
  );
};
