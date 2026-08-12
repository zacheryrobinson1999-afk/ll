import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Home,
  Search,
  Truck,
  Wrench,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/fleet', label: 'Fleet', icon: Truck },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/docs', label: 'Documents', icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      {/* Top header */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b border-border bg-card/95 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          {/* CraneHub logo block */}
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xs font-black tracking-tight text-primary-foreground shadow-md">
            CH
          </div>

          <div>
            <h1 className="brand-heading text-2xl font-bold uppercase leading-none tracking-wide">
              CraneHub
            </h1>

            <p className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Technician Hub
            </p>
          </div>
        </div>

        {/* Desktop search button */}
        <Link
          href="/"
          className="ml-auto hidden items-center gap-2 rounded-md border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
        >
          <Search className="h-4 w-4" />
          Search everything
          <kbd className="ml-4 rounded border border-border px-1.5 py-0.5 text-[10px]">
            /
          </kbd>
        </Link>
      </header>

      {/* Main content */}
      <main className="min-h-0 flex-1 w-full max-w-6xl mx-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          <MobileNavItem
            href="/"
            label="Home"
            icon={Home}
            active={isActive('/')}
          />

          <MobileNavItem
            href="/fleet"
            label="Fleet"
            icon={Truck}
            active={isActive('/fleet')}
          />

          <MobileNavItem
            href="/maintenance"
            label="Maintenance"
            icon={Wrench}
            active={isActive('/maintenance')}
          />

          <MobileNavItem
            href="/docs"
            label="Documents"
            icon={BookOpen}
            active={isActive('/docs')}
          />

          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-1 px-1 py-3 text-muted-foreground transition-colors hover:text-foreground"
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium uppercase tracking-wider">
              More
            </span>
          </Link>
        </div>
      </nav>

      {/* Desktop side navigation */}
      <nav className="fixed bottom-0 left-0 top-16 hidden w-64 flex-col gap-2 border-r border-border bg-card/50 p-4 md:flex">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          CraneHub
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-4 py-3 transition-colors ${
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="my-2 border-t border-border" />

        <div className="px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Quick Search
        </div>

        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-4 py-3 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Search className="h-5 w-5" />
          <span>Search Everything</span>
        </Link>
      </nav>

      {/* Desktop content offset */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 768px) {
              main {
                padding-left: 16rem;
              }
            }
          `,
        }}
      />
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 px-1 py-3 transition-colors ${
        active
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Icon className="h-5 w-5" />

      <span className="text-[10px] font-medium uppercase tracking-wider">
        {label}
      </span>
    </Link>
  );
}
