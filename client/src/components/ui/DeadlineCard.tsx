import React from 'react';
import { Clock } from 'lucide-react';
import { Card } from './Card';
import { DeadlineStatusBadge } from './Badge';
import { formatDateTime, formatTimeRemaining, getDeadlineStatus, getDeadlinePercent, cn } from '../../utils';
import { ServiceRequest } from '../../types';

interface DeadlineCardProps {
  request: Pick<ServiceRequest, 'deadline' | 'createdAt' | 'status'>;
}

export function DeadlineCard({ request }: DeadlineCardProps) {
  const status = getDeadlineStatus(request.deadline, request.createdAt);
  const percent = getDeadlinePercent(request.deadline, request.createdAt);
  const isTerminal = ['RESOLVED', 'CLOSED'].includes(request.status);

  const barColor =
    status === 'OVERDUE' ? 'bg-danger' :
    status === 'DEADLINE_APPROACHING' ? 'bg-warning' :
    'bg-teal';

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-semibold text-text-primary">Service Deadline</span>
        {!isTerminal && <DeadlineStatusBadge status={status} />}
      </div>
      <p className="text-base font-semibold text-text-primary">
        {formatDateTime(request.deadline)}
      </p>
      {!isTerminal && (
        <>
          <p className={cn(
            'text-sm mt-0.5',
            status === 'OVERDUE' ? 'text-danger' :
            status === 'DEADLINE_APPROACHING' ? 'text-warning' :
            'text-success'
          )}>
            {formatTimeRemaining(request.deadline)}
          </p>
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', barColor)}
              style={{ width: `${percent}%` }}
            />
          </div>
        </>
      )}
      {isTerminal && (
        <p className="text-sm text-success mt-0.5">Completed</p>
      )}
    </Card>
  );
}
