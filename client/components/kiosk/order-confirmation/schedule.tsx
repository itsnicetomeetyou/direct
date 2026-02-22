'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Calendar from 'react-calendar';
import '@/public/styles/Calender.css';
import { Poppins } from 'next/font/google';
import { Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setOrderDataSchedule } from '@/store/kiosk/orderSlice';
import { fetchScheduleConfig, fetchHolidays, checkScheduleForMonth } from '@/server/kiosk';
import moment from 'moment';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

type ScheduleConfig = { maxSlotsPerDay: number; minDaysAdvance: number };
type HolidayItem = { date: string; name: string | null };
type SlotInfo = { used: number; maxSlots: number; remaining: number; disabled: boolean };

export default function Schedule() {
  const dispatch = useAppDispatch();
  const selectOrderData = useAppSelector((state) => state.kioskOrder.orderData);
  const [config, setConfig] = useState<ScheduleConfig>({ maxSlotsPerDay: 300, minDaysAdvance: 3 });
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [slotMap, setSlotMap] = useState<Record<string, SlotInfo>>({});
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  useEffect(() => {
    Promise.all([fetchScheduleConfig(), fetchHolidays()]).then(([cfg, hols]) => {
      setConfig(cfg);
      setHolidays(hols);
      setLoading(false);
    });
  }, []);

  const loadSlots = useCallback((year: number, month: number) => {
    checkScheduleForMonth(year, month).then((data) => {
      setSlotMap((prev) => ({ ...prev, ...data }));
    });
  }, []);

  useEffect(() => {
    loadSlots(activeMonth.year, activeMonth.month);
  }, [activeMonth, loadSlots]);

  const minDaysAdvance = useMemo(() => {
    const selectedItems = selectOrderData.orderItem;
    if (selectedItems.length === 0) return 3;
    return Math.max(...selectedItems.map((item) => item.dayBeforeRelease ?? 3));
  }, [selectOrderData.orderItem]);

  const isDisabledDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daysToAdd = minDaysAdvance;
    const minDate = new Date(today);
    while (daysToAdd > 0) {
      minDate.setDate(minDate.getDate() + 1);
      if (minDate.getDay() !== 0) {
        daysToAdd--;
      }
    }

    if (date < today || date < minDate) return true;

    const dateStr = moment(date).format('YYYY-MM-DD');
    if (holidays.some((h) => h.date === dateStr)) return true;

    const slot = slotMap[dateStr];
    if (slot && slot.disabled) return true;

    return false;
  };

  const isWeekend = (date: Date) => {
    return date.getDay() === 0;
  };

  const getSlotInfo = (date: Date): SlotInfo | null => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    return slotMap[dateStr] || null;
  };

  return (
    <>
      <div className="mb-12 mt-4">
        <h3 className="text-lg font-semibold">Schedule</h3>
        <p className={`mb-4 text-sm text-black/30 ${poppins.className} font-medium`}>
          Select a date for your order to be ready for pickup
        </p>
        <p className={`text-xs text-black/30 ${poppins.className}`}>
          Must be at least {minDaysAdvance} business days in advance. Sundays and holidays are not available.
        </p>
      </div>
      <div className="h-[50vh] space-y-2 overflow-y-auto overflow-x-hidden p-5">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <Calendar
              onChange={(e) => dispatch(setOrderDataSchedule(e as any))}
              value={selectOrderData.schedule}
              tileDisabled={({ date, view }) => (view === 'month' && isDisabledDate(date)) || isWeekend(date)}
              tileContent={({ date, view }) => {
                if (view !== 'month') return null;
                if (isWeekend(date)) return null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return null;

                const slot = getSlotInfo(date);
                const remaining = slot ? slot.remaining : config.maxSlotsPerDay;
                const maxSlots = slot ? slot.maxSlots : config.maxSlotsPerDay;

                if (slot && slot.disabled) {
                  return (
                    <span className="mt-0.5 block text-[9px] font-semibold leading-tight text-red-500">
                      Full
                    </span>
                  );
                }

                if (slot && slot.used > 0) {
                  return (
                    <span className="mt-0.5 block text-[9px] font-medium leading-tight text-blue-500">
                      {remaining}/{maxSlots}
                    </span>
                  );
                }

                return null;
              }}
              onActiveStartDateChange={({ activeStartDate }) => {
                if (activeStartDate) {
                  setActiveMonth({
                    year: activeStartDate.getFullYear(),
                    month: activeStartDate.getMonth() + 1
                  });
                }
              }}
            />
            {selectOrderData.schedule && (
              <div className={`mt-3 rounded-lg bg-blue-50 px-4 py-2 text-center ${poppins.className}`}>
                {(() => {
                  const slot = getSlotInfo(new Date(selectOrderData.schedule));
                  const remaining = slot ? slot.remaining : config.maxSlotsPerDay;
                  const maxSlots = slot ? slot.maxSlots : config.maxSlotsPerDay;
                  return (
                    <p className="text-sm font-medium text-blue-700">
                      {remaining} / {maxSlots} slots remaining
                    </p>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
