import { useEffect } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Ação",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "red",
  variant = "warning" // warning, danger, info
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const colorClasses = {
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      icon: "text-yellow-600",
      button: confirmColor === "red" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700"
    },
    danger: {
      bg: "bg-red-100",
      text: "text-red-600",
      icon: "text-red-600",
      button: "bg-red-600 hover:bg-red-700"
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: "text-blue-600",
      button: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const colors = colorClasses[variant] || colorClasses.warning;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${colors.bg} mb-2`}>
            <FaExclamationTriangle className={`${colors.icon} text-2xl`} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Fechar modal"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 id="confirm-modal-title" className="text-xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          <div id="confirm-modal-message" className="text-gray-600 whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 ${colors.button} text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

