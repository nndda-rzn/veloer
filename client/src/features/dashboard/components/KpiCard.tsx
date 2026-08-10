interface KpiCardProps {
  label: string;
  value: string;
  icon?: string;
  trend?: string;
}

export function KpiCard({ label, value, icon, trend }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
    </div>
  );
}
