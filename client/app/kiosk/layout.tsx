export default function KioskLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="select-none">
      {children}
    </div>
  );
}
