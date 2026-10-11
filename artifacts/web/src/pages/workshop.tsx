import { BookOpen, Clock3, FileText, Star, Truck } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { Link } from 'wouter';
import { TECH_DOCS, type TechDoc } from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';
import { useAuth } from '@/lib/auth-context';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useManualActivity } from '@/hooks/useManualActivity';
import { useFavouriteCranes } from '@/hooks/useFavouriteCranes';
import { manualDetailHref, bookmarkedManuals, bookmarkedSections, recentManuals } from '../../../api-server/src/lib/catalog/manualDetail';
import { Button } from '@/components/ui/button';
import { loadCustomCranes } from '@/lib/customFleet';

function SectionCard({ doc, section, page }: { doc: TechDoc; section: string; page: string }) {
  return <Link href={manualDetailHref(doc.id, { from: '/workshop', section, page })} className="block min-w-0 rounded-lg border border-border bg-card p-4 hover:border-primary focus-visible:outline focus-visible:outline-primary"><div className="flex items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><h3 className="break-words font-semibold">{doc.title}</h3><p className="mt-1 break-words text-sm text-muted-foreground">Section {section} · {page ? `PDF page ${page}` : 'Page not indexed'}</p></div></div></Link>;
}

export default function WorkshopPage() {
  const { user } = useAuth();
  const { bookmarks, loading: bookmarksLoading, error: bookmarksError, refresh } = useBookmarks();
  const activity = useManualActivity(null);
  const { favouriteCraneIds } = useFavouriteCranes(user?.id);
  const allCranes = useMemo(() => [...FLEET, ...loadCustomCranes()], []);
  const cranes = favouriteCraneIds.map(id => allCranes.find(crane => crane.id === id)).filter(Boolean);
  const manuals = bookmarkedManuals(TECH_DOCS, bookmarks);
  const recent = recentManuals(TECH_DOCS, activity.events);
  const sections = bookmarkedSections(TECH_DOCS, bookmarks);
  return <main className="mx-auto max-w-6xl space-y-7 p-4 pb-28 sm:p-6 md:p-8">
    <header><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Personal workspace</p><h1 className="mt-1 text-4xl font-extrabold tracking-tight">My Workshop</h1><p className="mt-2 max-w-2xl text-muted-foreground">Quick access to your cranes, saved manual references, and recently opened documents.</p></header>
    <section aria-labelledby="workshop-cranes" className="space-y-3"><div className="flex items-center justify-between gap-3"><h2 id="workshop-cranes" className="flex items-center gap-2 text-2xl font-bold"><Truck className="h-5 w-5 text-primary" />Favourite cranes</h2><Link href="/fleet" className="text-sm font-semibold text-primary">Open Fleet</Link></div>{cranes.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{cranes.map(crane => <Link key={crane!.id} href={`/fleet?crane=${encodeURIComponent(crane!.id)}`} className="rounded-lg border border-border bg-card p-4 hover:border-primary"><p className="text-xs uppercase tracking-wide text-muted-foreground">{crane!.manufacturer}</p><h3 className="mt-1 font-bold">{crane!.model}</h3><p className="mt-2 text-sm text-muted-foreground">{crane!.category}</p></Link>)}</div> : <Empty icon={<Truck />} title="No favourite cranes yet" text="Star a crane in Fleet to keep it here." href="/fleet" label="Browse Fleet" />}</section>
    <section aria-labelledby="workshop-manuals" className="space-y-3"><div className="flex items-center justify-between gap-3"><h2 id="workshop-manuals" className="flex items-center gap-2 text-2xl font-bold"><Star className="h-5 w-5 text-primary" />Saved manuals</h2><Link href="/docs" className="text-sm font-semibold text-primary">Browse Manuals</Link></div>{bookmarksLoading ? <Loading text="Loading saved manuals…" /> : bookmarksError ? <Retry text={bookmarksError} onRetry={refresh} /> : manuals.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{manuals.map(doc => <Link key={doc.id} href={manualDetailHref(doc.id, { from: '/workshop' })} className="rounded-lg border border-border bg-card p-4 hover:border-primary"><h3 className="break-words font-semibold">{doc.title}</h3><p className="mt-1 text-sm text-muted-foreground">{doc.system} · Whole manual</p></Link>)}</div> : <Empty icon={<BookOpen />} title="No saved manuals yet" text="Bookmark a whole manual from the library or its detail page." href="/docs" label="Browse Manuals" />}</section>
    <section aria-labelledby="workshop-sections" className="space-y-3"><h2 id="workshop-sections" className="flex items-center gap-2 text-2xl font-bold"><FileText className="h-5 w-5 text-primary" />Saved sections and pages</h2>{bookmarksLoading ? <Loading text="Loading saved sections…" /> : bookmarksError ? <Retry text={bookmarksError} onRetry={refresh} /> : sections.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{sections.map(({ bookmark, doc, section, page }) => <SectionCard key={`${bookmark.documentId}-${section.ref}-${page}`} doc={doc} section={section.ref} page={page} />)}</div> : <Empty icon={<FileText />} title="No saved sections yet" text="Save a section from a manual detail page when you need a verified reference close at hand." href="/docs" label="Browse Manuals" />}</section>
    <section aria-labelledby="workshop-recent" className="space-y-3"><div className="flex items-center justify-between gap-3"><h2 id="workshop-recent" className="flex items-center gap-2 text-2xl font-bold"><Clock3 className="h-5 w-5 text-primary" />Recently opened manuals</h2><Link href="/docs" className="text-sm font-semibold text-primary">Open Manuals</Link></div>{activity.loading ? <Loading text="Loading recent manuals…" /> : activity.error ? <Retry text="Recent activity is unavailable." onRetry={activity.retry} /> : recent.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{recent.map(({ doc, openedAt }) => <Link key={doc.id} href={manualDetailHref(doc.id, { from: '/workshop' })} className="rounded-lg border border-border bg-card p-4 hover:border-primary"><h3 className="break-words font-semibold">{doc.title}</h3><p className="mt-1 text-sm text-muted-foreground">{openedAt ? new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(openedAt)) : 'Recently opened'}</p></Link>)}</div> : <Empty icon={<Clock3 />} title="No recent manuals yet" text="Manuals you open will appear here." href="/docs" label="Browse Manuals" />}</section>
  </main>;
}
function Loading({ text }: { text: string }) { return <p role="status" className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{text}</p>; }
function Retry({ text, onRetry }: { text: string; onRetry: () => void }) { return <div role="alert" className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">{text}<Button variant="outline" className="ml-3 min-h-10" onClick={() => void onRetry()}>Retry</Button></div>; }
function Empty({ icon, title, text, href, label }: { icon: ReactNode; title: string; text: string; href: string; label: string }) { return <div className="rounded-lg border border-dashed p-6"><div className="flex items-center gap-2 text-primary">{icon}<h3 className="font-bold text-foreground">{title}</h3></div><p className="mt-2 text-sm text-muted-foreground">{text}</p><Button asChild variant="outline" className="mt-4 min-h-11"><Link href={href}>{label}</Link></Button></div>; }
