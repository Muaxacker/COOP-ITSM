import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, AlertCircle, Clock, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingState, EmptyState } from '../components/ui/States';
import { timeAgo, cn } from '../utils';
import { NotificationType, Notification } from '../types';

const TYPE_COLORS: Record<NotificationType, string> = {
  INCIDENT_CREATED: 'text-blue-600 bg-blue-50',
  INCIDENT_ASSIGNED: 'text-purple-600 bg-purple-50',
  STATUS_CHANGED: 'text-blue-500 bg-blue-50',
  INFO_REQUESTED: 'text-amber-600 bg-amber-50',
  INFO_PROVIDED: 'text-teal-600 bg-teal-50',
  INCIDENT_RESOLVED: 'text-emerald-600 bg-emerald-50',
  INCIDENT_CLOSED: 'text-gray-600 bg-gray-50',
  INCIDENT_REOPENED: 'text-orange-600 bg-orange-50',
  SLA_WARNING: 'text-amber-600 bg-amber-50',
  SLA_BREACHED: 'text-rose-600 bg-rose-50',
};

export function NotificationsPage() {
  const { notifications, isLoading, markRead, markAllRead } = useNotifications();

  if (isLoading) return <LoadingState text="Loading notifications..." />;

  const unreadList = (notifications as Notification[]).filter((n: Notification) => !n.isRead);


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadList.length} unread updates across your branch and technical divisions
          </p>
        </div>
        {unreadList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck className="w-4 h-4" />}
            onClick={() => markAllRead()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You have no notifications at this time." />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif: Notification) => (
            <div
              key={notif.id}
              className={cn(
                'rounded-xl border p-4 transition-all cursor-pointer',
                notif.isRead
                  ? 'border-gray-200 bg-white hover:bg-gray-50/50'
                  : 'border-blue-200 bg-blue-50/40 shadow-xs hover:bg-blue-50/60'
              )}
              onClick={() => !notif.isRead && markRead(notif.id)}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                    TYPE_COLORS[notif.type] || 'text-gray-500 bg-gray-50'
                  )}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={cn(
                        'text-sm font-semibold',
                        notif.isRead ? 'text-gray-800' : 'text-gray-950 font-bold'
                      )}
                    >
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-gray-400">{timeAgo(notif.createdAt)}</span>
                    {notif.incident && (
                      <Link
                        to={`/incidents/${notif.incident.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View Incident {notif.incident.incidentNumber}</span>
                        <span>→</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
