import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { ServiceRequest } from '../../types';
import { StatusBadge, PriorityBadge, DeadlineStatusBadge } from './Badge';
import { formatDate, getDeadlineStatus, formatTimeRemaining } from '../../utils';

interface RequestCardProps {
  request: ServiceRequest;
  linkTo?: string;
  showCustomer?: boolean;
  showOfficer?: boolean;
}

export function RequestCard({ request, linkTo, showCustomer, showOfficer }: RequestCardProps) {
  const deadlineStatus = request.deadlineStatus ?? getDeadlineStatus(request.deadline, request.createdAt);
  const isActive = !['RESOLVED', 'CLOSED'].includes(request.status);

  const content = (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-4 hover:border-teal/40 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-text-muted">{request.requestNumber}</span>
            <PriorityBadge priority={request.priority} />
          </div>
          <p className="text-sm font-semibold text-text-primary line-clamp-1">{request.title}</p>
          {showCustomer && (
            <p className="text-xs text-text-muted mt-0.5">Customer: {request.customer.name}</p>
          )}
          {showOfficer && request.assignedOfficer && (
            <p className="text-xs text-text-muted mt-0.5">Officer: {request.assignedOfficer.name}</p>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isActive ? (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <Clock className="w-3 h-3" />
              <span>{formatTimeRemaining(request.deadline)}</span>
            </span>
          ) : (
            <span className="text-xs text-text-muted">{formatDate(request.createdAt)}</span>
          )}
          {isActive && <DeadlineStatusBadge status={deadlineStatus} />}
        </div>
        <ArrowRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <p className="text-xs text-text-muted mt-2">{request.category.name}</p>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo} className="block">{content}</Link>;
  }
  return content;
}
