import ManualDetail from './manual-detail';
import { ManualShortcut } from '@/components/manual-shortcut';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useManualActivity } from '@/hooks/useManualActivity';
import { manualDetailHref, recentManuals, bookmarkedManuals } from '../../../api-server/src/lib/catalog/manualDetail';
import { useMemo, type MouseEvent } from 'react';
import { TECH_DOCS, SYSTEM_COLORS, SYSTEM_ICONS, type TechDoc } from '@/data/techDocs';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, FileText, Star, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { FLEET } from '@/data/craneFleet';
import { availableCategories, filterManuals, manufacturerGroups, modelGroups, manualModels, manualCategories } from '../../../api-server/src/lib/catalog/manualLibrary';
import { BookmarkButton } from '@/components/bookmark-button';
import { useSearch } from 'wouter';



type DocumentCardProps = {
  doc: TechDoc;
  favourite: boolean;
  onSelect: (doc: TechDoc) => void;
  onOpen: (doc: TechDoc) => void;
  onToggleFavourite: (id: string) => void;
  compact?: boolean;
};

function DocumentCard({ doc, favourite, onSelect, onOpen, onToggleFavourite, compact = true }: DocumentCardProps) {
  const toggleFavourite = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavourite(doc.id);
  };

  return (
    <Card className="group flex h-full min-w-0 cursor-pointer flex-col border-border/60 bg-card/60 transition-colors hover:border-primary/60 hover:bg-card" onClick={() => onSelect(doc)}>
      <CardHeader className={compact ? 'p-4 pb-2' : 'p-5 pb-3'}>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-1.5">
              <Badge variant="outline" style={{ borderColor: SYSTEM_COLORS[doc.system], color: SYSTEM_COLORS[doc.system] }}>
                {SYSTEM_ICONS[doc.system]} · {doc.system}
              </Badge>
              <Badge variant="secondary">{doc.documentType ?? manualCategories(doc).join(" / ")}</Badge>
            </div>
            <CardTitle className="text-base leading-snug transition-colors group-hover:text-primary sm:text-lg"><button type="button" className="text-left focus-visible:outline focus-visible:outline-primary" onClick={event => { event.stopPropagation(); onSelect(doc); }}>{doc.title}</button></CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-xs">{doc.subtitle}</CardDescription>
          </div>
          <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background/60 hover:border-primary hover:text-primary" onClick={toggleFavourite} aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'} title={favourite ? 'Remove from favourites' : 'Add to favourites'}>
            <Star className={`h-5 w-5 ${favourite ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className={`mt-auto ${compact ? 'p-4 pt-1' : 'p-5 pt-1'}`}>
        <div className="mb-3"><BookmarkButton documentId={doc.id} /></div>
        {!compact && <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{doc.summary}</p>}
        <div className="mb-4 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {manualModels(doc, FLEET).slice(0, 4).map((model) => <Badge key={model} variant="outline" className="max-w-full truncate bg-secondary/20 font-normal">{model}</Badge>)}
          {manualModels(doc, FLEET).length > 4 && <Badge variant="outline">+{manualModels(doc, FLEET).length - 4}</Badge>}
          {doc.year && <Badge variant="outline">{doc.year}</Badge>}
          {doc.pages && <Badge variant="outline">{doc.pages} pages</Badge>}
          {doc.docNumber && <Badge variant="outline">No. {doc.docNumber}</Badge>}
        </div>
        <Button className="h-11 w-full font-bold" onClick={(event) => { event.stopPropagation(); onOpen(doc); }}>
          <ExternalLink className="mr-2 h-4 w-4" /> View manual
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DocsPage() {
  const [, navigate] = useLocation();
  const query = useSearch();
  const params = new URLSearchParams(query);
  const search = params.get('q') ?? '';
  const manufacturer = params.get('manufacturer') ?? '';
  const model = params.get('model') ?? '';
  const category = params.get('type') ?? 'All';
  const favouritesOnly = params.get('favourites') === '1';
  const detailId = params.get('document');
  const { bookmarks } = useBookmarks();
  const activity = useManualActivity(detailId);
  const recents = recentManuals(TECH_DOCS, activity.events);
  const saved = bookmarkedManuals(TECH_DOCS, bookmarks);
  const { favouriteIds, toggleFavourite } = useDocumentLibrary();
  const categories = useMemo(() => availableCategories(TECH_DOCS), []);
  const update = (values: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(query);
    for (const [key, value] of Object.entries(values)) value ? next.set(key, value) : next.delete(key);
    navigate(`/docs${next.size ? `?${next}` : ''}`, { replace });
  };
  const searching = Boolean(search.trim());
  const filteredDocs = useMemo(() => filterManuals(TECH_DOCS, { query: search, category, manufacturer, model }, FLEET)
    .filter(doc => !favouritesOnly || favouriteIds.includes(doc.id)), [search, category, manufacturer, model, favouritesOnly, favouriteIds]);
  const groups = !searching && !model ? (manufacturer ? modelGroups(filteredDocs, FLEET) : manufacturerGroups(filteredDocs)) : [];
  const clearFilters = () => navigate('/docs');
  const selectDocument = (doc: TechDoc) => navigate(manualDetailHref(doc.id, { from: `/docs${query ? `?${query}` : ''}` }));
  const cardProps = (doc: TechDoc) => ({ doc, favourite: favouriteIds.includes(doc.id), onSelect: selectDocument, onOpen: selectDocument, onToggleFavourite: toggleFavourite });
  if (detailId !== null) return <ManualDetail id={detailId} query={query} />;
  return <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-5 p-4 pb-24 sm:p-6 md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div><h1 className="text-3xl font-bold tracking-tight">Manuals</h1><p className="mt-1 text-sm text-muted-foreground">{TECH_DOCS.length} documents · Browse by manufacturer and model, or search the entire library.</p></div>
      <Link href="/bookmarks" className="inline-flex min-h-11 items-center font-semibold text-primary">Your private bookmarks</Link>
    </div>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input aria-label="Search manuals" placeholder="Search manuals, models, systems, document numbers…" value={search} onChange={event => update({ q: event.target.value }, true)} className="h-12 bg-card pl-11 pr-12" />
      {search && <button type="button" aria-label="Clear search" onClick={() => update({ q: '' }, true)} className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center"><X className="h-5 w-5" /></button>}
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Document type filters">
      {categories.map(type => <Button key={type} variant={category === type ? 'default' : 'outline'} className="min-h-11" aria-pressed={category === type} onClick={() => update({ type: type === 'All' ? '' : type })}>{type}</Button>)}
      <Button variant={favouritesOnly ? 'default' : 'outline'} className="min-h-11" aria-pressed={favouritesOnly} onClick={() => update({ favourites: favouritesOnly ? '' : '1' })}><Star className="mr-2 h-4 w-4" />Favourites</Button>
    </div>
    {!searching && !manufacturer && category === 'All' && !favouritesOnly && <>
      {recents.length > 0 && <section className="space-y-3" aria-label="Recently opened"><h2 className="text-xl font-bold">Recently opened</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{recents.map(({ doc, openedAt }) => <ManualShortcut key={doc.id} doc={doc} openedAt={openedAt} />)}</div></section>}
      {saved.length > 0 && <section className="space-y-3" aria-label="Bookmarked manuals"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold">Bookmarked manuals</h2><Link href="/bookmarks" className="min-h-11 py-2 text-primary">View all bookmarks</Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.map(doc => <ManualShortcut key={doc.id} doc={doc} />)}</div></section>}
      {activity.error && <Button variant="ghost" onClick={activity.retry}>Retry recent manuals</Button>}
    </>}
    {!searching && <nav aria-label="Manual library breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      <Button variant="ghost" className="min-h-11" onClick={() => update({ manufacturer: '', model: '', document: '' })}>Manuals</Button>
      {manufacturer && <><span>/</span><Button variant="ghost" className="min-h-11" onClick={() => update({ model: '', document: '' })}>{manufacturer}</Button></>}
      {model && <><span>/</span><span aria-current="page">{model}</span></>}
    </nav>}
    <section className="space-y-4" aria-label="Manual library results">
      <h2 className="text-lg font-semibold" aria-live="polite">{searching ? `${filteredDocs.length} ${filteredDocs.length === 1 ? 'result' : 'results'} for ${search.trim()}` : `${manufacturer || 'Manufacturers / systems'}${model ? ` · ${model}` : ''} · ${filteredDocs.length} documents`}</h2>
      {!filteredDocs.length ? <div className="rounded-lg border border-dashed p-8 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p>{searching ? `No manuals found for “${search.trim()}”` : 'No manuals match these filters.'}</p><Button variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>Clear search and filters</Button></div>
        : searching || model ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredDocs.map(doc => <DocumentCard key={doc.id} {...cardProps(doc)} />)}</div>
        : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{groups.map(group => <button key={group.label} type="button" onClick={() => update(manufacturer ? { model: group.label } : { manufacturer: group.label, model: '' })} className="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-primary focus-visible:outline focus-visible:outline-primary"><span className="font-semibold">{group.label}</span><span className="shrink-0 text-sm text-muted-foreground">{group.count} {group.count === 1 ? 'manual' : 'manuals'} →</span></button>)}</div>}
    </section>
  </div>;
}
