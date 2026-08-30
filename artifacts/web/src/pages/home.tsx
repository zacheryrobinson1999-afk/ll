import { Link } from 'wouter';
import {
  Search,
  Truck,
  Wrench,
  BookOpen,
  Calculator,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

import { TECH_DOCS } from '@/data/techDocs';
import { readSearchRecents, ResultIcon, UnifiedSearchBox } from '@/components/unified-search';

const quickLinks = [
  {
    title: 'Crane Fleet',
    description: 'View crane specifications and details',
    icon: Truck,
    href: '/fleet',
  },
  {
    title: 'Maintenance',
    description: 'Service and inspection procedures',
    icon: Wrench,
    href: '/maintenance',
  },
  {
    title: 'Documents',
    description: 'Technical manuals and reference',
    icon: BookOpen,
    href: '/docs',
  },
  {
    title: 'Tools',
    description: 'Calculators and engineering tools',
    icon: Calculator,
    href: '/tools',
  },
];

const technicianTools = [
  {
    title: 'Daily Code',
    description: 'Generate access codes for supported crane systems',
    icon: Calculator,
    href: '/tools',
  },
  {
    title: 'Crane Lookup',
    description: 'Find fleet specifications and unit information',
    icon: Truck,
    href: '/fleet',
  },
  {
    title: 'Document Search',
    description: 'Search technical manuals and reference material',
    icon: Search,
    href: '/docs',
  },
  {
    title: 'Maintenance',
    description: 'Open service and inspection procedures',
    icon: Wrench,
    href: '/maintenance',
  },
];

export default function HomePage() {
  const recent = readSearchRecents();

  return (
    <div className="min-h-full bg-background pb-24 lg:pb-0">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border py-12 sm:py-16 lg:py-20">
          {/* Decorative industrial glow */}
          <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">

            {/* Hero text */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-1 w-8 bg-primary" />

                <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                  Technician Hub
                </span>
              </div>

              <h1 className="brand-heading max-w-xl text-5xl font-bold uppercase leading-[0.9] tracking-wide sm:text-6xl lg:text-7xl">
                <span className="block text-foreground">
                  Everything Crane.
                </span>

                <span className="block text-primary">
                  One Hub.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
                Crane information, maintenance procedures, technical
                documents and engineering tools — all in one place.
              </p>
            </div>

            {/* Mobile crane visual */}
            <div className="relative hidden min-h-[260px] lg:block">
              <div className="absolute inset-0 bg-gradient-to-l from-primary/10 via-transparent to-transparent" />

              <svg
                viewBox="0 0 620 330"
                role="img"
                aria-label="Stylised yellow mobile crane"
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="crane-yellow" x1="0" x2="1">
                    <stop stopColor="hsl(var(--primary))" />
                    <stop offset="1" stopColor="#d79a00" />
                  </linearGradient>
                  <linearGradient id="crane-steel" x1="0" x2="1">
                    <stop stopColor="#263341" />
                    <stop offset="1" stopColor="#111923" />
                  </linearGradient>
                </defs>

                <g opacity="0.18" stroke="hsl(var(--primary))" strokeWidth="1">
                  <path d="M54 60H570M54 120H570M54 180H570M54 240H570" />
                  <path d="M120 28V285M240 28V285M360 28V285M480 28V285" />
                </g>

                <path d="M52 277H575" stroke="hsl(var(--border))" strokeWidth="4" />
                <path d="M72 269H555" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="8 9" opacity="0.7" />

                <g stroke="hsl(var(--background))" strokeWidth="5" strokeLinejoin="round">
                  <path d="M173 226H366L401 257H142L173 226Z" fill="url(#crane-steel)" />
                  <path d="M176 201H328L365 226H158L176 201Z" fill="url(#crane-yellow)" />
                  <path d="M208 166H303L331 201H178L208 166Z" fill="url(#crane-steel)" />
                  <path d="M255 142H315V167H248L255 142Z" fill="url(#crane-yellow)" />
                  <path d="M292 143L472 50L485 69L324 176Z" fill="url(#crane-yellow)" />
                  <path d="M310 151L475 66" stroke="#fff0b5" strokeWidth="3" opacity="0.6" />
                  <path d="M470 49L548 30L554 47L484 70Z" fill="url(#crane-steel)" />
                  <path d="M542 42V150" stroke="hsl(var(--primary))" strokeWidth="3" />
                  <path d="M542 148L530 169H554L542 148Z" fill="url(#crane-yellow)" />
                  <path d="M142 257H401L421 273H123L142 257Z" fill="url(#crane-yellow)" />
                </g>

                <g fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="6">
                  <circle cx="184" cy="276" r="24" />
                  <circle cx="337" cy="276" r="24" />
                </g>
                <g fill="hsl(var(--muted-foreground))">
                  <circle cx="184" cy="276" r="8" />
                  <circle cx="337" cy="276" r="8" />
                </g>

                <g fill="hsl(var(--primary))">
                  <path d="M112 250H139V265H104Z" />
                  <path d="M397 250H425L437 265H397Z" />
                </g>
              </svg>

              <div className="absolute bottom-2 right-0 text-right">
                <div className="brand-heading text-6xl font-bold uppercase leading-none text-primary/10">
                  MOBILE CRANE
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SEARCH */}
        <section className="relative -mt-1 py-6">
          <UnifiedSearchBox />
        </section>

        {/* QUICK ACCESS */}
        <section className="py-6">
          <SectionHeading title="Quick Access" />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-base font-bold uppercase tracking-wide">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[42px] text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-sm font-bold uppercase text-primary">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* POPULAR RESOURCES */}
        <section className="py-8">
          <SectionHeading
            title="Popular Resources"
            action={
              <Link
                href="/docs"
                className="flex items-center gap-1 text-sm font-bold uppercase text-primary hover:underline"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_DOCS.slice(0, 4).map((doc) => {
              const reference = doc.pages
                ? `${doc.pages} pages`
                : doc.docNumber || 'Technical document';

              return (
                <Link
                  key={doc.id}
                  href="/docs"
                  className="group flex min-h-[270px] flex-col overflow-hidden border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <div className="relative flex h-24 items-center justify-center overflow-hidden border-b border-border bg-gradient-to-br from-secondary to-background">
                    <BookOpen className="h-12 w-12 text-primary/35 transition-transform group-hover:scale-110" />

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-sm bg-primary px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                        {doc.type}
                      </span>
                      <span className="rounded-sm border border-border bg-background/80 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                        {doc.system}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                      {reference}
                    </p>

                    <h3 className="mt-2 line-clamp-2 text-base font-bold leading-5">
                      {doc.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
                      {doc.subtitle}
                    </p>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs font-bold uppercase tracking-wider text-primary">
                      <span>Open Resource</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* TECHNICIAN TOOLS */}
        <section className="py-8">
          <SectionHeading title="Technician Tools" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {technicianTools.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary"
                >
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-bold uppercase tracking-wide">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[40px] text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
                    Open Tool
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* RECENTLY VIEWED */}
        {recent.length > 0 && (
          <section className="pb-12 pt-4">
            <SectionHeading title="Recently Viewed" />

            <div className="overflow-hidden border border-border bg-card">
              {recent.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-4 border-b border-border p-4 last:border-b-0 hover:bg-secondary"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary">
                    <ResultIcon type={item.type} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">
                      {item.title}
                    </div>

                    <div className="truncate text-sm text-muted-foreground">
                      {item.subtitle}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="h-7 w-1 bg-primary" />

        <h2 className="brand-heading text-2xl font-bold uppercase tracking-wide">
          {title}
        </h2>
      </div>

      {action}
    </div>
  );
}
