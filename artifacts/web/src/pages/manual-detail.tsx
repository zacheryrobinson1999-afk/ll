import { Link, useLocation } from 'wouter';
import { useMemo, useState } from 'react';
import { TECH_DOCS, docUrl } from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import { BookmarkButton } from '@/components/bookmark-button';
import { ManualShortcut } from '@/components/manual-shortcut';
import { Button } from '@/components/ui/button';
import { resolveManual, manualMetadata, relatedManuals, bookmarksInManual, manualDetailHref, manualNoteHref, manualReturnPath, sectionPdfPage, verifiedPdfPage } from '../../../api-server/src/lib/catalog/manualDetail';

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
  const page = verifiedPdfPage(doc, rawPage);
  const related = relatedManuals(doc, TECH_DOCS);
  const saved = bookmarksInManual(bookmarks, doc.id);
  const fleet = FLEET.filter(crane => doc.appliesTo.includes(crane.id));
  const here = manualDetailHref(doc.id, { from });
  const [sectionQuery, setSectionQuery] = useState('');
  const visibleSections = useMemo(() => doc.sections.filter(item => `${item.ref} ${item.title} ${item.summary}`.toLocaleLowerCase().includes(sectionQuery.trim().toLocaleLowerCase())), [doc.sections, sectionQuery]);
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
    {doc.sections.length > 0 && <section aria-labelledby="manual-sections-heading" className="space-y-3"><div><h2 id="manual-sections-heading" className="text-xl font-bold">Jump to section</h2><p className="text-sm text-muted-foreground">Search this manual’s indexed sections. Page numbers are physical PDF pages, not printed section labels.</p></div><input aria-label="Filter sections" value={sectionQuery} onChange={event => setSectionQuery(event.target.value)} placeholder="Filter section titles or descriptions…" className="h-11 w-full rounded-md border border-border bg-card px-3 text-sm" />{visibleSections.length ? visibleSections.map((item, index) => { const target = sectionPdfPage(doc, item); const savedSection = saved.find(bookmark => bookmark.sectionRef === item.ref); return <article key={`${item.ref}-${index}`} className="rounded-lg border border-border bg-card p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-xs text-muted-foreground">Reference: {item.ref}</p></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${target ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{target ? `PDF page ${target}` : 'Page not indexed'}</span></div><p className="py-3 text-sm leading-relaxed text-muted-foreground">{item.summary}</p><div className="flex flex-wrap gap-3"><BookmarkButton documentId={doc.id} sectionRef={item.ref} pageRef={target} />{target ? <Button asChild variant="outline" className="min-h-11"><a href={`${docUrl(doc)}#page=${target}`} target="_blank" rel="noreferrer" onClick={() => recordViewed(doc.id)}>Open PDF at page {target}</a></Button> : <Button variant="outline" className="min-h-11" onClick={open}>Open full manual</Button>}<Button asChild variant="ghost" className="min-h-11"><Link href={manualNoteHref(doc.id, item.ref, target)}>Add section note</Link></Button></div>{savedSection && <p className="mt-2 text-xs text-muted-foreground">Saved reference: {savedSection.pageRef ? `PDF page ${verifiedPdfPage(doc, savedSection.pageRef) || 'not indexed'}` : 'section bookmark without a verified page'}</p>}</article>; }) : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No indexed sections match this filter. Use Open PDF to search the full manual.</p>}</section>}
    <section className="space-y-3"><h2 className="text-xl font-bold">Related manuals</h2>{related.length ? <div className="grid gap-3 sm:grid-cols-2">{related.map(item => <ManualShortcut key={item.id} doc={item} from={here} />)}</div> : <p className="text-sm text-muted-foreground">No other manuals with an explicit matching model or fleet association.</p>}</section>
  </div>;
}
