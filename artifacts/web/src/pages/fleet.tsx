import { useState, useMemo, useCallback } from 'react';
import { FLEET, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, type CraneModel, type Category } from '@/data/craneFleet';
import { loadCustomCranes, saveCustomCrane, deleteCustomCrane, isCustomCrane } from '@/lib/customFleet';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Search, Weight, Maximize2, MoveHorizontal, Info, Settings2, Truck, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type FormState = {
  manufacturer: string;
  model: string;
  category: Category;
  maxCapacity: string;
  maxBoom: string;
  maxRadius: string;
  axles: string;
  maxTravel: boolean;
  notes: string;
};

const EMPTY_FORM: FormState = {
  manufacturer: '',
  model: '',
  category: 'Slewer',
  maxCapacity: '',
  maxBoom: '',
  maxRadius: '',
  axles: '',
  maxTravel: false,
  notes: '',
};

export default function FleetPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null);
  const [selectedCrane, setSelectedCrane] = useState<CraneModel | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [customCranes, setCustomCranes] = useState<CraneModel[]>(() => loadCustomCranes());

  const allCranes = useMemo(() => [...FLEET, ...customCranes], [customCranes]);

  const filteredFleet = useMemo(() => {
    return allCranes.filter(crane => {
      const matchSearch = search.trim() === '' ||
        crane.model.toLowerCase().includes(search.toLowerCase()) ||
        crane.manufacturer.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter ? crane.category === categoryFilter : true;
      return matchSearch && matchCat;
    });
  }, [allCranes, search, categoryFilter]);

  const handleAdd = useCallback(() => {
    if (!form.manufacturer.trim() || !form.model.trim()) {
      toast.error('Manufacturer and model are required.');
      return;
    }
    const cap = parseFloat(form.maxCapacity);
    const boom = parseFloat(form.maxBoom);
    const radius = parseFloat(form.maxRadius);
    const axles = parseInt(form.axles, 10);
    if (isNaN(cap) || cap <= 0) { toast.error('Enter a valid max capacity.'); return; }
    if (isNaN(boom) || boom <= 0) { toast.error('Enter a valid max boom length.'); return; }
    if (isNaN(radius) || radius <= 0) { toast.error('Enter a valid max radius.'); return; }

    const saved = saveCustomCrane({
      manufacturer: form.manufacturer.trim(),
      model: form.model.trim(),
      category: form.category,
      maxCapacity: cap,
      maxBoom: boom,
      maxRadius: radius,
      axles: isNaN(axles) ? 0 : axles,
      maxTravel: form.maxTravel,
      notes: form.notes.trim() || 'Custom crane added manually.',
      units: [],
    });

    setCustomCranes(loadCustomCranes());
    setForm(EMPTY_FORM);
    setAddOpen(false);
    toast.success(`${saved.model} added to fleet.`);
  }, [form]);

  const handleDelete = useCallback((crane: CraneModel) => {
    deleteCustomCrane(crane.id);
    setCustomCranes(loadCustomCranes());
    setSelectedCrane(null);
    toast.success(`${crane.model} removed from fleet.`);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-start justify-between shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Fleet</h1>
          <p className="text-muted-foreground text-sm">
            Browse the heavy lifting fleet and specifications.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add Crane
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search models or manufacturers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <Badge
            variant={categoryFilter === null ? 'default' : 'outline'}
            className="cursor-pointer whitespace-nowrap text-sm py-1.5 px-3"
            onClick={() => setCategoryFilter(null)}
          >
            All
          </Badge>
          {CATEGORIES.map(cat => (
            <Badge
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              className="cursor-pointer whitespace-nowrap text-sm py-1.5 px-3 flex items-center gap-1.5"
              style={categoryFilter === cat ? { backgroundColor: CATEGORY_COLORS[cat], color: '#000' } : {}}
              onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
            >
              <span className="opacity-70 font-mono text-[10px]">{CATEGORY_ICONS[cat]}</span>
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto -mx-6 px-6 md:mx-0 md:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {filteredFleet.map(crane => (
            <Card
              key={crane.id}
              className="bg-card/50 hover:bg-card/80 transition-all cursor-pointer border-border/50 hover:border-primary/50 group"
              onClick={() => setSelectedCrane(crane)}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      {crane.manufacturer}
                      {isCustomCrane(crane) && (
                        <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Custom
                        </span>
                      )}
                    </div>
                    <div className="text-lg font-bold group-hover:text-primary transition-colors">{crane.model}</div>
                  </div>
                  <Badge
                    variant="outline"
                    className="font-mono"
                    style={{ borderColor: CATEGORY_COLORS[crane.category], color: CATEGORY_COLORS[crane.category] }}
                  >
                    {CATEGORY_ICONS[crane.category]}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Spec icon={Weight} value={crane.maxCapacity} unit="t" />
                  <Spec icon={Maximize2} value={crane.maxBoom} unit="m" />
                  <Spec icon={MoveHorizontal} value={crane.maxRadius} unit="m" />
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredFleet.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg">
              No cranes found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Detail sheet */}
      <Sheet open={!!selectedCrane} onOpenChange={(open) => !open && setSelectedCrane(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-card border-l-border">
          {selectedCrane && (
            <div className="space-y-6 pt-6">
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="outline"
                    style={{ borderColor: CATEGORY_COLORS[selectedCrane.category], color: CATEGORY_COLORS[selectedCrane.category] }}
                  >
                    {selectedCrane.category}
                  </Badge>
                  <span className="text-sm font-medium text-muted-foreground">{selectedCrane.manufacturer}</span>
                  {isCustomCrane(selectedCrane) && (
                    <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Custom
                    </span>
                  )}
                </div>
                <SheetTitle className="text-3xl">{selectedCrane.model}</SheetTitle>
                <SheetDescription>
                  Detailed technical specifications and fleet information.
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <DetailSpec label="Max Capacity" value={`${selectedCrane.maxCapacity} tonnes`} icon={Weight} />
                <DetailSpec label="Max Boom Length" value={`${selectedCrane.maxBoom} metres`} icon={Maximize2} />
                <DetailSpec label="Max Radius" value={`${selectedCrane.maxRadius} metres`} icon={MoveHorizontal} />
                <DetailSpec label="Axles" value={selectedCrane.axles > 0 ? selectedCrane.axles : 'Crawler Tracks'} icon={Settings2} />
                <DetailSpec label="Pick & Carry" value={selectedCrane.maxTravel ? 'Capable' : 'Stationary Only'} icon={Truck} />
                <DetailSpec label="Fleet Units" value={selectedCrane.units.length > 0 ? selectedCrane.units.length : '0 active'} icon={Info} />
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Notes
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedCrane.notes}
                </p>
              </div>

              {isCustomCrane(selectedCrane) && (
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => handleDelete(selectedCrane)}
                >
                  <Trash2 className="w-4 h-4" />
                  Remove from Fleet
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add crane dialog */}
      <Dialog open={addOpen} onOpenChange={(open) => { setAddOpen(open); if (!open) setForm(EMPTY_FORM); }}>
        <DialogContent className="sm:max-w-lg bg-card border-border overflow-y-auto max-h-[90dvh]">
          <DialogHeader>
            <DialogTitle>Add Crane to Fleet</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cf-manufacturer">Manufacturer</Label>
                <Input
                  id="cf-manufacturer"
                  placeholder="e.g. Liebherr"
                  value={form.manufacturer}
                  onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cf-model">Model</Label>
                <Input
                  id="cf-model"
                  placeholder="e.g. LTM 1300-6.2"
                  value={form.model}
                  onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v as Category }))}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-60">{CATEGORY_ICONS[cat]}</span>
                        {cat}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cf-capacity">Max Capacity (t)</Label>
                <Input
                  id="cf-capacity"
                  type="number"
                  placeholder="e.g. 300"
                  value={form.maxCapacity}
                  onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cf-boom">Max Boom (m)</Label>
                <Input
                  id="cf-boom"
                  type="number"
                  placeholder="e.g. 72"
                  value={form.maxBoom}
                  onChange={e => setForm(f => ({ ...f, maxBoom: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cf-radius">Max Radius (m)</Label>
                <Input
                  id="cf-radius"
                  type="number"
                  placeholder="e.g. 60"
                  value={form.maxRadius}
                  onChange={e => setForm(f => ({ ...f, maxRadius: e.target.value }))}
                  className="font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cf-axles">Road Axles (0 = crawler)</Label>
                <Input
                  id="cf-axles"
                  type="number"
                  placeholder="e.g. 6"
                  value={form.axles}
                  onChange={e => setForm(f => ({ ...f, axles: e.target.value }))}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label>Pick &amp; Carry</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={form.maxTravel}
                    onCheckedChange={v => setForm(f => ({ ...f, maxTravel: v }))}
                  />
                  <span className="text-sm text-muted-foreground">{form.maxTravel ? 'Capable' : 'Stationary only'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cf-notes">Notes (optional)</Label>
              <Textarea
                id="cf-notes"
                placeholder="Key features, reeving configurations, site history..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="resize-none bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setForm(EMPTY_FORM); }}>
              Cancel
            </Button>
            <Button onClick={handleAdd} className="gap-2">
              <Plus className="w-4 h-4" />
              Add to Fleet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Spec({ icon: Icon, value, unit }: { icon: React.ElementType, value: number, unit: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-2 rounded bg-secondary/30 border border-border/30">
      <Icon className="w-4 h-4 text-muted-foreground mb-1" />
      <div className="font-mono text-sm font-semibold">
        {value}<span className="text-muted-foreground ml-0.5">{unit}</span>
      </div>
    </div>
  );
}

function DetailSpec({ label, value, icon: Icon }: { label: string, value: string | number, icon: React.ElementType }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider font-semibold">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="font-mono text-foreground font-medium text-lg pl-5">
        {value}
      </div>
    </div>
  );
}
