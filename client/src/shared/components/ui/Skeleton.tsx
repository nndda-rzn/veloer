interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = 'h-4' }: SkeletonProps) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}
