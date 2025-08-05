import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: 'Pendiente' | 'Pagado' | 'Reembolsado' | 'Fallido';
  className?: string;
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Pagado':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          text: 'Pagado',
        };
      case 'Pendiente':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
          text: 'Pendiente',
        };
      case 'Reembolsado':
        return {
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          text: 'Reembolsado',
        };
      case 'Fallido':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          text: 'Fallido',
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
          text: status,
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={`inline-flex items-center gap-1 ${config.className} ${className}`}
    >
      <IconComponent className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
