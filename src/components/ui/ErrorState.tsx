import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: 'error' | 'network' | 'not-found' | 'empty';
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  type = 'error',
  className = '',
}: ErrorStateProps) {
  const getIcon = () => {
    switch (type) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-gray-400" />;
      case 'not-found':
        return <AlertCircle className="h-12 w-12 text-gray-400" />;
      case 'empty':
        return <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 text-xl">?</div>;
      default:
        return <AlertCircle className="h-12 w-12 text-red-400" />;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'network':
        return 'Connection Error';
      case 'not-found':
        return 'Not Found';
      case 'empty':
        return 'No Results';
      default:
        return 'Something went wrong';
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'network':
        return 'Please check your internet connection and try again.';
      case 'not-found':
        return 'The page you are looking for does not exist.';
      case 'empty':
        return 'No Pokémon match your current search criteria.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4">
        {getIcon()}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title || getDefaultTitle()}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        {message || getDefaultMessage()}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No Pokémon found',
  message = 'Try adjusting your search or filters to find what you are looking for.',
  action,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <div className="mb-4">
        {icon || (
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-400">🔍</span>
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        {message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}