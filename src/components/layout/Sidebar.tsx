import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Receipt, 
  Wallet, 
  Tags, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  PiggyBank
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Receipt, label: 'Transactions', path: '/transactions' },
  { icon: Wallet, label: 'Wallets', path: '/wallets' },
  { icon: Tags, label: 'Categories', path: '/categories' },
  { icon: Users, label: 'Users', path: '/users' },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { selectedWallet, wallets } = useApp();

  return (
    <motion.aside
      className={cn(
        "relative flex flex-col h-full bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border">
        <motion.div 
          className="flex items-center gap-3"
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <PiggyBank className="w-6 h-6 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="font-heading font-bold text-xl text-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                MoneyLover
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                isActive && "bg-primary text-primary-foreground shadow-card"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="font-medium text-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Wallet Summary */}
      <AnimatePresence>
        {!collapsed && selectedWallet && (
          <motion.div
            className="mx-3 mb-4 p-4 rounded-xl bg-accent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{selectedWallet.icon || '💰'}</span>
              <span className="font-medium text-sm text-foreground truncate">{selectedWallet.name}</span>
            </div>
            <p className="text-lg font-bold text-primary">
              ${selectedWallet.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center hover:bg-accent transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
    </motion.aside>
  );
};
