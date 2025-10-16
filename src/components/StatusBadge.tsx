import { MedchronStatus } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/mockData';

interface StatusBadgeProps {
  status: MedchronStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(status)} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}