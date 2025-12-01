interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red';
  subtitle?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: 'text-blue-400',
    value: 'text-blue-400',
  },
  yellow: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    icon: 'text-yellow-400',
    value: 'text-yellow-400',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    icon: 'text-green-400',
    value: 'text-green-400',
  },
  red: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: 'text-red-400',
    value: 'text-red-400',
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`p-4 rounded-xl border ${colors.bg} ${colors.border} transition-all hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{title}</span>
        <div className={colors.icon}>{icon}</div>
      </div>
      <p className={`text-3xl font-bold ${colors.value}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
