import { useMemo, useState, type MouseEvent } from 'react';
import { TECH_DOCS, SYSTEM_COLORS, SYSTEM_ICONS, docUrl, type TechDoc } from '@/data/techDocs';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, FileText, Layers, Star, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ALL = 'all';

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '');
}

function searchableText(doc: TechDoc) {
  return [
    doc.title,
    doc.subtitle,
    doc.system,
    doc.type,
    doc.docNumber,
    ...doc.appliesTo,
    ...doc.craneTypes,
    doc.summary,
    ...doc.sections.flatMap((section) => [section.ref, section.title, section.summary]),
  ].filter(Boolean).join(' ');
}

function matchesSearch(doc: TechDoc, query: string) {
  const terms = query.trim().split(/\s+/).map(normalizeSearch).filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeSearch(searchableText(doc));
  return terms.every((term) => haystack.includes(term));
}

type DocumentCardProps = {
  doc: TechDoc;
  favourite: boolean;
  onSelect: (doc: TechDoc) => void;
  onOpen: (doc: TechDoc) => void;
  onToggleFavourite: (id: string) => void;
  compact?: boolean;
};

function DocumentCard({ doc, favourite, onSelect, onOpen, onToggleFavourite, compact = false }: DocumentCardProps) {
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
              <Badge variant="secondary">{doc.type}</Badge>
            </div>
            <CardTitle className="text-base leading-snug transition-colors group-hover:text-primary sm:text-lg">{doc.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2 text-xs">{doc.subtitle}</CardDescription>
          </div>
          <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background/60 hover:border-primary hover:text-primary" onClick={toggleFavourite} aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'} title={favourite ? 'Remove from favourites' : 'Add to favourites'}>
            <Star className={`h-5 w-5 ${favourite ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className={`mt-auto ${compact ? 'p-4 pt-1' : 'p-5 pt-1'}`}>
        {!compact && <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{doc.summary}</p>}
        <div className="mb-4 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
          {doc.craneTypes.slice(0, compact ? 2 : 4).map((model) => <Badge key={model} variant="outline" className="max-w-full truncate bg-secondary/20 font-normal">{model}</Badge>)}
          {doc.craneTypes.length > (compact ? 2 : 4) && <Badge variant="outline">+{doc.craneTypes.length - (compact ? 2 : 4)}</Badge>}
          {doc.year && <Badge variant="outline">{doc.year}</Badge>}
          {doc.pages && <Badge variant="outline">{doc.pages} pages</Badge>}
          {doc.docNumber && <Badge variant="outline">No. {doc.docNumber}</Badge>}
        </div>
        <Button className="h-11 w-full font-bold" onClick={(event) => { event.stopPropagation(); onOpen(doc); }}>
          <ExternalLink className="mr-2 h-4 w-4" /> Open Manual
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState(ALL);
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [equipmentFilter, setEquipmentFilter] = useState(ALL);
  const [favouritesOnly, setFavouritesOnly] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<TechDoc | null>(null);
  const { favouriteIds, recentlyViewedIds, toggleFavourite, recordViewed } = useDocumentLibrary();

  const systems = useMemo(() => [...new Set(TECH_DOCS.map((doc) => doc.system))].sort(), []);
  const types = useMemo(() => [...new Set(TECH_DOCS.map((doc) => doc.type))].sort(), []);
  const equipment = useMemo(() => [...new Set(TECH_DOCS.flatMap((doc) => doc.craneTypes))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })), []);
  const docsById = useMemo(() => new Map(TECH_DOCS.map((doc) => [doc.id, doc])), []);
  const recentDocs = recentlyViewedIds.map((id) => docsById.get(id)).filter((doc): doc is TechDoc => Boolean(doc));
  const recentlyAdded = useMemo(() => TECH_DOCS.filter((doc) => doc.addedAt).sort((a, b) => (b.addedAt ?? '').localeCompare(a.addedAt ?? '')).slice(0, 7), []);
  const hasFilters = Boolean(search.trim()) || systemFilter !== ALL || typeFilter !== ALL || equipmentFilter !== ALL || favouritesOnly;

  const filteredDocs = useMemo(() => TECH_DOCS.filter((doc) =>
    matchesSearch(doc, search)
    && (systemFilter === ALL || doc.system === systemFilter)
    && (typeFilter === ALL || doc.type === typeFilter)
    && (equipmentFilter === ALL || doc.craneTypes.includes(equipmentFilter))
    && (!favouritesOnly || favouriteIds.includes(doc.id)),
  ), [search, systemFilter, typeFilter, equipmentFilter, favouritesOnly, favouriteIds]);

  const clearFilters = () => {
    setSearch('');
    setSystemFilter(ALL);
    setTypeFilter(ALL);
    setEquipmentFilter(ALL);
    setFavouritesOnly(false);
  };

  const openDocument = (doc: TechDoc) => {
    recordViewed(doc.id);
    window.open(docUrl(doc), '_blank', 'noopener,noreferrer');
  };

  const cardProps = (doc: TechDoc) => ({ doc, favourite: favouriteIds.includes(doc.id), onSelect: setSelectedDoc, onOpen: openDocument, onToggleFavourite: toggleFavourite });

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-6 p-4 pb-24 sm:p-6 sm:pb-24 md:p-8 lg:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Technical Library</h1>
        <p className="mt-1 text-sm text-muted-foreground">Service manuals, screen guides, and reference material.</p>
      </div>

      <section aria-labelledby="recently-added-heading">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div><h2 id="recently-added-heading" className="text-lg font-bold">Recently Added</h2><p className="text-xs text-muted-foreground">The latest manuals in CraneHub</p></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recentlyAdded.map((doc) => <DocumentCard key={doc.id} {...cardProps(doc)} compact />)}
        </div>
      </section>

      <section aria-labelledby="recently-viewed-heading">
        <h2 id="recently-viewed-heading" className="mb-3 text-lg font-bold">Recently Viewed</h2>
        {recentDocs.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentDocs.slice(0, 4).map((doc) => <DocumentCard key={doc.id} {...cardProps(doc)} compact />)}
          </div>
        ) : <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">No recently viewed documents yet. Manuals you open will appear here.</div>}
      </section>

      <Separator />

      <section aria-labelledby="all-documents-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="all-documents-heading" className="text-xl font-bold">All Documents <span className="text-sm font-normal text-muted-foreground">({filteredDocs.length})</span></h2>{hasFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="mr-1 h-4 w-4" />Clear filters</Button>}</div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_repeat(3,minmax(150px,220px))_auto]">
          <div className="relative min-w-0"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search documents" placeholder="Search model, component, manual…" value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 bg-card/60 pl-9" /></div>
          <Select value={systemFilter} onValueChange={setSystemFilter}><SelectTrigger className="h-11 bg-card/60" aria-label="Filter by manufacturer or system"><SelectValue placeholder="All systems" /></SelectTrigger><SelectContent><SelectItem value={ALL}>All systems</SelectItem>{systems.map((system) => <SelectItem key={system} value={system}>{system}</SelectItem>)}</SelectContent></Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="h-11 bg-card/60" aria-label="Filter by document type"><SelectValue placeholder="All types" /></SelectTrigger><SelectContent><SelectItem value={ALL}>All types</SelectItem>{types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select>
          <Select value={equipmentFilter} onValueChange={setEquipmentFilter}><SelectTrigger className="h-11 bg-card/60" aria-label="Filter by model or equipment"><SelectValue placeholder="All equipment" /></SelectTrigger><SelectContent><SelectItem value={ALL}>All equipment</SelectItem>{equipment.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Button type="button" variant={favouritesOnly ? 'default' : 'outline'} className="h-11 min-w-32" onClick={() => setFavouritesOnly((value) => !value)} aria-pressed={favouritesOnly}><Star className={`mr-2 h-4 w-4 ${favouritesOnly ? 'fill-current' : ''}`} />Favourites</Button>
        </div>

        {filteredDocs.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredDocs.map((doc) => <DocumentCard key={doc.id} {...cardProps(doc)} />)}</div> : (
          <div className="rounded-lg border border-dashed border-border px-5 py-12 text-center"><FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h3 className="font-semibold">{favouritesOnly && !favouriteIds.length ? 'No favourites yet' : 'No documents match your search'}</h3><p className="mt-1 text-sm text-muted-foreground">{favouritesOnly && !favouriteIds.length ? 'Use the star button on a manual to save it here.' : 'Try a different model number or clear the active filters.'}</p><Button variant="outline" className="mt-4" onClick={clearFilters}>Clear search and filters</Button></div>
        )}
      </section>

      <Sheet open={Boolean(selectedDoc)} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <SheetContent className="flex w-full flex-col overflow-y-auto border-l-border bg-card p-0 sm:max-w-md">
          {selectedDoc && <><div className="space-y-5 p-6"><SheetHeader><div className="mb-2 flex flex-wrap gap-2"><Badge variant="outline" style={{ borderColor: SYSTEM_COLORS[selectedDoc.system], color: SYSTEM_COLORS[selectedDoc.system] }}>{selectedDoc.system}</Badge><Badge variant="secondary">{selectedDoc.type}</Badge></div><SheetTitle className="text-2xl leading-tight">{selectedDoc.title}</SheetTitle><SheetDescription className="text-base font-medium">{selectedDoc.subtitle}</SheetDescription></SheetHeader><p className="text-sm leading-relaxed text-muted-foreground">{selectedDoc.summary}</p><div className="flex flex-wrap gap-2">{selectedDoc.craneTypes.map((model) => <Badge key={model} variant="outline" className="bg-secondary/20">{model}</Badge>)}{selectedDoc.year && <Badge variant="outline">{selectedDoc.year}</Badge>}{selectedDoc.pages && <Badge variant="outline">{selectedDoc.pages} pages</Badge>}{selectedDoc.docNumber && <Badge variant="outline">No. {selectedDoc.docNumber}</Badge>}</div></div><Separator /><div className="flex-1 space-y-4 p-6"><h4 className="flex items-center gap-2 font-semibold"><Layers className="h-4 w-4 text-primary" />Document Sections</h4><Accordion type="multiple">{selectedDoc.sections.map((section, index) => <AccordionItem key={`${section.ref}-${index}`} value={`section-${index}`}><AccordionTrigger className="text-left text-sm hover:text-primary hover:no-underline"><span className="mr-3 shrink-0 font-mono text-muted-foreground">{section.ref}</span><span>{section.title}</span></AccordionTrigger><AccordionContent className="ml-2 border-l border-border/50 pl-6 text-sm leading-relaxed text-muted-foreground">{section.summary}</AccordionContent></AccordionItem>)}</Accordion></div><div className="sticky bottom-0 z-10 border-t border-border bg-card/95 p-6 backdrop-blur"><Button className="h-12 w-full font-bold" onClick={() => openDocument(selectedDoc)}><ExternalLink className="mr-2 h-4 w-4" />Open Manual</Button></div></>}
        </SheetContent>
      </Sheet>
    </div>
  );
}
