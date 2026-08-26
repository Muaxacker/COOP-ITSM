export type DeadlineStatus = 'ON_TRACK' | 'DEADLINE_APPROACHING' | 'OVERDUE';

export function getDeadlineStatus(deadline: Date): DeadlineStatus {
  const now = new Date();
  if (now > deadline) return 'OVERDUE';

  // Calculate total duration from some reference - we use a rough window:
  // If less than 25% of time remaining → DEADLINE_APPROACHING
  // We don't store createdAt here so we use 2-hour window as "approaching"
  const msRemaining = deadline.getTime() - now.getTime();
  const hoursRemaining = msRemaining / (1000 * 60 * 60);

  if (hoursRemaining <= 2) return 'DEADLINE_APPROACHING';
  return 'ON_TRACK';
}

export function getDeadlineStatusFromCreation(
  deadline: Date,
  createdAt: Date
): DeadlineStatus {
  const now = new Date();
  if (now > deadline) return 'OVERDUE';

  const totalMs = deadline.getTime() - createdAt.getTime();
  const remainingMs = deadline.getTime() - now.getTime();
  const ratio = remainingMs / totalMs;

  if (ratio <= 0.25) return 'DEADLINE_APPROACHING';
  return 'ON_TRACK';
}

export function formatTimeRemaining(deadline: Date): string {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) {
    const overdue = Math.abs(diff);
    const hours = Math.floor(overdue / (1000 * 60 * 60));
    const minutes = Math.floor((overdue % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m overdue`;
    return `${minutes}m overdue`;
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
