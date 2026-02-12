import Calendar from 'react-calendar';
import '@/public/styles/Calender.css';
import { Poppins } from 'next/font/google';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setOrderDataSchedule } from '@/store/kiosk/orderSlice';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

export default function Schedule() {
  const dispatch = useAppDispatch();
  const selectOrderData = useAppSelector((state) => state.kioskOrder.orderData);
  const disabledDates: Array<Date> = [new Date(2024, 9, 10), new Date(2024, 9, 20), new Date(2024, 9, 3)];

  const isDisabledDate = (date: Date) => {
    const today = new Date();
    let daysToAdd = 3;
    let threeDaysFromNow = new Date(today);

    while (daysToAdd > 0) {
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 1);
      if (threeDaysFromNow.getDay() !== 0) {
        // Skip Sundays
        daysToAdd--;
      }
    }

    return (
      date < today ||
      date < threeDaysFromNow ||
      disabledDates.some(
        (disabledDate) =>
          date.getFullYear() === disabledDate.getFullYear() &&
          date.getMonth() === disabledDate.getMonth() &&
          date.getDate() === disabledDate.getDate()
      )
    );
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0;
  };

  return (
    <>
      <div className="mb-12 mt-4">
        <h3 className="text-lg font-semibold">Schedule</h3>
        <p className={`mb-4 text-sm text-black/30 ${poppins.className} font-medium`}>
          Select a date for your order to be ready for pickup
        </p>
      </div>
      <div className="h-[50vh] space-y-2 overflow-y-auto overflow-x-hidden p-5">
        <Calendar
          className={selectOrderData.shippingOptions === 'PICKUP' ? '' : 'pointer-events-none opacity-50'}
          onChange={(e) => dispatch(setOrderDataSchedule(e as any))}
          value={selectOrderData.schedule}
          tileDisabled={({ date, view }) => (view === 'month' && isDisabledDate(date)) || isWeekend(date)}
        />
      </div>
    </>
  );
}
