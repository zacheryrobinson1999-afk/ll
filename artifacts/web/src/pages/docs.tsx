import ManualDetail from './manual-detail';
import { ManualShortcut } from '@/components/manual-shortcut';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useManualActivity } from '@/hooks/useManualActivity';
import { manualDetailHref, recentManuals, bookmarkedManuals } from '../../../api-server/src/lib/catalog/manualDetail';
import { useMemo, type MouseEvent } from 'react';
import { TECH_DOCS, SYSTEM_COLORS, SYSTEM_ICONS, type TechDoc } from '@/data/techDocs';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, BookOpen, ChevronRight, Clock3, ExternalLink, FileText, Filter, Layers3, Search, Star, Truck, Wrench, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { FLEET } from '@/data/craneFleet';
import { availableCategories, filterManuals, manufacturerGroups, subsystemGroups, groupExamples, groupDescription, modelGroups, manualModels, manualCategories, manualSubsystem } from '../../../api-server/src/lib/catalog/manualLibrary';
import { useSearch } from 'wouter';

type DocumentCardProps = {
  doc: TechDoc;
  favourite: boolean;
  onSelect: (doc: TechDoc) => void;
  onOpen: (doc: TechDoc) => void;
  onToggleFavourite: (id: string) => void;
};

const AUXILIARY_SHORTCUTS = [
  { label: 'Engine', value: 'Engine', hint: 'Diesel engines and service' },
  { label: 'Driveline', value: 'Drivetrain', hint: 'Transfer cases and driveshafts' },
  { label: 'Transmission', value: 'Transmission', hint: 'Gearboxes and automated manuals' },
  { label: 'Hydraulics', value: 'Hydraulics', hint: 'Pumps and hydraulic systems' },
  { label: 'Electrical', value: 'Electrical', hint: 'Wiring and circuits' },
  { label: 'Brakes & air', value: 'Brakes & Pneumatics', hint: 'ABS and pneumatic systems' },
  { label: 'Crane controls', value: 'Crane controls', hint: 'LICCON, LMI, ECOS and CCS' },
] as const;

function displaySubsystemName(value: string): string {
  return value === 'Drivetrain' ? 'Driveline' : value;
}

function DocumentCard({ doc, favourite, onSelect, onOpen, onToggleFavourite }: DocumentCardProps) {
  const toggleFavourite = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleFavourite(doc.id);
  };
  const models = manualModels(doc, FLEET);
  const type = doc.documentType ?? manualCategories(doc).join(' / ');
  const subsystem = manualSubsystem(doc);

  return (
    <article
      className="group flex min-w-0 flex-col rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm transition-colors hover:border-primary/60 sm:p-5"
      onClick={() => onSelect(doc)}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.12em]">
            <span style={{ color: SYSTEM_COLORS[doc.system] }}>{SYSTEM_ICONS[doc.system]} · {subsystem ?? doc.system}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{type}</span>
          </div>
          <h3 className="mt-2 text-base font-bold leading-snug text-foreground sm:text-lg">
            <button type="button" className="text-left focus-visible:outline focus-visible:outline-primary" onClick={(event) => { event.stopPropagation(); onSelect(doc); }}>
              {doc.title}
            </button>
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{doc.subtitle}</p>
        </div>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground hover:border-primary hover:text-primary"
          onClick={toggleFavourite}
          aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
          title={favourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          <Star className={favourite ? 'h-5 w-5 fill-primary text-primary' : 'h-5 w-5'} />
        </button>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-foreground/75">{doc.summary}</p>

      <div className="mt-4 flex min-h-7 flex-wrap items-center gap-1.5">
        {models.slice(0, 2).map((model) => <Badge key={model} variant="outline" className="max-w-full truncate bg-secondary/20 text-xs font-normal">{model}</Badge>)}
        {models.length > 2 && <Badge variant="outline" className="text-xs">+{models.length - 2}</Badge>}
        {doc.pages && <span className="ml-auto text-xs text-muted-foreground">{doc.pages.toLocaleString()} pages</span>}
      </div>

      <div className="mt-5">
        <Button className="min-h-11 w-full font-bold" onClick={(event) => { event.stopPropagation(); onOpen(doc); }}>
          <ExternalLink className="h-4 w-4" /> Open manual
        </Button>
      </div>
    </article>
  );
}

function BrowseCard({ label, count, description, examples, icon, onClick }: { label: string; count: number; description: string; examples: string[]; icon: 'machine' | 'system' | 'model'; onClick: () => void }) {
  const Icon = icon === 'machine' ? Truck : icon === 'system' ? Wrench : Layers3;
  return (
    <button type="button" onClick={onClick} className="group flex min-h-32 flex-col items-start rounded-2xl border border-border/80 bg-card p-4 text-left shadow-sm transition-colors hover:border-primary hover:bg-card/90 focus-visible:outline focus-visible:outline-primary sm:p-5">
      <div className="flex w-full items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <span className="mt-4 text-lg font-bold">{label}</span>
      <span className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">{count} {count === 1 ? 'manual' : 'manuals'}</span>
      <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{description}</span>
      {examples.length > 0 && <span className="mt-3 line-clamp-1 text-xs text-muted-foreground">Examples: {examples.join(' · ')}</span>}
    </button>
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
  const system = params.get('system') ?? '';
  const subsystem = params.get('subsystem') ?? '';
  const documentType = params.get('documentType') ?? '';
  const favouritesOnly = params.get('favourites') === '1';
  const detailId = params.get('document');
  const { bookmarks } = useBookmarks();
  const activity = useManualActivity(detailId);
  const recents = recentManuals(TECH_DOCS, activity.events);
  const saved = bookmarkedManuals(TECH_DOCS, bookmarks);
  const { favouriteIds, toggleFavourite } = useDocumentLibrary();
  const categories = useMemo(() => availableCategories(TECH_DOCS), []);
  const subsystemCounts = useMemo(() => new Map(subsystemGroups(TECH_DOCS).map(group => [group.label, group.count] as const)), []);

  const update = (values: Record<string, string>, replace = false) => {
    const next = new URLSearchParams(query);
    for (const [key, value] of Object.entries(values)) value ? next.set(key, value) : next.delete(key);
    navigate('/docs' + (next.size ? '?' + next.toString() : ''), { replace });
  };

  const searching = Boolean(search.trim());
  const filteredDocs = useMemo(
    () => filterManuals(TECH_DOCS, { query: search, category, manufacturer, model, system: system === 'browse' || subsystem ? '' : system, documentType }, FLEET)
      .filter(doc => !subsystem || (manualSubsystem(doc) ?? 'Crane documents') === subsystem)
      .filter(doc => !favouritesOnly || favouriteIds.includes(doc.id)),
    [search, category, manufacturer, model, system, subsystem, documentType, favouritesOnly, favouriteIds],
  );

  const browsingSystems = system === 'browse';
  const groups = browsingSystems
    ? subsystemGroups(filteredDocs)
    : manufacturer
      ? modelGroups(filteredDocs, FLEET)
      : manufacturerGroups(filteredDocs);
  const rootView = !searching && !manufacturer && !model && !system && !subsystem && category === 'All' && !favouritesOnly;
  const showBrowseCards = !searching && !model && !favouritesOnly && !subsystem && (browsingSystems || !system);
  const activeFilterCount = [category !== 'All', manufacturer, model, system && !browsingSystems, subsystem, favouritesOnly].filter(Boolean).length;
  const clearFilters = () => navigate('/docs');
  const selectDocument = (doc: TechDoc) => navigate(manualDetailHref(doc.id, { from: '/docs' + (query ? '?' + query : '') }));
  const cardProps = (doc: TechDoc) => ({ doc, favourite: favouriteIds.includes(doc.id), onSelect: selectDocument, onOpen: selectDocument, onToggleFavourite: toggleFavourite });

  const stageTitle = searching
    ? 'Search results'
    : model
      ? 'Manuals for ' + model
      : manufacturer
        ? 'Choose a model in ' + manufacturer
        : subsystem
          ? 'Browse ' + displaySubsystemName(subsystem) + ' documents'
          : browsingSystems
            ? 'Browse auxiliary documents'
            : system
              ? 'Browse ' + system + ' manuals'
              : 'Choose a crane manufacturer';
  const stageDescription = searching
    ? 'Search matches titles, models, systems, document numbers, descriptions, and indexed sections.'
    : model
      ? 'Open the manual you need, or go back to the model list.'
      : manufacturer
        ? 'Pick a model to narrow the list before opening a manual.'
        : subsystem
          ? 'Auxiliary references grouped for this work area, separate from crane manufacturer headings.'
          : browsingSystems
            ? 'Choose a work area such as engine, driveline, transmission, hydraulics, controls, electrical, or brakes.'
            : system
              ? 'Manuals tagged to this technical system.'
              : 'Start with the crane brand, or open Auxiliary documents for engine, driveline, and system references.';

  const groupDescriptionFor = (group: { label: string; count: number }) => {
    if (!manufacturer) return groupDescription(filteredDocs, group.label, browsingSystems ? 'subsystem' : 'manufacturer', FLEET);
    const groupDocs = filteredDocs.filter(doc => {
      const models = manualModels(doc, FLEET);
      const fallback = manualCategories(doc).includes('Engine') ? 'Engine documents' : 'General / system documents';
      return models.length ? models.includes(group.label) : fallback === group.label;
    });
    const categoriesForGroup = [...new Set(groupDocs.flatMap(manualCategories))].filter(item => item !== 'All').slice(0, 3);
    return groupDocs.length + ' manuals in this group' + (categoriesForGroup.length ? ', covering ' + categoriesForGroup.join(', ').toLowerCase() : '') + '.';
  };
  const groupExamplesFor = (group: { label: string; count: number }) => manufacturer
    ? filteredDocs.filter(doc => {
      const models = manualModels(doc, FLEET);
      const fallback = manualCategories(doc).includes('Engine') ? 'Engine documents' : 'General / system documents';
      return models.length ? models.includes(group.label) : fallback === group.label;
    }).slice(0, 3).map(doc => doc.title)
    : groupExamples(filteredDocs, group.label, browsingSystems ? 'subsystem' : 'manufacturer').slice(0, 3);

  if (detailId !== null) return <ManualDetail id={detailId} query={query} />;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-5 p-4 pb-28 sm:gap-6 sm:p-6 md:p-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-md sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Field library</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Find the right manual fast.</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">Search by crane, system, document number, or the job in front of you.</p>
            </div>
            <Link href="/bookmarks" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 text-sm font-bold text-primary hover:border-primary">
              <Star className="h-4 w-4" /> Saved manuals <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Search manuals" placeholder="Try “LTM 1120”, “hydraulic”, or “error code”" value={search} onChange={event => update({ q: event.target.value }, true)} className="h-14 rounded-xl border-border bg-background pl-12 pr-12 text-base shadow-sm" />
            {search && <button type="button" aria-label="Clear search" onClick={() => update({ q: '' }, true)} className="absolute right-1 top-1 flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-primary" /> {TECH_DOCS.length} manuals</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-primary" /> Recently opened stays here</span>
          </div>
        </div>
      </section>

      <div className="sticky top-[72px] z-30 -mx-4 border-y border-border/80 bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:p-3">
        <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Type</span>
          {categories.map(type => <Button key={type} variant={category === type ? 'default' : 'outline'} className="min-h-10 shrink-0 rounded-full px-4" aria-pressed={category === type} onClick={() => update({ type: type === 'All' ? '' : type })}>{type === 'All' ? 'All' : type}</Button>)}
          <Button variant={favouritesOnly ? 'default' : 'outline'} className="min-h-10 shrink-0 rounded-full px-4" aria-pressed={favouritesOnly} onClick={() => update({ favourites: favouritesOnly ? '' : '1' })}><Star className="h-4 w-4" />Saved</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Browse</span>
          <Button variant={!browsingSystems ? 'secondary' : 'outline'} className="min-h-10" onClick={() => update({ system: '', subsystem: '', manufacturer: '', model: '' })}><Truck className="h-4 w-4" /> By machine</Button>
          <Button variant={browsingSystems ? 'secondary' : 'outline'} className="min-h-10" onClick={() => update({ system: 'browse', subsystem: '', manufacturer: '', model: '' })}><Wrench className="h-4 w-4" /> Auxiliary / job</Button>
          {activeFilterCount > 0 && <Button variant="ghost" className="ml-auto min-h-10 text-muted-foreground" onClick={clearFilters}><Filter className="h-4 w-4" /> Clear ({activeFilterCount})</Button>}
        </div>
      </div>

      {rootView && (
        <>
          <section aria-label="Quick start" className="grid gap-3 sm:grid-cols-3">
            <button type="button" onClick={() => update({ system: '', manufacturer: '', model: '' })} className="flex min-h-24 items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-left hover:border-primary">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Truck className="h-5 w-5" /></span>
              <span><span className="block text-sm font-bold">Find by machine</span><span className="mt-1 block text-xs text-muted-foreground">Brand → model → manual</span></span>
            </button>
            <button type="button" onClick={() => update({ system: 'browse', manufacturer: '', model: '' })} className="flex min-h-24 items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left hover:border-primary">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Wrench className="h-5 w-5" /></span>
              <span><span className="block text-sm font-bold">Auxiliary documents</span><span className="mt-1 block text-xs text-muted-foreground">Engine, driveline, transmission, controls…</span></span>
            </button>
            <Link href="/bookmarks" className="flex min-h-24 items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Star className="h-5 w-5" /></span>
              <span><span className="block text-sm font-bold">Open saved manuals</span><span className="mt-1 block text-xs text-muted-foreground">Your bookmarks and favourites</span></span>
            </Link>
          </section>

          <section aria-label="Auxiliary documents" className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Auxiliary documents</p>
                <h2 className="mt-1 text-xl font-bold">Engine, driveline & system references</h2>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">These manuals are separated from crane-maker headings, so component references are easier to find.</p>
              </div>
              <Button variant="outline" className="min-h-10" onClick={() => update({ system: 'browse', subsystem: '', manufacturer: '', model: '' })}>View all auxiliary</Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {AUXILIARY_SHORTCUTS.filter(item => subsystemCounts.has(item.value)).map(item => {
                const count = subsystemCounts.get(item.value) ?? 0;
                return <button key={item.value} type="button" onClick={() => update({ system: 'browse', subsystem: item.value, manufacturer: '', model: '' })} className="min-h-24 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:border-primary focus-visible:outline focus-visible:outline-primary">
                  <span className="block text-sm font-bold">{item.label}</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.1em] text-primary">{count} {count === 1 ? 'manual' : 'manuals'}</span>
                  <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{item.hint}</span>
                </button>;
              })}
            </div>
          </section>

          {recents.length > 0 && <section className="space-y-3" aria-label="Recently opened"><div className="flex items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pick up where you left off</p><h2 className="mt-1 text-xl font-bold">Recently opened</h2></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{recents.slice(0, 3).map(({ doc, openedAt }) => <ManualShortcut key={doc.id} doc={doc} openedAt={openedAt} />)}</div></section>}

          {saved.length > 0 && <section className="space-y-3" aria-label="Bookmarked manuals"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Your references</p><h2 className="mt-1 text-xl font-bold">Bookmarked manuals</h2></div><Link href="/bookmarks" className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-primary">View all <ArrowRight className="h-4 w-4" /></Link></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{saved.slice(0, 3).map(doc => <ManualShortcut key={doc.id} doc={doc} />)}</div></section>}
          {activity.error && <Button variant="ghost" onClick={activity.retry}>Retry recently opened</Button>}
        </>
      )}

      {!searching && (manufacturer || model || system || subsystem) && (
        <nav aria-label="Manual library breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
          <Button variant="ghost" className="min-h-10 px-2" onClick={clearFilters}>Manuals</Button>
          {(system || subsystem) && <><ChevronRight className="h-4 w-4 text-muted-foreground" /><Button variant="ghost" className="min-h-10 px-2" onClick={() => update({ system: 'browse', subsystem: '', manufacturer: '', model: '' })}>{subsystem ? displaySubsystemName(subsystem) : (system === 'browse' ? 'Auxiliary / job' : system)}</Button></>}
          {manufacturer && <><ChevronRight className="h-4 w-4 text-muted-foreground" /><Button variant="ghost" className="min-h-10 px-2" onClick={() => update({ model: '', document: '' })}>{manufacturer}</Button></>}
          {model && <><ChevronRight className="h-4 w-4 text-muted-foreground" /><span aria-current="page" className="font-semibold">{model}</span></>}
        </nav>
      )}

      <section aria-label="Manual library results" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="border-l-4 border-primary pl-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{searching ? 'Search' : 'Manual library'}</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground" aria-live="polite">{stageTitle}</h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{stageDescription}</p>
          </div>
          <p className="shrink-0 text-sm font-semibold text-foreground">{searching ? filteredDocs.length + (filteredDocs.length === 1 ? ' result' : ' results') : filteredDocs.length + (filteredDocs.length === 1 ? ' manual' : ' manuals')}</p>
        </div>

        {!filteredDocs.length ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-semibold">{searching ? 'No manuals found for “' + search.trim() + '”' : 'No manuals match these filters.'}</p>
            <Button variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>Clear search and filters</Button>
          </div>
        ) : showBrowseCards ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map(group => <BrowseCard key={group.label} label={browsingSystems ? displaySubsystemName(group.label) : group.label} count={group.count} description={groupDescriptionFor(group)} examples={groupExamplesFor(group)} icon={browsingSystems ? 'system' : manufacturer ? 'model' : 'machine'} onClick={() => update(browsingSystems ? { system: '', subsystem: group.label } : manufacturer ? { model: group.label } : { manufacturer: group.label, model: '' })} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredDocs.map(doc => <DocumentCard key={doc.id} {...cardProps(doc)} />)}</div>
        )}
      </section>
    </div>
  );
}
