import React, { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

interface ToastState {
  toasts: Toast[];
}

// Simple toast hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastState>({ toasts: [] });

  const toast = useCallback(({ title, description, duration = 3000, variant = 'default' }: {
    title: string;
    description?: string;
    duration?: number;
    variant?: 'default' | 'destructive';
  }) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, description, duration, variant };
    
    setToasts(prev => ({
      toasts: [...prev.toasts, newToast]
    }));

    // Auto remove toast after duration
    setTimeout(() => {
      setToasts(prev => ({
        toasts: prev.toasts.filter(t => t.id !== id)
      }));
    }, duration);

    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => ({
      toasts: prev.toasts.filter(t => t.id !== id)
    }));
  }, []);

  return { toast, dismiss, toasts: toasts.toasts };
};