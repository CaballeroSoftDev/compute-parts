import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PaymentStatusBadge } from './payment-status-badge';
import { CreditCard, User, Calendar } from 'lucide-react';

interface PayPalPaymentDetailsProps {
  paymentDetails: {
    paypal_order_id?: string;
    paypal_payment_id?: string;
    payer_info?: {
      name: string;
      email: string;
    };
    captured_at?: string;
    cancelled_at?: string;
    reason?: string;
  };
  paymentStatus: 'Pendiente' | 'Pagado' | 'Reembolsado' | 'Fallido';
}

export function PayPalPaymentDetails({ paymentDetails, paymentStatus }: PayPalPaymentDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Detalles de Pago - PayPal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado del pago:</span>
          <PaymentStatusBadge status={paymentStatus} />
        </div>

        {paymentDetails.paypal_order_id && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ID de Orden PayPal:</span>
              <span className="font-mono text-xs">{paymentDetails.paypal_order_id}</span>
            </div>

            {paymentDetails.paypal_payment_id && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ID de Pago PayPal:</span>
                <span className="font-mono text-xs">{paymentDetails.paypal_payment_id}</span>
              </div>
            )}
          </div>
        )}

        {paymentDetails.payer_info && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Información del pagador</span>
            </div>
            <div className="ml-6 space-y-1 text-sm">
              <div>
                <span className="text-gray-600">Nombre: </span>
                <span>{paymentDetails.payer_info.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email: </span>
                <span>{paymentDetails.payer_info.email}</span>
              </div>
            </div>
          </div>
        )}

        {paymentDetails.captured_at && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Fecha de captura</span>
            </div>
            <div className="ml-6 text-sm">{new Date(paymentDetails.captured_at).toLocaleString('es-MX')}</div>
          </div>
        )}

        {paymentDetails.cancelled_at && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Fecha de cancelación</span>
            </div>
            <div className="ml-6 text-sm">{new Date(paymentDetails.cancelled_at).toLocaleString('es-MX')}</div>
            {paymentDetails.reason && (
              <div className="ml-6 text-sm">
                <span className="text-gray-600">Razón: </span>
                <span>{paymentDetails.reason}</span>
              </div>
            )}
          </div>
        )}

        {paymentStatus === 'Pendiente' && (
          <div className="rounded-lg bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              El pago está pendiente. Una vez que completes el pago en PayPal, el estado se actualizará automáticamente.
            </p>
          </div>
        )}

        {paymentStatus === 'Fallido' && (
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">
              El pago falló. Puedes intentar nuevamente o contactar soporte si el problema persiste.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
