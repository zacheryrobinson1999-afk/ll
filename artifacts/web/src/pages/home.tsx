import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import {
  Search,
  Truck,
  Wrench,
  BookOpen,
  Calculator,
  ArrowRight,
  Clock3,
  FileText,
  X,
} from 'lucide-react';

import { FLEET } from '@/data/craneFleet';
import { TECH_DOCS } from '@/data/techDocs';

type SearchResult = {
  type: 'crane' | 'document';
  id: string;
  title: string;
  subtitle: string;
  href: string;
};

const quickLinks = [
  {
    title: 'Crane Fleet',
    description: 'Find your crane and view specifications',
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
    description: 'Manuals, diagnostics and technical guides',
    icon: BookOpen,
    href: '/docs',
  },
  {
    title: 'Tools',
    description: 'LICCON and engineering tools',
    icon: Calculator,
    href: '/tools',
  },
];

function saveRecent(item: SearchResult) {
  try {
    const existing: SearchResult[] = JSON.parse(
      localStorage.getItem('ltc-recent') || '[]',
    );

    const updated = [
      item,
      ...existing.filter((entry) => entry.id !== item.id),
    ].slice(0, 6);

    localStorage.setItem('ltc-recent', JSON.stringify(updated));
  } catch {
    // Local storage is optional; never break the app if unavailable.
  }
}

function getRecent(): SearchResult[] {
  try {
    return JSON.parse(localStorage.getItem('ltc-recent') || '[]');
  } catch {
    return [];
  }
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<SearchResult[]>(getRecent);

  const results = useMemo<SearchResult[]>(() => {
    const search = query.trim().toLowerCase();

    if (!search) return [];

    const craneResults: SearchResult[] = FLEET
      .filter((crane) =>
        [
          crane.manufacturer,
          crane.model,
          crane.category,
          crane.notes,
          crane.id,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search),
      )
      .slice(0, 8)
      .map((crane) => ({
        type: 'crane',
        id: `crane-${crane.id}`,
        title: crane.model,
        subtitle: `${crane.manufacturer} · ${crane.category} · ${crane.maxCapacity} t`,
        href: `/fleet`,
      }));

    const documentResults: SearchResult[] = TECH_DOCS
      .filter((doc) =>
        [
          doc.title,
          doc.subtitle,
          doc.system,
          doc.type,
          doc.summary,
          ...doc.appliesTo,
          ...doc.craneTypes,
        ]
          .join(' ')
          .toLowerCase()
          .includes(search),
      )
      .slice(0, 8)
      .map((doc) => ({
        type: 'document',
        id: `doc-${doc.id}`,
        title: doc.title,
        subtitle: `${doc.type} · ${doc.system}`,
        href: '/docs',
      }));

    return [...craneResults, ...documentResults].slice(0, 10);
  }, [query]);

  function openResult(result: SearchResult) {
    saveRecent(result);
    setRecent(getRecent());
    setQuery('');
  }

  function clearSearch() {
    setQuery('');
  }

  return (
    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <section className="mb-8">
          <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            LTC Engineering
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Technician Toolbox
          </h2>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            Crane information, maintenance procedures, technical documents
            and engineering tools — all in one place.
          </p>
        </section>

        {/* Global search */}
        <section className="relative mb-8">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
            <Search className="h-6 w-6 shrink-0 text-muted-foreground" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cranes, manuals, procedures..."
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              aria-label="Search cranes, manuals and procedures"
            />

            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search results */}
          {query && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              {results.length > 0 ? (
                <div className="max-h-[60vh] overflow-y-auto p-2">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={() => openResult(result)}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-secondary"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        {result.type === 'crane' ? (
                          <Truck className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">
                          {result.title}
                        </div>
                        <div className="truncate text-sm text-muted-foreground">
                          {result.subtitle}
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Search className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                  <p className="font-medium">No results found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a crane model, manufacturer, system or document name.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Quick access */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">Quick Access</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h4 className="font-bold">{item.title}</h4>

                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary">
                    Open
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Recently viewed */}
        {recent.length > 0 && (
          <section className="mt-10">
            <div className="mb-4 flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-bold">Recently Viewed</h3>
            </div>

            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {recent.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-3 p-4 hover:bg-secondary"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    {item.type === 'crane' ? (
                      <Truck className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.title}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {item.subtitle}
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}