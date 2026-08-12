import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  Truck,
  Wrench,
  BookOpen,
  Calculator,
  Search,
  MoreHorizontal,
  User,
} from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/fleet', label: 'Fleet', icon: Truck },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/docs', label: 'Documents', icon: BookOpen },
    { href: '/tools', label: 'Tools', icon: Calculator },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <div className="dark min-h-[100dvh] bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <button
            type="button"
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Menu"
          >
            <MoreHorizontal className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-sm font-black text-primary-foreground shadow-lg">
              CH
            </div>

            <div className="leading-none">
              <div className="brand-heading text-[27px] font-bold uppercase tracking-wide">
                <span className="text-foreground">CRANE</span>
                <span className="text-primary">HUB</span>
              </div>

              <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                Technician Hub
              </div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-6 text-xs font-bold uppercase tracking-wider transition-colors ${
                    active
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}

                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary" />
                  )}
                </Link>
              );
            })}

            <button
              type="button"
              className="flex items-center gap-2 px-4 py-6 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
              More
            </button>
          </nav>

          {/* Header actions */}
          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card hover:border-primary/50 hover:bg-secondary"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>

            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-md border border-border bg-card hover:border-primary/50 hover:bg-secondary sm:flex"
              aria-label="User"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="min-h-[calc(100dvh-72px)]">
        {children}
      </main>

      {/* Mobile navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/98 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[68px] flex-col items-center justify-center gap-1 ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />

                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
