import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { workflowRequest, type Bookmark } from '@/lib/workflowApi';

function useBookmarkState() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setBookmarks((await workflowRequest<{ bookmarks: Bookmark[] }>('/bookmarks')).bookmarks); setError(''); }
    catch (error) { setError((error as Error).message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const toggle = async (documentId: string, sectionRef = '', pageRef = '') => {
    if (lock.current || loading || error) return;
    lock.current = true; setBusy(true);
    const existing = bookmarks.find((bookmark) => bookmark.documentId === documentId && bookmark.sectionRef === sectionRef && bookmark.pageRef === pageRef);
    try {
      if (existing) {
        await workflowRequest(`/bookmarks/${existing.id}`, 'DELETE');
        setBookmarks((rows) => rows.filter((row) => row.id !== existing.id));
      } else {
        const result = await workflowRequest<{ bookmark: Bookmark }>('/bookmarks', 'POST', { documentId, sectionRef, pageRef });
        setBookmarks((rows) => [result.bookmark, ...rows.filter((row) => row.id !== result.bookmark.id)]);
      }
      setError('');
    } catch (error) { setError((error as Error).message); }
    finally { lock.current = false; setBusy(false); }
  };
  return { bookmarks, loading, error, busy, toggle, refresh };
}
const Context = createContext<ReturnType<typeof useBookmarkState> | null>(null);
export function BookmarksProvider({ children }: { children: ReactNode }) {
  return <Context.Provider value={useBookmarkState()}>{children}</Context.Provider>;
}
export function useBookmarks() {
  const value = useContext(Context);
  if (!value) throw new Error('BookmarksProvider required');
  return value;
}
