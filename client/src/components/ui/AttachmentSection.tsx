import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentApi } from '../../services/api';
import { Attachment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { formatDateTime } from '../../utils';
import toast from 'react-hot-toast';
import {
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';

interface AttachmentSectionProps {
  incidentId: string;
  canUpload?: boolean;
}

export function AttachmentSection({ incidentId, canUpload = true }: AttachmentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['attachments', incidentId],
    queryFn: async () => {
      const res = await attachmentApi.getByIncident(incidentId);
      return res.data.data || [];
    },
    enabled: !!incidentId,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => attachmentApi.delete(id),
    onSuccess: () => {
      toast.success('Attachment removed');
      queryClient.invalidateQueries({ queryKey: ['attachments', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete attachment');
    },
  });

  // Handle file reading
  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64Data = reader.result as string;
        await attachmentApi.upload(incidentId, {
          fileName: file.name,
          filePath: base64Data,
          fileType: file.type || 'application/octet-stream',
          fileSize: file.size,
        });

        toast.success(`Attached ${file.name}`);
        queryClient.invalidateQueries({ queryKey: ['attachments', incidentId] });
        queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to upload file');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      toast.error('Error reading file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (type: string, name: string) => {
    return type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200/90 p-5 shadow-subtle space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
            <Paperclip className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Diagnostic Media & File Attachments
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Screenshots, error traces, ATM receipts, or vendor replacement logs
            </p>
          </div>
        </div>
        <span className="text-xs font-bold font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {attachments.length} attachment{attachments.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Upload Zone */}
      {canUpload && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-brand-700 bg-brand-50/40'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.pdf,.txt,.log,.docx"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-subtle">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {uploading ? 'Uploading file...' : 'Click or drag file to attach'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              PNG, JPG, PDF, or text log up to 10MB
            </p>
          </div>
        </div>
      )}

      {/* Attachments List */}
      {isLoading ? (
        <div className="p-4 text-center text-xs text-slate-400 font-mono">Loading attachments...</div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-5 text-xs text-slate-500 font-medium">
          No media or diagnostic documents attached to this ticket yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map((att: Attachment) => {
            const isImg = isImage(att.fileType, att.fileName);
            return (
              <div
                key={att.id}
                className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/40 hover:bg-white transition-all flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {isImg ? (
                    <div
                      onClick={() => setPreviewAttachment(att)}
                      className="w-12 h-12 rounded border border-slate-200 overflow-hidden bg-white flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                    >
                      <img
                        src={att.filePath}
                        alt={att.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded border border-slate-200 bg-white flex items-center justify-center flex-shrink-0 text-slate-600">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      title={att.fileName}
                      className="text-xs font-bold text-slate-900 truncate"
                    >
                      {att.fileName}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {formatFileSize(att.fileSize)} • {formatDateTime(att.createdAt)}
                    </p>
                    {att.uploadedBy && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        By {att.uploadedBy.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isImg && (
                    <button
                      type="button"
                      onClick={() => setPreviewAttachment(att)}
                      title="Preview Image"
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  <a
                    href={att.filePath}
                    download={att.fileName}
                    title="Download file"
                    className="p-1.5 text-slate-600 hover:text-brand-900 hover:bg-slate-100 rounded"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {(user?.id === att.uploadedById || user?.role === 'ADMIN' || user?.role === 'IT_SUPERVISOR') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Remove attachment "${att.fileName}"?`)) {
                          deleteMutation.mutate(att.id);
                        }
                      }}
                      title="Delete attachment"
                      className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4 space-y-3 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{previewAttachment.fileName}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {formatFileSize(previewAttachment.fileSize)} • {formatDateTime(previewAttachment.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.filePath}
                  download={previewAttachment.fileName}
                  className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-950 rounded p-2">
              <img
                src={previewAttachment.filePath}
                alt={previewAttachment.fileName}
                className="max-h-[65vh] max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
