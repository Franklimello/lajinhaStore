import { useEffect } from "react"; // Removido useState - não usado
import { FaCheck, FaTimes, FaShoppingCart } from "react-icons/fa";

export default function Toast({ message, type = "success", isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-fecha após 3 segundos

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="text-xl" />;
      case "error":
        return <FaTimes className="text-xl" />;
      case "info":
        return <FaShoppingCart className="text-xl" />;
      default:
        return <FaCheck className="text-xl" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${getToastStyles()} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm`}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
}
