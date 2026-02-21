'use client';
import { useState } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import { Poppins } from 'next/font/google';
import Image from 'next/image';
import StartTransaction from '@/components/kiosk/dialog/start-transaction';
import CheckStatus from '@/components/kiosk/dialog/check-status';
import LiveDate from '@/components/kiosk/live-date';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '600', '900'],
  subsets: ['latin']
});

export default function KioskPage() {
  const [modal, setModal] = useState<{
    checkStatus: boolean;
    startTransaction: boolean;
  }>({
    checkStatus: false,
    startTransaction: false
  });
  return (
    <>
      <header className="flex h-[10vh] items-center justify-between">
        <div className="flex flex-row items-center">
          <Image src="/images/direct_logo.png" height={80} width={80} alt="DiReCT's Logo" />
          <p className={`ml-3 ${poppins.className} text-3xl font-bold`}>DiReCT+</p>
        </div>
        <div className="text-sm">
          <span className={`mr-4 ${poppins.className} font-medium`}>
            <LiveDate />
          </span>
        </div>
      </header>

      <main className="flex h-[90vh] flex-row md:flex-row">
        <div className="relative top-40  w-[60%]  flex-shrink md:mb-0 md:mr-8">
          <h1 className={`text-6xl font-bold md:text-6xl ${poppins.className} font-semibold tracking-wide`}>
            <span className=" text-white/50">Hi!</span> Schedule your document here.
          </h1>
          <p
            className={`text-lg text-foreground ${poppins.className} mb-10 mt-3 font-light tracking-wide text-white opacity-75`}
          >
            Please select a document on the right side to proceed with your desired action.
          </p>
          <Image
            src="/images/calendar.png"
            height={700}
            width={700}
            alt={"Calendar Image's"}
            loading="lazy"
            sizes="auto"
          />
        </div>

        <div className="flex w-[40%] flex-shrink flex-col items-end space-y-6 self-center">
          <button className="relative" onClick={() => setModal((prev) => ({ ...prev, checkStatus: true }))}>
            <Image
              src="/images/document-style.png"
              height={300}
              width={250}
              alt="Document Style's"
              loading="lazy"
              sizes="auto"
            />
            <span
              className={`absolute left-[10%] top-[25%]  font-semibold ${poppins.className}  w-[80%] text-blue-500`}
            >
              <p className="text-left text-4xl">Check Status</p>
              <Search size={70} className="absolute right-0 mt-6 text-blue-500" />
            </span>
          </button>

          <CheckStatus modal={modal} setModal={setModal} />

          <button className="relative" onClick={() => setModal((prev) => ({ ...prev, startTransaction: true }))}>
            <Image
              src="/images/document-style.png"
              height={300}
              width={250}
              alt="Document Style's"
              loading="lazy"
              sizes="auto"
            />
            <span className={`absolute left-[5%] top-[25%]  font-semibold ${poppins.className}  w-[90%] text-blue-500`}>
              <p className="text-left text-4xl">Start Transaction</p>
              <CalendarCheck size={70} className="absolute right-0 mt-6 text-blue-500" />
            </span>
          </button>

          <StartTransaction modal={modal} setModal={setModal} />
        </div>
      </main>
    </>
  );
}
