import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { fetchScheduleConfig, fetchHolidays } from '@/server/settings';
import ScheduleOptionsClient from './schedule-options-client';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Settings', link: '/dashboard/settings/schedule-options' },
  { title: 'Schedule Options', link: '/dashboard/settings/schedule-options' }
];

export const metadata = {
  title: 'Dashboard : Schedule Options'
};

export default async function ScheduleOptionsPage() {
  const config = await fetchScheduleConfig();
  const holidays = await fetchHolidays();

  return (
    <PageContainer scrollable>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <ScheduleOptionsClient
          config={{
            id: config.id,
            maxSlotsPerDay: config.maxSlotsPerDay,
            minDaysAdvance: config.minDaysAdvance
          }}
          holidays={holidays.map((h) => ({
            id: h.id,
            date: h.date.toISOString(),
            name: h.name
          }))}
        />
      </div>
    </PageContainer>
  );
}
