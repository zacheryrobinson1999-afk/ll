import { useEffect, useMemo, useRef, useState } from 'react';
import { FLEET } from '@/data/craneFleet';
import { TECH_DOCS } from '@/data/techDocs';
import { listNotes } from '@/lib/notesApi';
import { mergeRankedResults, rankCranes, rankDocuments, rankNotes, searchTerms } from '@/lib/search';
import { loadCustomCranes } from '@/lib/customFleet';

export function useUnifiedSearch(query: string) {
  const latestQuery = useRef(query);
  latestQuery.current = query;
  const [noteResults, setNoteResults] = useState<ReturnType<typeof rankNotes>>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const searchable = searchTerms(query).length > 0;
  const localResults = useMemo(() => searchable ? mergeRankedResults(rankDocuments(query, TECH_DOCS), rankCranes(query, [...FLEET, ...loadCustomCranes()])) : [], [query, searchable]);

  useEffect(() => {
    if (!searchable) { setNoteResults([]); setNotesLoading(false); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setNotesLoading(true);
      void listNotes(query).then((notes) => { if (!controller.signal.aborted && latestQuery.current === query) setNoteResults(rankNotes(query, notes)); })
        .catch(() => { if (!controller.signal.aborted && latestQuery.current === query) setNoteResults([]); })
        .finally(() => { if (!controller.signal.aborted && latestQuery.current === query) setNotesLoading(false); });
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [query, searchable]);

  return { results: useMemo(() => mergeRankedResults(localResults, noteResults), [localResults, noteResults]), notesLoading };
}
