import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-4">
        <Skeleton className="mb-2 h-3 w-16" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-2 h-3 w-20" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}
