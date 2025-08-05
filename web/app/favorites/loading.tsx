import { MainLayout } from '@/components/layout/MainLayout';

export default function FavoritesLoading() {
  return (
    <MainLayout>
      <div className="container py-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-square animate-pulse bg-gray-200" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
