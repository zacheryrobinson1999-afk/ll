import { useState, useMemo } from 'react';
import { TECH_DOCS, DOC_SYSTEMS, SYSTEM_COLORS, SYSTEM_ICONS, TYPE_ICONS, docUrl, type TechDoc, type DocSystem } from '@/data/techDocs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, FileText, Layers, Tag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function DocsPage() {
  const [search, setSearch] = useState('');
  const [systemFilter, setSystemFilter] = useState<DocSystem | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<TechDoc | null>(null);

  const filteredDocs = useMemo(() => {
    return TECH_DOCS.filter(doc => {
      const matchSearch = search.trim() === '' || 
        doc.title.toLowerCase().includes(search.toLowerCase()) || 
        doc.subtitle.toLowerCase().includes(search.toLowerCase()) ||
        doc.summary.toLowerCase().includes(search.toLowerCase());
      const matchSystem = systemFilter ? doc.system === systemFilter : true;
      const matchType = typeFilter !== 'all' ? doc.type === typeFilter : true;
      return matchSearch && matchSystem && matchType;
    });
  }, [search, systemFilter, typeFilter]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    TECH_DOCS.forEach(d => types.add(d.type));
    return Array.from(types).sort();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="space-y-2 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Technical Library</h1>
        <p className="text-muted-foreground text-sm">
          Service manuals, screen guides, and reference material.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card/50"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-card/50">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 shrink-0 hide-scrollbar">
        <Badge 
          variant={systemFilter === null ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap text-sm py-1.5 px-3"
          onClick={() => setSystemFilter(null)}
        >
          All Systems
        </Badge>
        {DOC_SYSTEMS.map(sys => (
          <Badge 
            key={sys}
            variant={systemFilter === sys ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap text-sm py-1.5 px-3 flex items-center gap-1.5"
            style={systemFilter === sys ? { backgroundColor: SYSTEM_COLORS[sys], color: '#fff' } : {}}
            onClick={() => setSystemFilter(sys === systemFilter ? null : sys)}
          >
            <span className="opacity-70 font-mono text-[10px]">{SYSTEM_ICONS[sys]}</span>
            {sys}
          </Badge>
        ))}
      </div>

      <div className="flex-1 overflow-auto -mx-6 px-6 md:mx-0 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
          {filteredDocs.map(doc => (
            <Card 
              key={doc.id} 
              className="bg-card/50 hover:bg-card/80 transition-all cursor-pointer border-border/50 hover:border-primary/50 group flex flex-col h-full"
              onClick={() => setSelectedDoc(doc)}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {doc.title}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-1">
                      {doc.subtitle}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant="outline" 
                    className="shrink-0 font-mono"
                    style={{ borderColor: SYSTEM_COLORS[doc.system], color: SYSTEM_COLORS[doc.system] }}
                  >
                    {SYSTEM_ICONS[doc.system]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 mt-auto">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4">
                  <span className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded">
                    <Tag className="w-3 h-3" />
                    {doc.type}
                  </span>
                  {doc.pages && (
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {doc.pages} pp
                    </span>
                  )}
                  {doc.year && (
                    <span>Est. {doc.year}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
              No documents found matching your criteria.
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l-border p-0 flex flex-col">
          {selectedDoc && (
            <>
              <div className="p-6 space-y-6">
                <SheetHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge 
                      variant="outline" 
                      style={{ borderColor: SYSTEM_COLORS[selectedDoc.system], color: SYSTEM_COLORS[selectedDoc.system] }}
                    >
                      {selectedDoc.system}
                    </Badge>
                    <Badge variant="secondary">{selectedDoc.type}</Badge>
                  </div>
                  <SheetTitle className="text-2xl leading-tight">{selectedDoc.title}</SheetTitle>
                  <SheetDescription className="text-base font-medium">
                    {selectedDoc.subtitle}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    {selectedDoc.summary}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedDoc.craneTypes.map(ct => (
                      <Badge key={ct} variant="outline" className="bg-secondary/20">
                        {ct}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex-1 p-6 space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Document Sections
                </h4>
                <Accordion type="multiple" className="w-full">
                  {selectedDoc.sections.map((section, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger className="text-left text-sm hover:no-underline hover:text-primary">
                        <span className="font-mono text-muted-foreground mr-3 shrink-0">{section.ref}</span>
                        <span>{section.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed pl-10 border-l border-border/50 ml-2">
                        {section.summary}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              <div className="p-6 border-t border-border bg-card/95 sticky bottom-0 z-10 supports-[backdrop-filter]:bg-card/80 backdrop-blur">
                <Button 
                  className="w-full font-bold h-12" 
                  onClick={() => window.open(docUrl(selectedDoc), '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Document
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}