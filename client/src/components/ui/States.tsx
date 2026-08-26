import React from 'react';
import { Loader2, AlertCircle, SearchX, FolderOpen } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-teal animate-spin" />
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle className="w-10 h-10 text-danger" />
      <p className="text-sm text-text-secondary">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <FolderOpen className="w-12 h-12 text-text-muted opacity-50" />
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      {description && <p className="text-xs text-text-muted text-center max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <SearchX className="w-10 h-10 text-text-muted opacity-50" />
      <p className="text-sm font-medium text-text-secondary">No results for "{query}"</p>
      <p className="text-xs text-text-muted">Try adjusting your search terms or filters.</p>
    </div>
  );
}

// Skeleton components
export function SkeletonLine({ className = 'h-4 w-full' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-6 w-2/3" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  );
}
