import { getStatusColor, getStatusIcon } from "../../firebase/orders";

export default function OrderStatusBadge({ status, size = "default" }) {
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    default: "px-3 py-1 text-sm",
    large: "px-4 py-2 text-base"
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${statusColor} ${sizeClasses[size]}`}>
      <span>{statusIcon}</span>
      <span>{status}</span>
    </span>
  );
}

