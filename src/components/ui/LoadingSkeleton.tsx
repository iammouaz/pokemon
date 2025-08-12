interface LoadingSkeletonProps {
  className?: string;
  variant?: 'card' | 'text' | 'circle' | 'rectangle';
}

export function LoadingSkeleton({ 
  className = '', 
  variant = 'rectangle' 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    card: 'rounded-lg h-64 w-full',
    text: 'rounded h-4 w-3/4',
    circle: 'rounded-full w-12 h-12',
    rectangle: 'rounded w-full h-4',
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="Loading..."
      role="status"
    />
  );
}

interface PokemonCardSkeletonProps {
  count?: number;
}

export function PokemonCardSkeleton({ count = 8 }: PokemonCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-pokemon-card p-6 border border-gray-200 dark:border-gray-700"
        >
          {/* Image skeleton */}
          <div className="flex justify-center mb-4">
            <LoadingSkeleton variant="circle" className="w-24 h-24" />
          </div>
          
          {/* Name skeleton */}
          <LoadingSkeleton variant="text" className="h-6 mb-2 mx-auto w-2/3" />
          
          {/* ID skeleton */}
          <LoadingSkeleton variant="text" className="h-4 mb-4 mx-auto w-1/3" />
          
          {/* Types skeleton */}
          <div className="flex justify-center space-x-2 mb-4">
            <LoadingSkeleton className="h-6 w-16 rounded-full" />
            <LoadingSkeleton className="h-6 w-16 rounded-full" />
          </div>
          
          {/* Favorite button skeleton */}
          <div className="flex justify-center">
            <LoadingSkeleton variant="circle" className="w-10 h-10" />
          </div>
        </div>
      ))}
    </>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header skeleton */}
      <div className="text-center mb-8">
        <LoadingSkeleton variant="circle" className="w-48 h-48 mx-auto mb-6" />
        <LoadingSkeleton variant="text" className="h-8 w-64 mx-auto mb-2" />
        <LoadingSkeleton variant="text" className="h-6 w-32 mx-auto mb-4" />
        
        {/* Types skeleton */}
        <div className="flex justify-center space-x-2 mb-6">
          <LoadingSkeleton className="h-8 w-20 rounded-full" />
          <LoadingSkeleton className="h-8 w-20 rounded-full" />
        </div>
        
        {/* Favorite button skeleton */}
        <LoadingSkeleton className="h-12 w-32 mx-auto rounded-lg" />
      </div>

      {/* Stats and info grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Basic info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <LoadingSkeleton variant="text" className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex justify-between">
                <LoadingSkeleton variant="text" className="h-4 w-20" />
                <LoadingSkeleton variant="text" className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <LoadingSkeleton variant="text" className="h-6 w-24 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <LoadingSkeleton variant="text" className="h-4 w-24" />
                  <LoadingSkeleton variant="text" className="h-4 w-8" />
                </div>
                <LoadingSkeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <LoadingSkeleton variant="text" className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          <LoadingSkeleton variant="text" className="h-4 w-full" />
          <LoadingSkeleton variant="text" className="h-4 w-5/6" />
          <LoadingSkeleton variant="text" className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}