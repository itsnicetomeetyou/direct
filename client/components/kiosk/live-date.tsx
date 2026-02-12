'use client';
import { useEffect, useState } from 'react';
import moment from 'moment';

export default function LiveDate() {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <>{moment(currentDate).format('MMMM Do YYYY, h:mm A')}</>;
}
