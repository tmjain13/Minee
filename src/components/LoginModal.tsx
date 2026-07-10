import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoginPage } from './auth/LoginPage';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        {/* Backdrop overlay trigger */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-transparent cursor-pointer"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-1 sm:p-2 z-10 overflow-hidden"
        >
          {/* Absolute Close X indicator */}
          <button
            onClick={onClose}
            className="absolute top-5 left-5 z-20 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:scale-105 transition-all cursor-pointer"
            aria-label="Close Login Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <LoginPage 
            isModal={true} 
            onLoginSuccess={(username, contact) => {
              // Invoking closure to dismiss overlay and propagate state change
              onClose();
              // Seamless refresh or notification to trigger reactive updates
              setTimeout(() => {
                window.location.reload();
              }, 400);
            }} 
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
