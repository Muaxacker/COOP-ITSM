import { prisma } from '../config/prisma';
import { logAudit } from './audit.service';

export async function createAttachment(data: {
  incidentId: string;
  uploadedById: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}) {
  const attachment = await prisma.attachment.create({
    data: {
      incidentId: data.incidentId,
      uploadedById: data.uploadedById,
      fileName: data.fileName,
      filePath: data.filePath,
      fileType: data.fileType,
      fileSize: data.fileSize,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  await logAudit({
    userId: data.uploadedById,
    action: 'ATTACHMENT_UPLOADED',
    entityType: 'Attachment',
    entityId: attachment.id,
    newValue: {
      fileName: data.fileName,
      fileSize: data.fileSize,
      incidentId: data.incidentId,
    },
  });

  return attachment;
}

export async function getAttachmentsByIncident(incidentId: string) {
  return prisma.attachment.findMany({
    where: { incidentId },
    orderBy: { createdAt: 'desc' },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}

export async function deleteAttachment(attachmentId: string, userId: string, userRole: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: attachmentId },
  });

  if (!attachment) {
    throw new Error('Attachment not found');
  }

  // Only uploader, supervisor, or admin can delete
  if (attachment.uploadedById !== userId && userRole !== 'ADMIN' && userRole !== 'IT_SUPERVISOR') {
    throw new Error('Unauthorized to delete this attachment');
  }

  await prisma.attachment.delete({
    where: { id: attachmentId },
  });

  await logAudit({
    userId,
    action: 'ATTACHMENT_DELETED',
    entityType: 'Attachment',
    entityId: attachmentId,
    oldValue: {
      fileName: attachment.fileName,
      incidentId: attachment.incidentId,
    },
  });

  return { success: true };
}
