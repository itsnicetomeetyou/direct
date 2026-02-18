'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { upsertEmailTemplate } from '@/server/settings';
import { Loader2, Pencil, Mail, Eye } from 'lucide-react';

const ALL_STATUSES = [
  'PENDING',
  'PAID',
  'PROCESSING',
  'READYTOPICKUP',
  'OUTFORDELIVERY',
  'COMPLETED',
  'CANCELLED'
] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PAID: 'Paid',
  PROCESSING: 'Processing',
  READYTOPICKUP: 'Ready to Pick Up',
  OUTFORDELIVERY: 'Out for Delivery',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-500',
  PAID: 'bg-blue-500',
  PROCESSING: 'bg-indigo-500',
  READYTOPICKUP: 'bg-teal-500',
  OUTFORDELIVERY: 'bg-orange-500',
  COMPLETED: 'bg-green-500',
  CANCELLED: 'bg-red-500'
};

const DEFAULT_SUBJECTS: Record<string, string> = {
  PENDING: 'Your order is pending',
  PAID: 'Payment received - Order confirmed',
  PROCESSING: 'Your order is now being processed',
  READYTOPICKUP: 'Your documents are ready for pick up',
  OUTFORDELIVERY: 'Your order is out for delivery',
  COMPLETED: 'Your order has been completed',
  CANCELLED: 'Your order has been cancelled'
};

const PLACEHOLDER_HELP = `Available placeholders:
{{firstName}} - Student's first name
{{lastName}} - Student's last name
{{referenceNumber}} - Order reference number
{{status}} - Current order status
{{documents}} - List of ordered documents`;

type EmailTemplateRow = {
  id: string;
  status: string;
  subject: string;
  body: string;
  isActive: boolean;
};

export default function EmailTemplatesClient({
  templates
}: {
  templates: EmailTemplateRow[];
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editStatus, setEditStatus] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editActive, setEditActive] = useState(true);

  const templateMap = new Map(templates.map((t) => [t.status, t]));

  const rows = ALL_STATUSES.map((status) => {
    const existing = templateMap.get(status);
    return {
      status,
      subject: existing?.subject ?? DEFAULT_SUBJECTS[status] ?? '',
      body: existing?.body ?? '',
      isActive: existing?.isActive ?? false,
      configured: !!existing
    };
  });

  function openEdit(status: string) {
    const existing = templateMap.get(status);
    setEditStatus(status);
    setEditSubject(existing?.subject ?? DEFAULT_SUBJECTS[status] ?? '');
    setEditBody(
      existing?.body ??
        getDefaultBody(status)
    );
    setEditActive(existing?.isActive ?? true);
    setEditOpen(true);
  }

  function openPreview(status: string) {
    const existing = templateMap.get(status);
    setEditStatus(status);
    setEditSubject(existing?.subject ?? DEFAULT_SUBJECTS[status] ?? '');
    setEditBody(existing?.body ?? getDefaultBody(status));
    setPreviewOpen(true);
  }

  async function handleSave() {
    if (!editSubject.trim() || !editBody.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Subject and body are required.'
      });
      return;
    }

    setSaving(true);
    try {
      await upsertEmailTemplate({
        status: editStatus,
        subject: editSubject,
        body: editBody,
        isActive: editActive
      });
      toast({ title: 'Saved', description: `Email template for ${STATUS_LABELS[editStatus]} updated.` });
      setEditOpen(false);
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save template.' });
    } finally {
      setSaving(false);
    }
  }

  function renderPreviewHtml(body: string) {
    return body
      .replace(/\{\{firstName\}\}/g, 'Juan')
      .replace(/\{\{lastName\}\}/g, 'Dela Cruz')
      .replace(/\{\{referenceNumber\}\}/g, 'REF-20260214-001')
      .replace(/\{\{status\}\}/g, STATUS_LABELS[editStatus] ?? editStatus)
      .replace(/\{\{documents\}\}/g, 'Transcript of Records, Good Moral Certificate');
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STATUS</TableHead>
            <TableHead>SUBJECT</TableHead>
            <TableHead>ACTIVE</TableHead>
            <TableHead className="text-right">ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.status}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${STATUS_COLORS[row.status]}`}
                  >
                    {STATUS_LABELS[row.status]}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-[300px] truncate text-sm">
                {row.configured ? row.subject : (
                  <span className="text-muted-foreground italic">Not configured</span>
                )}
              </TableCell>
              <TableCell>
                {row.configured ? (
                  <Badge variant={row.isActive ? 'default' : 'secondary'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ) : (
                  <Badge variant="outline">Not set</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {row.configured && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openPreview(row.status)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      Preview
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEdit(row.status)}
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    {row.configured ? 'Edit' : 'Configure'}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Edit Email Template — {STATUS_LABELS[editStatus]}
            </DialogTitle>
            <DialogDescription>
              This email will be sent to the client when their order status
              changes to &quot;{STATUS_LABELS[editStatus]}&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                placeholder="Email subject line..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Body (HTML)</label>
              <Textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Write the email body in HTML..."
                className="min-h-[250px] font-mono text-sm"
              />
              <p className="whitespace-pre-line text-xs text-muted-foreground">
                {PLACEHOLDER_HELP}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={editActive}
                onCheckedChange={setEditActive}
              />
              <label className="text-sm font-medium">
                {editActive ? 'Active — email will be sent on status change' : 'Inactive — email will NOT be sent'}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Email Preview — {STATUS_LABELS[editStatus]}
            </DialogTitle>
            <DialogDescription>
              Subject: {editSubject}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-4">
            <div
              dangerouslySetInnerHTML={{
                __html: renderPreviewHtml(editBody)
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getDefaultBody(status: string): string {
  return `<div style="font-family: 'Poppins', sans-serif; padding: 32px; background-color: #f8fafc; border-radius: 12px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
  <h2 style="font-size: 26px; font-weight: 700; margin-bottom: 24px; color: #1f2937; text-align: center;">Order Status Update</h2>
  <p style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 16px;">Dear {{firstName}},</p>
  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
    Your order with reference number <strong style="color: #111827;">{{referenceNumber}}</strong> has been updated to <strong style="color: #111827;">${STATUS_LABELS[status] ?? status}</strong>.
  </p>
  <h3 style="margin-top: 32px; font-size: 20px; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Documents Ordered</h3>
  <p style="margin-top: 16px; color: #4b5563; font-size: 16px;">{{documents}}</p>
  <p style="margin-top: 32px; color: #4b5563; font-size: 14px;">If you have any questions, please don't hesitate to contact us.</p>
  <p style="margin-top: 16px; color: #4b5563; font-size: 14px;">Thank you,<br/><strong>DiReCT</strong></p>
</div>`;
}
