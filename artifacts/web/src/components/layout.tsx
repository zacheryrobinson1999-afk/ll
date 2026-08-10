import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Settings, Truck, BookOpen } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: '/fleet', label: 'Fleet', icon: Truck },
    { href: '/docs', label: 'Docs', icon: BookOpen },
    { href: '/maintenance', label: 'Maintenance', icon: Settings },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-50 flex items-center h-16 px-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
            LTC
          </div>
          <h1 className="font-bold text-lg tracking-tight">Engineering Tools</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto w-full max-w-5xl mx-auto pb-24 md:pb-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? location === '/' : location.startsWith(item.href);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-1 gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <nav className="hidden md:flex fixed top-16 bottom-0 left-0 w-64 flex-col border-r border-border bg-card/50 p-4 gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? location === '/' : location.startsWith(item.href);
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground font-semibold' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground font-medium'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Desktop spacing offset */}
      <div className="hidden md:block fixed top-16 bottom-0 left-0 w-64 pointer-events-none" />
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 768px) {
          main { padding-left: 16rem; }
        }
      `}} />
    </div>
  );
}