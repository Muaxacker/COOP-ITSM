import React from 'react';
import { RequestActivity } from '../../types';
import { formatDateTime } from '../../utils';
import { cn } from '../../utils';

interface TimelineProps {
  activities: RequestActivity[];
}

const ACTION_LABELS: Record<string, string> = {
  REQUEST_CREATED: 'Request Submitted',
  REQUEST_REVIEWED: 'Request Reviewed',
  REQUEST_ASSIGNED: 'Request Assigned',
  REQUEST_REASSIGNED: 'Request Reassigned',
  STATUS_CHANGED: 'Status Changed',
  NOTE_ADDED: 'Note Added',
  INVESTIGATION_STARTED: 'Investigation Started',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
  REOPENED: 'Reopened',
  CLOSED: 'Closed',
  DEADLINE_WARNING: 'Deadline Warning',
  OVERDUE_MARKED: 'Marked Overdue',
};

const ACTION_COLORS: Record<string, string> = {
  REQUEST_CREATED: 'bg-info border-info',
  REQUEST_REVIEWED: 'bg-teal border-teal',
  REQUEST_ASSIGNED: 'bg-teal border-teal',
  REQUEST_REASSIGNED: 'bg-teal border-teal',
  INVESTIGATION_STARTED: 'bg-warning border-warning',
  NOTE_ADDED: 'bg-gray-400 border-gray-400',
  ESCALATED: 'bg-danger border-danger',
  RESOLVED: 'bg-success border-success',
  REOPENED: 'bg-purple-500 border-purple-500',
  CLOSED: 'bg-gray-500 border-gray-500',
  OVERDUE_MARKED: 'bg-danger border-danger',
  STATUS_CHANGED: 'bg-gray-400 border-gray-400',
  DEADLINE_WARNING: 'bg-warning border-warning',
};

export function Timeline({ activities }: TimelineProps) {
  if (activities.length === 0) {
    return <p className="text-sm text-text-muted py-4 text-center">No activity recorded yet.</p>;
  }

  return (
    <div className="relative">
      {activities.map((activity, i) => (
        <div key={activity.id} className="flex gap-3 relative">
          {/* Vertical line */}
          {i < activities.length - 1 && (
            <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gray-100" />
          )}
          {/* Dot */}
          <div className={cn(
            'relative z-10 mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0',
            ACTION_COLORS[activity.action] || 'bg-gray-300 border-gray-300'
          )} />
          {/* Content */}
          <div className="flex-1 pb-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {ACTION_LABELS[activity.action] || activity.action}
                </p>
                <p className="text-xs text-text-secondary mt-0.5">by {activity.user.name}</p>
              </div>
              <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                {formatDateTime(activity.createdAt)}
              </span>
            </div>
            {activity.description && (
              <p className="mt-1.5 text-sm text-text-secondary bg-gray-50 rounded-lg p-3 border border-gray-100">
                {activity.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Status progress stepper for request details
interface StatusStepperProps {
  currentStatus: string;
}

const STEPS = ['NEW', 'REVIEWED', 'ASSIGNED', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];

export function StatusStepper({ currentStatus }: StatusStepperProps) {
  const normalizedStatus = ['OVERDUE', 'ESCALATED', 'REOPENED'].includes(currentStatus)
    ? currentStatus
    : currentStatus;

  const activeIndex = STEPS.indexOf(currentStatus);

  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;
        const label = step.charAt(0) + step.slice(1).toLowerCase();

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                isCompleted ? 'bg-teal border-teal text-white' :
                isActive ? 'bg-white border-teal text-teal ring-4 ring-teal/20' :
                'bg-white border-gray-200 text-text-muted'
              )}>
                {isCompleted ? '✓' : i + 1}
              </div>
              <span className={cn(
                'text-xs mt-1.5 font-medium',
                isActive ? 'text-teal' : isCompleted ? 'text-text-secondary' : 'text-text-muted'
              )}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mb-5 mx-1',
                i < activeIndex ? 'bg-teal' : 'bg-gray-200'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
