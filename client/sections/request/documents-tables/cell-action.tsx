'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import ViewMoreModal from '@/components/modal/view-more-modal';
import ViewTrackingModal from '@/components/modal/view-tracking-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { Document, TDocumentRequest } from '@/constants/data';
import { deleteDocument } from '@/server/document';
import { Edit, MoreHorizontal, Trash, MapPin } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

interface CellActionProps {
  data: TDocumentRequest;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [viewTracking, setViewTracking] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onConfirm = async () => {
    try {
      setLoading(true);
      const response = await deleteDocument(data.id);
      if (response.id) {
        router.refresh();
        setLoading(false);
        setOpen(false);
        return toast({
          title: 'Document deleted',
          description: 'Document deleted successfully'
        });
      }
      setLoading(false);
      setOpen(false);
      return toast({
        title: 'Failed to delete document',
        description: 'Failed to delete document'
      });
    } catch (err) {
      if (err instanceof Error) {
        setLoading(false);
        setOpen(false);
        return toast({
          title: 'Something went wrong',
          description: err.message
        });
      }
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onConfirm} loading={loading} />
      <ViewMoreModal isOpen={openView} onClose={() => setOpenView(false)} data={data} mode="EDIT" />
      <ViewTrackingModal isOpen={viewTracking} onClose={() => setViewTracking(false)} data={data} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setOpenView(true)}>
            <Edit className="mr-2 h-4 w-4" /> View More
          </DropdownMenuItem>
          {data.deliverOptions !== 'PICKUP' && (data.status === 'OUTFORDELIVERY' || data.status === 'COMPLETED') && (
            <DropdownMenuItem onClick={() => setViewTracking(true)}>
              <MapPin className="mr-2 h-4 w-4" /> View Logistic Tracking
            </DropdownMenuItem>
          )}
          {/* <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
