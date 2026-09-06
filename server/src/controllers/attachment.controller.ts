import { param } from '../utils/params';
import { Response } from 'express';
import { AuthRequest } from '../types';
import {
  createAttachment,
  getAttachmentsByIncident,
  deleteAttachment,
} from '../services/attachment.service';

export async function uploadAttachment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = param(req.params.id);
    const { fileName, filePath, fileType, fileSize } = req.body;

    if (!fileName || !filePath) {
      res.status(400).json({
        success: false,
        message: 'fileName and filePath (or base64 content) are required',
      });
      return;
    }

    const attachment = await createAttachment({
      incidentId: id,
      uploadedById: req.user!.userId,
      fileName,
      filePath,
      fileType: fileType || 'application/octet-stream',
      fileSize: fileSize || 0,
    });

    res.status(201).json({
      success: true,
      data: attachment,
      message: 'Attachment recorded successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload attachment',
    });
  }
}

export async function listAttachments(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = param(req.params.id);
    const attachments = await getAttachmentsByIncident(id);

    res.json({
      success: true,
      data: attachments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list attachments',
    });
  }
}

export async function removeAttachment(req: AuthRequest, res: Response): Promise<void> {
  try {
    const attachmentId = param(req.params.attachmentId);
    await deleteAttachment(attachmentId, req.user!.userId, req.user!.role);

    res.json({
      success: true,
      message: 'Attachment deleted successfully',
    });
  } catch (error: any) {
    res.status(error.message.includes('Unauthorized') ? 403 : 500).json({
      success: false,
      message: error.message || 'Failed to delete attachment',
    });
  }
}
