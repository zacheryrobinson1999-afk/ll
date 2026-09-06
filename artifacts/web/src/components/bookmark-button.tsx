import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/button';

export function BookmarkButton({ documentId, sectionRef = '', pageRef = '' }: { documentId: string; sectionRef?: string; pageRef?: string }) {
  const { bookmarks, loading, busy, error, toggle, refresh } = useBookmarks();
  const saved = bookmarks.some((bookmark) => bookmark.documentId === documentId && bookmark.sectionRef === sectionRef && bookmark.pageRef === pageRef);
  return <Button type="button" variant="outline" className="min-h-11 shrink-0 gap-2" disabled={loading || busy}
    aria-pressed={saved} aria-label={error ? 'Retry bookmarks' : saved ? 'Remove bookmark' : 'Bookmark manual'}
    onClick={(event) => { event.stopPropagation(); event.preventDefault(); void (error ? refresh() : toggle(documentId, sectionRef, pageRef)); }}>
    <BookmarkIcon className={`h-4 w-4 ${saved ? 'fill-primary text-primary' : ''}`} />
    {error ? 'Retry bookmarks' : loading ? 'Loading…' : saved ? 'Bookmarked' : 'Bookmark'}
  </Button>;
}
