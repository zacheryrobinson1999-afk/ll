import { Link, useLocation } from 'wouter';
import { TECH_DOCS, docUrl } from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import { BookmarkButton } from '@/components/bookmark-button';
import { ManualShortcut } from '@/components/manual-shortcut';
import { Button } from '@/components/ui/button';
import { resolveManual, manualMetadata, relatedManuals, bookmarksInManual, manualDetailHref, manualNoteHref, manualReturnPath } from '../../../api-server/src/lib/catalog/manualDetail';

export default function ManualDetail({ id, query }: { id: string; query: string }) {
  const [, navigate] = useLocation();
  const { bookmarks, loading, error, refresh } = useBookmarks();
  const { recordViewed } = useDocumentLibrary();
  const doc = resolveManual(TECH_DOCS, id);
  const params = new URLSearchParams(query);
  const from = manualReturnPath(params.get('from'));
  if (!doc) return <div className="mx-auto max-w-4xl space-y-4 p-6"><h1 className="text-3xl font-bold">Manual not found</h1><p>This manual is not in the current catalogue.</p><Button asChild><Link href="/docs">Browse manuals</Link></Button></div>;
  const meta = manualMetadata(doc, FLEET);
  const section = doc.sections.some(item => item.ref === params.get('section')) ? params.get('section')! : '';
  const rawPage = params.get('page') ?? '';
  const page = /^\d+$/.test(rawPage) && Number(rawPage) > 0 && (!doc.pages || Number(rawPage) <= doc.pages) ? rawPage : '';
  const related = relatedManuals(doc, TECH_DOCS);
  const saved = bookmarksInManual(bookmarks, doc.id);
  const fleet = FLEET.filter(crane => doc.appliesTo.includes(crane.id));
  const here = manualDetailHref(doc.id, { from });
  const open = () => { recordViewed(doc.id); window.open(`${docUrl(doc)}${page ? `#page=${page}` : ''}`, '_blank', 'noopener,noreferrer'); };
  const originLabel = from.startsWith('/search') ? 'Search' : from.startsWith('/fleet') ? 'Fleet' : from.startsWith('/bookmarks') ? 'Bookmarks' : from.startsWith('/maintenance') ? 'Maintenance' : 'Manuals';
  return <div className="mx-auto max-w-5xl space-y-6 p-4 pb-28 sm:p-6 md:p-8">
    <nav aria-label="Manual breadcrumb" className="flex flex-wrap items-center gap-2 text-sm"><Button variant="outline" className="min-h-11" onClick={() => navigate(from)}>Back to {originLabel}</Button><Link href="/docs" className="p-2 text-primary">Manuals</Link><span>/</span><Link className="p-2 text-primary" href={`/docs?manufacturer=${encodeURIComponent(meta.manufacturer)}`}>{meta.manufacturer}</Link><span>/</span><span>Manual detail</span></nav>
    <header className="space-y-3"><p className="text-sm font-semibold text-primary">{meta.manufacturer} · {meta.type}</p><h1 className="break-words text-2xl font-bold leading-tight sm:text-3xl">{doc.title}</h1><p className="text-sm text-muted-foreground">{doc.subtitle}</p></header>
    <div className="flex flex-wrap gap-3"><Button className="min-h-12" onClick={open}>Open PDF{page ? ` · page ${page}` : ''}</Button><BookmarkButton documentId={doc.id} /><Button asChild variant="outline" className="min-h-12"><Link href={manualNoteHref(doc.id, section, page)}>Add workshop note</Link></Button></div>
    {(section || page) && <p className="rounded-lg border p-3 text-sm">Selected reference: {[section && `Section ${section}`, page && `Page ${page}`].filter(Boolean).join(' · ')}</p>}
    <section aria-label="Manual metadata" className="rounded-xl border border-border bg-card p-5"><dl className="grid gap-5 sm:grid-cols-2">
      <div><dt className="text-xs text-muted-foreground">System</dt><dd>{doc.system}</dd></div>
      <div><dt className="text-xs text-muted-foreground">Models / applicability</dt><dd>{meta.models.join(' · ') || 'No specific crane model assigned'}</dd></div>
      {meta.code && <div><dt className="text-xs text-muted-foreground">Document / book code</dt><dd className="break-words">{meta.code}</dd></div>}
      {doc.year && <div><dt className="text-xs text-muted-foreground">Publication year</dt><dd>{doc.year}</dd></div>}
      {doc.pages && <div><dt className="text-xs text-muted-foreground">Pages</dt><dd>{doc.pages}</dd></div>}
      {doc.sourceSystem && <div><dt className="text-xs text-muted-foreground">Source system</dt><dd>{doc.sourceSystem}</dd></div>}
      {doc.revision && <div><dt className="text-xs text-muted-foreground">Revision</dt><dd>{doc.revision}</dd></div>}
    </dl></section>
    <section className="space-y-3"><h2 className="text-xl font-bold">About this manual</h2><p className="leading-relaxed text-muted-foreground">{doc.summary}</p>{fleet.length > 0 && <div className="flex flex-wrap gap-2">{fleet.map(crane => <Link key={crane.id} href={`/fleet?crane=${encodeURIComponent(crane.id)}`} className="rounded-md border px-3 py-3 text-sm text-primary">Fleet: {crane.model}</Link>)}</div>}</section>
    <section className="space-y-3"><h2 className="text-xl font-bold">Bookmarks in this manual</h2>{loading ? <p>Loading bookmarks…</p> : error ? <Button onClick={() => void refresh()}>Retry bookmarks</Button> : saved.length ? saved.map(bookmark => <div key={bookmark.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"><Link className="min-h-11 py-2 text-primary" href={manualDetailHref(doc.id, { from, section: bookmark.sectionRef, page: bookmark.pageRef })}>{[bookmark.sectionRef && `Section ${bookmark.sectionRef}`, bookmark.pageRef && `Page ${bookmark.pageRef}`].filter(Boolean).join(' · ')}</Link><BookmarkButton documentId={doc.id} sectionRef={bookmark.sectionRef} pageRef={bookmark.pageRef} /></div>) : <p className="text-sm text-muted-foreground">No section or page bookmarks saved for this manual.</p>}</section>
    {doc.sections.length > 0 && <section className="space-y-3"><h2 className="text-xl font-bold">Manual sections</h2>{doc.sections.map((item, index) => <details key={`${item.ref}-${index}`} open={section === item.ref || undefined} className="rounded-lg border p-4"><summary className="min-h-11 cursor-pointer font-semibold">{item.ref} · {item.title}</summary><p className="py-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p><div className="flex flex-wrap gap-3"><BookmarkButton documentId={doc.id} sectionRef={item.ref} /><Button asChild variant="outline" className="min-h-11"><Link href={manualNoteHref(doc.id, item.ref)}>Add section note</Link></Button></div></details>)}</section>}
    <section className="space-y-3"><h2 className="text-xl font-bold">Related manuals</h2>{related.length ? <div className="grid gap-3 sm:grid-cols-2">{related.map(item => <ManualShortcut key={item.id} doc={item} from={here} />)}</div> : <p className="text-sm text-muted-foreground">No other manuals with an explicit matching model or fleet association.</p>}</section>
  </div>;
}
