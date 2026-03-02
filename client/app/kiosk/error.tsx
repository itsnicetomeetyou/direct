'use client';

import { useEffect } from 'react';

export default function KioskError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Kiosk error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-blue-500 p-6 text-white">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-white/90">
        The kiosk encountered an error. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-white px-6 py-3 text-sm font-medium text-blue-600 hover:bg-white/90"
      >
        Try again
      </button>
    </div>
  );
}
