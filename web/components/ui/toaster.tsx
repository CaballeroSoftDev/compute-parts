'use client';

import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';
import { CheckCircle, XCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const getToastIcon = (variant: string) => {
  switch (variant) {
    case 'success':
      return <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />;
    case 'destructive':
      return <XCircle className="h-5 w-5 flex-shrink-0 text-red-600" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600" />;
    case 'info':
      return <Info className="h-5 w-5 flex-shrink-0 text-blue-600" />;
    default:
      return <AlertCircle className="h-5 w-5 flex-shrink-0 text-gray-600" />;
  }
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant = 'default', ...props }) {
        return (
          <Toast
            key={id}
            variant={variant}
            {...props}
          >
            <div className="flex flex-1 items-start gap-3">
              {getToastIcon(variant)}
              <div className="grid flex-1 gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
