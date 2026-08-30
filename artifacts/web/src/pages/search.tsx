import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { SearchResultRow } from '@/components/unified-search';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';
import type { SearchResultType } from '@/lib/search';

type Filter = 'all' | SearchResultType;

export default function SearchPage() {
  const [location, navigate] = useLocation();
  const query = new URLSearchParams(location.split('?')[1] ?? '').get('q') ?? '';
  const [draft, setDraft] = useState(query);
  const [filter, setFilter] = useState<Filter>('all');
  const { results, notesLoading } = useUnifiedSearch(query);
  const visible = useMemo(() => filter === 'all' ? results : results.filter((result) => result.type === filter), [filter, results]);
  const counts = { all: results.length, manual: results.filter((item) => item.type === 'manual').length, crane: results.filter((item) => item.type === 'crane').length, note: results.filter((item) => item.type === 'note').length };
  useEffect(() => setDraft(query), [query]);
  const submit = () => navigate(`/search?q=${encodeURIComponent(draft.trim())}`);
  return <div className="mx-auto min-h-full max-w-5xl space-y-5 p-4 pb-28 sm:p-6 md:p-8 lg:pb-8">
    <div><h1 className="text-3xl font-bold tracking-tight">Technical Search</h1><p className="mt-1 text-sm text-muted-foreground">Ranked results across manuals, fleet records and your private notes.</p></div>
    <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex gap-2"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" /><Input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-12 pl-10 text-base" autoFocus aria-label="Search query" /></div><button className="h-12 rounded-md bg-primary px-5 font-bold text-primary-foreground">Search</button></form>
    <div className="flex gap-2 overflow-x-auto pb-1">{(['all', 'manual', 'crane', 'note'] as Filter[]).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-11 shrink-0 rounded-md border px-4 text-sm font-bold capitalize ${filter === item ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground'}`}>{item === 'note' ? 'Notes' : item === 'crane' ? 'Cranes' : item === 'manual' ? 'Manuals' : 'All'} ({counts[item]})</button>)}</div>
    {query ? visible.length ? <div className="space-y-2 rounded-md border border-border bg-card p-2">{visible.map((result) => <SearchResultRow key={`${result.type}-${result.id}`} result={result} />)}</div> : <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">{notesLoading ? 'Searching your workshop notes…' : 'No matching results.'}</div> : <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">Enter a crane model, system, reference or fault description.</div>}
  </div>;
}
