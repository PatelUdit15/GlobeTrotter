export default function MobileHeader() {
  return (
    <header className="flex md:hidden justify-between items-center w-full px-4 py-4 bg-surface-pure border-b border-surface-muted sticky top-0 z-30">
      <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: 'Inter' }}>GlobeTrotter</h1>
      <div className="flex items-center gap-4 text-on-surface-variant">
        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">notifications</span>
        <span className="material-symbols-outlined cursor-pointer hover:text-primary transition-colors">account_circle</span>
      </div>
    </header>
  );
}
