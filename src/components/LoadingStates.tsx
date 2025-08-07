import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProductCardSkeleton = () => (
  <Card className="overflow-hidden animate-fade-in">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-20" />
    </CardHeader>
    <CardContent className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>
    </CardContent>
  </Card>
);

export const ProductGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <Card className="animate-fade-in">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {/* Header */}
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        {/* Rows */}
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {[...Array(cols)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const PageHeaderSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    <div className="flex items-center gap-4">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-64" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <Card className="animate-fade-in">
    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action}
    </CardContent>
  </Card>
);

export const LoadingSpinner = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-2 border-muted border-t-primary ${sizeClasses[size]}`} />
    </div>
  );
};