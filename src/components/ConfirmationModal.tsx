import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, LogOut, Trash2 } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info";
  iconType?: "logout" | "trash" | "warning";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "सुनिश्चित करें (Confirm)",
  cancelLabel = "रद्द करें (Cancel)",
  type = "danger",
  iconType = "warning",
}: ConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Confirmation execution failed:", error);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const getIcon = () => {
    switch (iconType) {
      case "logout":
        return <LogOut size={24} className="text-red-500" />;
      case "trash":
        return <Trash2 size={24} className="text-red-500" />;
      default:
        return <AlertTriangle size={24} className="text-amber-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-500/10 dark:bg-red-500/20",
          confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/10",
        };
      case "warning":
        return {
          iconBg: "bg-amber-500/10 dark:bg-amber-500/20",
          confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10",
        };
      default:
        return {
          iconBg: "bg-spiritual/10 dark:bg-spiritual/20",
          confirmBtn: "bg-spiritual hover:bg-spiritual-dark text-white shadow-spiritual/10",
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            id="confirmation-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-8 overflow-hidden shadow-2xl border border-black/5 dark:border-zinc-800/80"
            id="confirmation-modal-card"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              id="confirmation-modal-close-icon-btn"
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Content layout */}
            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              <div className={`p-4 rounded-2xl ${colors.iconBg} flex items-center justify-center`}>
                {getIcon()}
              </div>

              <div className="space-y-2">
                <h3
                  className="serif-text font-black text-xl text-zinc-900 dark:text-zinc-100"
                  id="confirmation-modal-title"
                >
                  {title}
                </h3>
                <p
                  className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed"
                  id="confirmation-modal-message"
                >
                  {message}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 w-full">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:order-1 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 active:scale-95"
                id="confirmation-modal-cancel-btn"
              >
                {cancelLabel}
              </button>
              
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className={`w-full sm:order-2 px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 shadow-lg ${colors.confirmBtn}`}
                id="confirmation-modal-confirm-btn"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin inline-block" />
                ) : null}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
