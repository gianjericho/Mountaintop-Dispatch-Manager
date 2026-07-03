"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-4 z-[999] flex flex-col gap-2 pointer-events-none max-w-xs w-full">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-slide-up bg-slate-800 text-white p-3 rounded-lg shadow-lg flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <i className="fa-solid fa-circle-check text-green-400"></i>}
              {toast.type === 'error' && <i className="fa-solid fa-circle-exclamation text-red-400"></i>}
              {toast.type === 'info' && <i className="fa-solid fa-circle-info text-blue-400"></i>}
              <span className="text-sm font-bold">{toast.message}</span>
            </div>
            <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="text-slate-400 hover:text-white">
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
