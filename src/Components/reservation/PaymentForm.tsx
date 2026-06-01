import React, { useState } from 'react';
import { FaCreditCard, FaLock, FaCheckCircle } from 'react-icons/fa';

interface PaymentFormProps {
  amount: number;
  onPaymentComplete: (paymentData: PaymentData) => void;
  onCancel: () => void;
}

interface PaymentData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  amount: number;
  depositAmount: number;
}

export default function PaymentForm({ amount, onPaymentComplete, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const depositAmount = amount * 0.5; // 50% deposit
  const remainingAmount = amount * 0.5;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!formData.expiryDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiryDate = 'Please use MM/YY format';
    }

    if (!formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').slice(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      value = formatExpiryDate(value);
    } else if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) return;

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      
      const paymentData: PaymentData = {
        cardNumber: formData.cardNumber,
        cardholderName: formData.cardholderName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv,
        amount,
        depositAmount
      };

      // Call onPaymentComplete immediately after showing success
      onPaymentComplete(paymentData);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
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
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Secure Payment</h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FaLock className="text-[#6B8A62]" />
          <span>SSL Encrypted</span>
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

      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => handleInputChange('cardNumber', e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] outline-none transition ${
                errors.cardNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={19}
            />
            <FaCreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={formData.cardholderName}
            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] outline-none transition ${
              errors.cardholderName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.cardholderName && <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>}
        </div>

        {/* Expiry Date and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              placeholder="MM/YY"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] outline-none transition ${
                errors.expiryDate ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={5}
            />
            {errors.expiryDate && <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={formData.cvv}
              onChange={(e) => handleInputChange('cvv', e.target.value)}
              placeholder="123"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] outline-none transition ${
                errors.cvv ? 'border-red-500' : 'border-gray-300'
              }`}
              maxLength={4}
            />
            {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
          </div>
        </div>

        {/* Save Card Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.saveCard}
            onChange={(e) => setFormData(prev => ({ ...prev, saveCard: e.target.checked }))}
            className="w-4 h-4 text-[#6B8A62] border-gray-300 rounded focus:ring-[#6B8A62]"
          />
          <span className="text-sm text-gray-700">
            Save card details for future orders
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-all"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isProcessing}
            className="flex-1 bg-[#6B8A62] hover:bg-[#5A7352] text-white py-3 rounded-lg font-semibold transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Pay $${depositAmount.toFixed(2)} Deposit`
            )}
          </button>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-[#6B8A62]/10 rounded-lg border border-[#6B8A62]/20">
        <div className="flex items-start gap-3">
          <FaLock className="text-[#6B8A62] mt-1" />
          <div className="text-sm text-[#6B8A62]">
            <p className="font-semibold mb-1">Secure Payment</p>
            <p>Your payment information is encrypted and secure. We never store your complete card details.</p>
          </div>
        </div>
      </div>
    </div>
  );
}