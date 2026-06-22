import { useState, type FormEvent } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaLock, FaCheckCircle } from 'react-icons/fa';
import { getStripe } from '../../lib/stripe';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ clientSecret, amount, onPaymentComplete, onCancel }: PaymentFormProps) {
  const depositAmount = amount * 0.5;
  const remainingAmount = amount * 0.5;

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaLock className="text-[#6B8A62]" />
          <span>Stripe Encrypted</span>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Food Total:</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold text-[#6B8A62]">
            <span>50% Deposit:</span>
            <span>${depositAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Remaining (pay at restaurant):</span>
            <span>${remainingAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Elements stripe={getStripe()} options={{ clientSecret }}>
        <StripeCheckoutForm
          depositAmount={depositAmount}
          remainingAmount={remainingAmount}
          onPaymentComplete={onPaymentComplete}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
}

function StripeCheckoutForm({
  depositAmount,
  remainingAmount,
  onPaymentComplete,
  onCancel,
}: {
  depositAmount: number;
  remainingAmount: number;
  onPaymentComplete: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed. Please check your card details and try again.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setShowSuccess(true);
    onPaymentComplete();
  };

  if (showSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-[#6B8A62]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-[#6B8A62] text-4xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          ${depositAmount.toFixed(2)} deposit has been charged to your card
        </p>
        <p className="text-sm text-gray-500">
          Remaining ${remainingAmount.toFixed(2)} will be paid at the restaurant
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <PaymentElement />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="flex-1 bg-[#6B8A62] hover:bg-[#5A7352] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            `Pay $${depositAmount.toFixed(2)} Deposit`
          )}
        </button>
      </div>

      <div className="mt-2 p-4 bg-[#6B8A62]/10 rounded-lg border border-[#6B8A62]/20">
        <div className="flex items-start gap-3">
          <FaLock className="text-[#6B8A62] mt-1" />
          <div className="text-sm text-[#6B8A62]">
            <p className="font-semibold mb-1">Secure Payment</p>
            <p>Your card details are handled directly by Stripe and never touch our servers.</p>
          </div>
        </div>
      </div>
    </form>
  );
}
