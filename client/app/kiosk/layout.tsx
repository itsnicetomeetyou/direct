export default function KioskLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="select-none [&_img]:select-none [&_img]:[-webkit-user-drag:none]"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
