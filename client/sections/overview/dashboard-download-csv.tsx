'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { exportDashboardCsv } from '@/server/statistics';
import { Download } from 'lucide-react';
import moment from 'moment';
import { useState } from 'react';

export function DashboardDownloadCsv() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const { content, error } = await exportDashboardCsv();
      if (error || !content) {
        toast({
          variant: 'destructive',
          title: 'Download failed',
          description: error ?? 'No data to export.'
        });
        return;
      }
      const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-report-${moment().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'CSV downloaded', description: 'Dashboard report saved.' });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Could not export dashboard. Try again.'
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading} className="gap-2">
      <Download className="h-4 w-4" />
      {loading ? 'Exporting…' : 'Download CSV'}
    </Button>
  );
}
