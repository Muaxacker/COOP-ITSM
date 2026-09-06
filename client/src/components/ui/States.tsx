import React from 'react';
import { Loader2, AlertCircle, SearchX, FolderOpen } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ text = 'Loading...', message }: { text?: string; message?: string }) {
  const displayText = message || text;
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-sm text-gray-500">{displayText}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle className="w-10 h-10 text-rose-500" />
      <p className="text-sm text-gray-700">{message}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <FolderOpen className="w-12 h-12 text-gray-300" />
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="text-xs text-gray-500 text-center max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <SearchX className="w-10 h-10 text-gray-300" />
      <p className="text-sm font-semibold text-gray-700">No results for "{query}"</p>
      <p className="text-xs text-gray-500">Try adjusting your search terms or filters.</p>
    </div>
  );
}
