import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState, EmptyState } from '../components/ui/States';
import { timeAgo, cn } from '../utils';
import { NotificationType } from '../types';

const TYPE_COLORS: Record<NotificationType, string> = {
  REQUEST_UPDATE: 'text-info',
  DEADLINE_WARNING: 'text-warning',
  OVERDUE: 'text-danger',
  RESOLUTION: 'text-success',
  ASSIGNMENT: 'text-teal',
  ESCALATION: 'text-danger',
  GENERAL: 'text-text-muted',
};

export function NotificationsPage() {
  const { notifications, isLoading, markRead, markAllRead } = useNotifications();

  if (isLoading) return <LoadingState />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-muted mt-0.5">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <Button variant="outline" size="sm" icon={<CheckCheck className="w-4 h-4" />} onClick={() => markAllRead()}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'bg-white rounded-xl border p-4 transition-colors cursor-pointer',
                notif.isRead ? 'border-gray-100' : 'border-teal/20 bg-teal/5'
              )}
              onClick={() => !notif.isRead && markRead(notif.id)}
            >
              <div className="flex items-start gap-3">
                <Bell className={cn('w-4 h-4 mt-0.5 flex-shrink-0', TYPE_COLORS[notif.type])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-medium', notif.isRead ? 'text-text-secondary' : 'text-text-primary')}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-teal rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{notif.message}</p>
                  <p className="text-xs text-text-muted mt-1.5">{timeAgo(notif.createdAt)}</p>
                  {notif.request && (
                    <Link
                      to={`/requests/${notif.request.id}`}
                      className="text-xs text-teal hover:underline mt-1 block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View {notif.request.requestNumber} →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
