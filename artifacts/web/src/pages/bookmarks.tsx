import { Link } from 'wouter';
import { TECH_DOCS, docUrl } from '@/data/techDocs';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkButton } from '@/components/bookmark-button';
import { Button } from '@/components/ui/button';

export default function BookmarksPage() {
  const { bookmarks, loading, error, refresh } = useBookmarks();
  return <main className="mx-auto max-w-4xl space-y-5 p-4 pb-28 sm:p-6">
    <h1 className="text-3xl font-bold">Your bookmarks</h1>
    <p className="text-sm text-muted-foreground">Private manual references saved to your technician account.</p>
    <Link href="/docs" className="inline-flex min-h-11 items-center text-primary">Browse manuals</Link>
    {loading && <p role="status">Loading bookmarks…</p>}
    {error && <div role="alert">{error}<Button onClick={() => void refresh()}>Retry</Button></div>}
    {!loading && !error && !bookmarks.length && <p>No bookmarks yet. Bookmark a manual in the library or search results.</p>}
    <div className="space-y-3">{bookmarks.map((bookmark) => {
      const doc = TECH_DOCS.find((item) => item.id === bookmark.documentId);
      return <article key={bookmark.id} className="space-y-3 rounded-lg border border-border bg-card p-4">
        <h2 className="font-semibold">{doc?.title ?? 'Manual no longer in catalogue'}</h2>
        <p className="text-sm text-muted-foreground">{doc?.system}{bookmark.sectionRef && ` · Section ${bookmark.sectionRef}`}{bookmark.pageRef && ` · Page ${bookmark.pageRef}`}</p>
        <div className="flex flex-wrap gap-2">{doc && <Button asChild><a href={`${docUrl(doc)}${bookmark.pageRef ? `#page=${bookmark.pageRef}` : ''}`} target="_blank" rel="noopener noreferrer">Open manual</a></Button>}
          <BookmarkButton documentId={bookmark.documentId} sectionRef={bookmark.sectionRef} pageRef={bookmark.pageRef} />
        </div>
      </article>;
    })}</div>
  </main>;
}
