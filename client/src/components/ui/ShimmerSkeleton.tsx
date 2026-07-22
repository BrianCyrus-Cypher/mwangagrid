import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps extends React.ComponentProps<"div"> {
  variant?: "text" | "circular" | "rectangular" | "card" | "avatar";
}

export function ShimmerSkeleton({
  className,
  variant = "text",
  ...props
}: ShimmerSkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-accent/60 isolate",
        variant === "circular" && "rounded-full",
        variant === "avatar" && "rounded-full size-10",
        variant === "card" && "rounded-xl",
        variant === "rectangular" && "rounded-lg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 animate-shimmer opacity-30" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <ShimmerSkeleton
        variant="rectangular"
        className="h-48 w-full rounded-none"
      />
      <div className="p-5 space-y-3">
        <ShimmerSkeleton className="h-5 w-3/4" />
        <ShimmerSkeleton className="h-4 w-full" />
        <ShimmerSkeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <ShimmerSkeleton className="h-5 w-24" />
          <ShimmerSkeleton className="h-4 w-12" />
        </div>
        <ShimmerSkeleton className="h-9 w-full rounded-md mt-2" />
      </div>
    </div>
  );
}

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="w-[280px] border-r border-border bg-background p-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <ShimmerSkeleton variant="avatar" />
          <ShimmerSkeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2 px-2">
          <ShimmerSkeleton className="h-10 w-full rounded-lg" />
          <ShimmerSkeleton className="h-10 w-full rounded-lg" />
          <ShimmerSkeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-1">
            <ShimmerSkeleton variant="avatar" />
            <div className="flex-1 space-y-2">
              <ShimmerSkeleton className="h-3 w-20" />
              <ShimmerSkeleton className="h-2 w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 space-y-4">
        <ShimmerSkeleton className="h-12 w-48 rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <ShimmerSkeleton className="h-32 rounded-xl" />
          <ShimmerSkeleton className="h-32 rounded-xl" />
          <ShimmerSkeleton className="h-32 rounded-xl" />
        </div>
        <ShimmerSkeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <ShimmerSkeleton className="h-4 w-24" />
          <ShimmerSkeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <ShimmerSkeleton className="h-10 w-full rounded-lg mt-6" />
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 pb-2 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <ShimmerSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <ShimmerSkeleton key={c} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
