import { useEffect } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function AlertModal({
  isOpen,
  onClose,
  title = "Aviso",
  message,
  type = "info", // success, error, warning, info
  buttonText = "OK"
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const typeConfig = {
    success: {
      icon: FaCheckCircle,
      bg: "bg-green-100",
      iconColor: "text-green-600",
      buttonColor: "bg-green-600 hover:bg-green-700",
      borderColor: "border-green-200"
    },
    error: {
      icon: FaExclamationCircle,
      bg: "bg-red-100",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      borderColor: "border-red-200"
    },
    warning: {
      icon: FaExclamationCircle,
      bg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
      borderColor: "border-yellow-200"
    },
    info: {
      icon: FaInfoCircle,
      bg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      borderColor: "border-blue-200"
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      aria-describedby="alert-modal-message"
    >
      <div className={`bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 ${config.borderColor} animate-fadeIn`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className={`flex items-center justify-center w-12 h-12 rounded-full ${config.bg} mb-2`}>
            <Icon className={`${config.iconColor} text-2xl`} />
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
          <h3 id="alert-modal-title" className="text-xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          <div id="alert-modal-message" className="text-gray-600 whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-6 py-3 ${config.buttonColor} text-white rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

