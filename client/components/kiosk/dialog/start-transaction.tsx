import React, { useState } from 'react';
import { Button, Dialog, DialogBackdrop, DialogPanel, DialogTitle, Input } from '@headlessui/react';
import { Poppins } from 'next/font/google';
import { useRouter } from 'next/navigation';
import { fetchStudentNumber, verifyStudentBirthDate } from '@/server/kiosk';
import Swal from 'sweetalert2';
import { LoaderCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

const poppins = Poppins({
  weight: ['100', '200', '300', '400', '500', '600', '900'],
  subsets: ['latin']
});

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i);

export default function StartTransaction(props: {
  modal: { checkStatus: boolean; startTransaction: boolean };
  setModal: React.Dispatch<React.SetStateAction<{ checkStatus: boolean; startTransaction: boolean }>>;
}) {
  const [step, setStep] = useState<'studentNo' | 'verify'>('studentNo');
  const [studentNumber, setStudentNumber] = useState('');
  const [birthMonth, setBirthMonth] = useState<number>(0);
  const [birthYear, setBirthYear] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const resetAndClose = () => {
    setStep('studentNo');
    setStudentNumber('');
    setBirthMonth(0);
    setBirthYear(0);
    setIsLoading(false);
    props.setModal((prev) => ({ ...prev, startTransaction: false }));
  };

  async function onSubmitStudentNumber() {
    if (!studentNumber.trim()) return;
    try {
      setIsLoading(true);
      const response = await fetchStudentNumber(studentNumber);
      if (response.id) {
        setIsLoading(false);
        setStep('verify');
        return;
      }
      setIsLoading(false);
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong. Please try again later.',
        customClass: {
          container: `${poppins.className}`,
          confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
        }
      });
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        return Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: err.message,
          customClass: {
            container: `${poppins.className}`,
            confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
          }
        });
      }
    }
  }

  async function onVerifyBirthDate() {
    if (!birthMonth || !birthYear) {
      return Swal.fire({
        icon: 'warning',
        title: 'Incomplete',
        text: 'Please select both month and year.',
        customClass: {
          container: `${poppins.className}`,
          confirmButton: ` bg-blue-500 text-white hover:bg-blue-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
        }
      });
    }

    try {
      setIsLoading(true);
      const result = await verifyStudentBirthDate(studentNumber, birthMonth, birthYear);

      if (result.verified) {
        setIsLoading(false);
        resetAndClose();
        localStorage.setItem('studentNumber', studentNumber);
        return router.push('/kiosk/order');
      }

      setIsLoading(false);
      return Swal.fire({
        icon: 'error',
        title: 'Verification Failed',
        text: result.error || 'Birth date does not match our records.',
        customClass: {
          container: `${poppins.className}`,
          confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
        }
      });
    } catch {
      setIsLoading(false);
      return Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Verification failed. Please try again.',
        customClass: {
          container: `${poppins.className}`,
          confirmButton: ` bg-red-500 text-white hover:bg-red-600 w-[100px] ${poppins.className} rounded-lg p-3 font-normal`
        }
      });
    }
  }

  return (
    <Dialog
      open={props.modal.startTransaction}
      onClose={resetAndClose}
      className="relative z-10 "
    >
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto ">
        <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-0 ">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] w-full max-w-2xl rounded-xl bg-white p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0 "
          >
            {step === 'studentNo' ? (
              <>
                <DialogTitle
                  as="h3"
                  className={`text-center text-2xl font-medium text-black/75 ${poppins.className} font-semibold `}
                >
                  Student Number
                </DialogTitle>
                <p className={`mt-1 text-sm text-black/30 ${poppins.className} mb-4 text-center font-medium`}>
                  Please enter your student number before to proceed.
                </p>
                <Input
                  minLength={3}
                  maxLength={15}
                  name="studentNumber"
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSubmitStudentNumber(); }}
                  className={`h-14 w-full rounded-xl bg-blue-100 text-center text-black focus:outline-1 data-[focus]:bg-blue-100 ${poppins.className} caret text-2xl font-semibold uppercase caret-blue-500 focus:outline-none`}
                />
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    className={`inline-flex items-center gap-2 rounded-md bg-gray-100 px-5 py-2 text-sm/6 font-medium text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-200 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                    onClick={resetAndClose}
                    type="button"
                  >
                    Cancel
                  </Button>
                  {isLoading ? (
                    <Button
                      className={`inline-flex items-center gap-2 rounded-md bg-blue-300 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none  data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                    >
                      <LoaderCircle className="animate-spin" />
                    </Button>
                  ) : (
                    <Button
                      className={`inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2 text-sm/6 font-medium text-white shadow-inner  focus:outline-none data-[hover]:bg-blue-600 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white ${poppins.className} font-semibold`}
                      onClick={onSubmitStudentNumber}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <ShieldCheck className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <DialogTitle
                  as="h3"
                  className={`text-center text-2xl font-medium text-black/75 ${poppins.className} font-semibold `}
                >
                  Identity Verification
                </DialogTitle>
                <p className={`mt-1 text-sm text-black/30 ${poppins.className} mb-1 text-center font-medium`}>
                  For your security, please verify your identity.
                </p>
                <p className={`text-xs text-black/40 ${poppins.className} mb-5 text-center`}>
                  Student No: <span className="font-semibold uppercase text-black/60">{studentNumber}</span>
                </p>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={`mb-1 block text-xs font-medium text-black/40 ${poppins.className}`}>
                      Birth Month *
                    </label>
                    <select
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(Number(e.target.value))}
                      className={`h-14 w-full rounded-xl bg-blue-100 px-4 text-center text-black focus:outline-none ${poppins.className} text-lg font-semibold`}
                    >
                      <option value={0} disabled>Select Month</option>
                      {MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={`mb-1 block text-xs font-medium text-black/40 ${poppins.className}`}>
                      Birth Year *
                    </label>
                    <select
                      value={birthYear}
                      onChange={(e) => setBirthYear(Number(e.target.value))}
                      className={`h-14 w-full rounded-xl bg-blue-100 px-4 text-center text-black focus:outline-none ${poppins.className} text-lg font-semibold`}
                    >
                      <option value={0} disabled>Select Year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex justify-between gap-2">
                  <Button
                    className={`inline-flex items-center gap-1 rounded-md bg-gray-100 px-5 py-2 text-sm/6 font-medium text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-200 ${poppins.className} font-semibold`}
                    onClick={() => {
                      setStep('studentNo');
                      setBirthMonth(0);
                      setBirthYear(0);
                    }}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      className={`inline-flex items-center gap-2 rounded-md bg-gray-100 px-5 py-2 text-sm/6 font-medium text-black shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-200 ${poppins.className} font-semibold`}
                      onClick={resetAndClose}
                      type="button"
                    >
                      Cancel
                    </Button>
                    {isLoading ? (
                      <Button
                        className={`inline-flex items-center gap-2 rounded-md bg-blue-300 px-5 py-2 text-sm/6 font-medium text-white shadow-inner focus:outline-none ${poppins.className} font-semibold`}
                      >
                        <LoaderCircle className="animate-spin" />
                      </Button>
                    ) : (
                      <Button
                        className={`inline-flex items-center gap-2 rounded-md bg-blue-500 px-5 py-2 text-sm/6 font-medium text-white shadow-inner focus:outline-none data-[hover]:bg-blue-600 ${poppins.className} font-semibold`}
                        onClick={onVerifyBirthDate}
                      >
                        Verify & Proceed
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
