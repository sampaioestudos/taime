import React, { createContext, useState, useContext, useCallback } from 'react';
import { XIcon, LightBulbIcon } from './icons';

type ToastType = 'info' | 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
    toasts: ToastMessage[];
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const Toast: React.FC<{ toast: ToastMessage; onDismiss: (id: number) => void }> = ({ toast, onDismiss }) => {
  const baseClasses = "flex items-center gap-4 w-full max-w-sm p-4 text-white rounded-lg shadow-lg ring-1 ring-white/10 transition-all transform";
  
  const typeClasses = {
    info: 'bg-gray-800',
    success: 'bg-green-800',
    error: 'bg-red-800',
  };
  
  const icons = {
      info: <LightBulbIcon className="h-6 w-6 text-yellow-400"/>,
      success: <LightBulbIcon className="h-6 w-6 text-green-400"/>,
      error: <LightBulbIcon className="h-6 w-6 text-red-400"/>
  }

  return (
    <div className={`${baseClasses} ${typeClasses[toast.type]} animate-fade-in-right`}>
      <div className="shrink-0">{icons[toast.type]}</div>
      <div className="flex-1 text-sm font-medium">{toast.message}</div>
      <button onClick={() => onDismiss(toast.id)} className="p-1 text-gray-400 hover:text-white rounded-full">
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), 6000);
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.addToast;
};

export const ToastContainer: React.FC = () => {
    const context = useContext(ToastContext);
    if (!context) return null;
    
    const { toasts, removeToast } = context;

    return (
        <div className="fixed bottom-5 right-5 z-50 space-y-3 w-full max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};