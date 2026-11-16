import { Skeleton } from '@heroui/react';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xs">
      <Skeleton className="aspect-[4/3] w-full rounded-none bg-slate-200" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-3.5 w-24 rounded-md bg-slate-200" />
        <Skeleton className="h-5 w-4/5 rounded-md bg-slate-200" />
        <Skeleton className="h-4 w-full rounded-md bg-slate-100" />
        <Skeleton className="h-4 w-2/3 rounded-md bg-slate-100" />
        <div className="mt-auto flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-24 rounded-md bg-slate-200" />
          <Skeleton className="h-9 w-28 rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

