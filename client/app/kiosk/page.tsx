import KioskPage from '@/components/kiosk/kiosk-page';

export default function Page() {
  return (
    <div className="min-h-screen select-none bg-blue-500 text-white">
      <div className="mx-auto max-w-6xl overflow-hidden">
        <KioskPage />
      </div>
    </div>
  );
}
