import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

export interface ToastMessage {
  id: number;
  text: string;
  type: 'success' | 'error';
}

interface ToastStackProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isError = toast.type === 'error';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm animate-fadeIn ${
        isError
          ? 'bg-red-50 border-red-200 text-red-800'
          : 'bg-white border-gray-200 text-gray-800'
      }`}
      role="status"
    >
      {isError ? (
        <FaExclamationCircle className="text-red-500 shrink-0 mt-0.5" />
      ) : (
        <FaCheckCircle className="text-[#6B8A62] shrink-0 mt-0.5" />
      )}
      <p className="flex-1">{toast.text}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="text-gray-400 hover:text-gray-600 shrink-0"
        aria-label="Dismiss"
      >
        <FaTimes />
      </button>
    </div>
  );
}

let toastId = 0;

export function createToast(
  text: string,
  type: 'success' | 'error' = 'success'
): ToastMessage {
  toastId += 1;
  return { id: toastId, text, type };
}
