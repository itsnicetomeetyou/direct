'use client';

import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  updateScheduleConfig,
  createHoliday,
  deleteHoliday,
  updateDocumentMinDays
} from '@/server/settings';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleConfig {
  id: string;
  maxSlotsPerDay: number;
}

interface HolidayItem {
  id: string;
  date: string;
  name: string | null;
}

interface DocumentMinDays {
  id: string;
  name: string;
  dayBeforeRelease: number;
}

export default function ScheduleOptionsClient({
  config,
  holidays,
  documents
}: {
  config: ScheduleConfig;
  holidays: HolidayItem[];
  documents: DocumentMinDays[];
}) {
  const router = useRouter();
  const [maxSlots, setMaxSlots] = useState(config.maxSlotsPerDay);
  const [saving, setSaving] = useState(false);

  const [docDays, setDocDays] = useState<Record<string, number>>(
    Object.fromEntries(documents.map((d) => [d.id, d.dayBeforeRelease]))
  );
  const [savingDocs, setSavingDocs] = useState(false);

  const [holidayDate, setHolidayDate] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await updateScheduleConfig({
        maxSlotsPerDay: maxSlots,
        minDaysAdvance: 0
      });
      toast.success('Settings saved successfully');
      router.refresh();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDocDays = async () => {
    setSavingDocs(true);
    try {
      const updates = Object.entries(docDays).map(([id, dayBeforeRelease]) => ({
        id,
        dayBeforeRelease
      }));
      await updateDocumentMinDays(updates);
      toast.success('Minimum days updated for all transactions');
      router.refresh();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSavingDocs(false);
    }
  };

  const handleAddHoliday = async () => {
    if (!holidayDate) return;
    setAddingHoliday(true);
    try {
      await createHoliday({
        date: new Date(holidayDate),
        name: holidayName || undefined
      });
      setHolidayDate('');
      setHolidayName('');
      toast.success('Holiday added');
      router.refresh();
    } catch {
      toast.error('Failed to add holiday');
    } finally {
      setAddingHoliday(false);
    }
  };

  const handleDeleteHoliday = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteHoliday(id);
      toast.success('Holiday removed');
      router.refresh();
    } catch {
      toast.error('Failed to delete holiday');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Schedule Configuration */}
        <div className="rounded-md border p-6">
          <Heading
            title="Schedule Configuration"
            description="Manage daily slot limits"
          />
          <Separator className="my-4" />

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Maximum Slots Per Day
              </label>
              <Input
                type="number"
                value={maxSlots}
                onChange={(e) => setMaxSlots(parseInt(e.target.value) || 0)}
                min={1}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Maximum number of schedules allowed per day
              </p>
            </div>

            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>

        {/* Holidays */}
        <div className="rounded-md border p-6">
          <Heading
            title="Holidays"
            description="Manage dates when scheduling is closed"
          />
          <Separator className="my-4" />

          <div className="mb-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">Date</label>
              <Input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium">
                Name (Optional)
              </label>
              <Input
                placeholder="e.g., New Year"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </div>
            <Button
              size="icon"
              onClick={handleAddHoliday}
              disabled={!holidayDate || addingHoliday}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {holidays.length > 0 && (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
                <span>Date</span>
                <span>Name</span>
                <span>Actions</span>
              </div>
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="grid grid-cols-[1fr_1fr_auto] items-center gap-4 py-2"
                >
                  <span className="text-sm">
                    {format(new Date(holiday.date), 'MMM d, yyyy')}
                  </span>
                  <span className="text-sm text-primary">
                    {holiday.name || ''}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteHoliday(holiday.id)}
                    disabled={deletingId === holiday.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {holidays.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No holidays configured yet.
            </p>
          )}
        </div>
      </div>

      {/* Minimum Days Advance Per Transaction */}
      <div className="rounded-md border p-6">
        <Heading
          title="Minimum Days Advance Per Transaction"
          description="Set the minimum number of business days required before scheduling for each transaction type"
        />
        <Separator className="my-4" />

        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No transaction types found. Add documents in the Transaction List first.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-[1fr_150px] gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
              <span>Transaction Type</span>
              <span>Min Days</span>
            </div>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="grid grid-cols-[1fr_150px] items-center gap-4"
              >
                <span className="text-sm font-medium">{doc.name}</span>
                <Input
                  type="number"
                  min={0}
                  max={365}
                  value={docDays[doc.id] ?? 3}
                  onChange={(e) =>
                    setDocDays((prev) => ({
                      ...prev,
                      [doc.id]: parseInt(e.target.value) || 0
                    }))
                  }
                  className="h-9"
                />
              </div>
            ))}
            <div className="pt-2">
              <Button onClick={handleSaveDocDays} disabled={savingDocs}>
                {savingDocs && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {savingDocs ? 'Saving...' : 'Save Minimum Days'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
