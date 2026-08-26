import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';

export async function submitFeedback(data: {
  requestId: string;
  customerId: string;
  rating: number;
  comment?: string;
}) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: data.requestId },
    select: { id: true, customerId: true, status: true, requestNumber: true },
  });

  if (!request) throw new AppError('Request not found', 404);
  if (request.customerId !== data.customerId) throw new AppError('Forbidden', 403);
  if (!['RESOLVED', 'CLOSED'].includes(request.status)) {
    throw new AppError('You can only submit feedback for resolved or closed requests', 400);
  }

  const existing = await prisma.feedback.findUnique({ where: { requestId: data.requestId } });
  if (existing) throw new AppError('Feedback already submitted for this request', 409);

  const feedback = await prisma.feedback.create({
    data: {
      requestId: data.requestId,
      customerId: data.customerId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  // Activity log
  await prisma.requestActivity.create({
    data: {
      requestId: data.requestId,
      userId: data.customerId,
      action: 'CLOSED',
      description: `Customer submitted ${data.rating}-star feedback`,
      isCustomerVisible: true,
    },
  });

  return feedback;
}

export async function getFeedback(requestId: string, requesterId: string) {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
    select: { customerId: true },
  });

  if (!request) throw new AppError('Request not found', 404);

  const feedback = await prisma.feedback.findUnique({ where: { requestId } });
  return feedback;
}
