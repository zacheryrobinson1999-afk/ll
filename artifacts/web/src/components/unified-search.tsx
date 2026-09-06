import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { ArrowRight, FileText, Search, StickyNote, Truck, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import type { SearchResultType, UnifiedSearchResult } from '@/lib/search';
import { BookmarkButton } from '@/components/bookmark-button';

const RECENT_KEY = 'cranehub-search-v2-recent';
type SafeRecent = Pick<UnifiedSearchResult, 'type' | 'id' | 'title' | 'subtitle' | 'href'>;

export function saveSearchRecent(result: UnifiedSearchResult) {
  try {
    const current = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as SafeRecent[];
    const safe: SafeRecent = { type: result.type, id: result.id, title: result.title, subtitle: result.subtitle, href: result.href };
    localStorage.setItem(RECENT_KEY, JSON.stringify([safe, ...current.filter((item) => item.type !== safe.type || item.id !== safe.id)].slice(0, 6)));
  } catch { /* Search works without local storage. */ }
}

export function readSearchRecents(): SafeRecent[] {
  try { const value = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as unknown; return Array.isArray(value) ? value.slice(0, 6) as SafeRecent[] : []; }
  catch { return []; }
}

export function ResultIcon({ type }: { type: SearchResultType }) {
  return type === 'crane' ? <Truck className="h-5 w-5" /> : type === 'note' ? <StickyNote className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
}

export function SearchResultRow({ result, active = false, onOpen }: { result: UnifiedSearchResult | SafeRecent; active?: boolean; onOpen?: () => void }) {
  return <div className="min-w-0"><Link href={result.href} onClick={() => { if ('score' in result) saveSearchRecent(result); onOpen?.(); }} className={`flex min-h-16 items-center gap-3 rounded-md p-3 ${active ? 'bg-secondary ring-1 ring-primary/50' : 'hover:bg-secondary'}`}>
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><ResultIcon type={result.type} /></div>
    <div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-2"><span className="min-w-0 flex-1 truncate font-semibold">{result.title}</span><span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary">{result.type}</span></div><div className="truncate text-sm text-muted-foreground">{result.subtitle}</div>{'detail' in result && result.detail && <div className="mt-0.5 line-clamp-1 break-words text-xs text-muted-foreground">{result.detail}</div>}</div>
    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
  </Link>{result.type === 'manual' && <div className="px-3 pb-3"><BookmarkButton documentId={result.id} /></div>}</div>;
}

export function UnifiedSearchBox({ initialQuery = '', autoFocus = false }: { initialQuery?: string; autoFocus?: boolean }) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const { results, notesLoading } = useUnifiedSearch(query);
  const shown = useMemo(() => results.slice(0, 10), [results]);
  useEffect(() => setHighlighted(0), [query]);

  const viewAll = () => { if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`); setOpen(false); };
  const keyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setHighlighted((value) => Math.min(value + 1, Math.max(shown.length - 1, 0))); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setHighlighted((value) => Math.max(value - 1, 0)); }
    else if (event.key === 'Escape') { setOpen(false); }
    else if (event.key === 'Enter') { event.preventDefault(); const selected = shown[highlighted]; if (open && selected) { saveSearchRecent(selected); navigate(selected.href); } else viewAll(); setOpen(false); }
  };

  return <div className="relative">
    <div className="flex min-h-[62px] items-center gap-2 rounded-md border border-border bg-card p-2 shadow-xl focus-within:border-primary/60"><Search className="ml-2 h-6 w-6 shrink-0 text-muted-foreground" /><input autoFocus={autoFocus} id="search" value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={keyDown} placeholder="Search manuals, cranes and workshop notes…" className="min-w-0 flex-1 bg-transparent px-1 text-base outline-none placeholder:text-muted-foreground" aria-label="Unified technical search" aria-expanded={open && Boolean(query)} aria-controls="unified-search-results" />
      {query && <button type="button" onClick={() => setQuery('')} className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary" aria-label="Clear search"><X className="h-5 w-5" /></button>}
      <button type="button" onClick={viewAll} className="hidden h-11 rounded-md bg-primary px-5 text-sm font-bold uppercase tracking-wider text-primary-foreground sm:block">Search</button>
    </div>
    {open && query.trim() && <div id="unified-search-results" className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-md border border-border bg-card shadow-2xl">
      {shown.length ? <><div className="max-h-[62vh] overflow-y-auto p-2">{shown.map((result, index) => <SearchResultRow key={`${result.type}-${result.id}`} result={result} active={index === highlighted} onOpen={() => setOpen(false)} />)}</div><button type="button" onClick={viewAll} className="flex min-h-12 w-full items-center justify-center border-t border-border px-4 text-sm font-bold text-primary hover:bg-secondary">View all {results.length} results<ArrowRight className="ml-2 h-4 w-4" /></button></> : <div className="p-6 text-center"><Search className="mx-auto mb-2 h-7 w-7 text-muted-foreground" /><p className="font-medium">{notesLoading ? 'Searching workshop notes…' : 'No results found'}</p><p className="mt-1 text-sm text-muted-foreground">Try a model, system, component, document number or note tag.</p></div>}
    </div>}
  </div>;
}
