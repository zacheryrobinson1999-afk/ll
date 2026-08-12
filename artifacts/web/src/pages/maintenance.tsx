import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getManufacturers, getByManufacturer, getByCategory, CATEGORY_ICONS, CATEGORY_COLORS } from '@/data/craneFleet';
import { getByFleetId, docUrl } from '@/data/techDocs';
import { fetchUploadedDocs, uploadDoc, formatBytes } from '@/lib/uploadsApi';
import { generateDailyCodes, makeLegacyDate } from '@/lib/daycodesApi';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ChevronLeft, KeyRound, ExternalLink, Upload, File, FileText, ChevronRight, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BRAND_COLORS: Record<string, string> = {
  Liebherr: '#F7BE21',
  Grove: '#0055A5',
  'Terex Franna': '#E8271A',
  Demag: '#5C6BC0',
  Sany: '#E65100',
  Kobelco: '#00796B'
};

const BRAND_TEXT: Record<string, string> = {
  Liebherr: '#000000',
  Grove: '#ffffff',
  'Terex Franna': '#ffffff',
  Demag: '#ffffff',
  Sany: '#ffffff',
  Kobelco: '#ffffff'
};

export default function MaintenancePage({ params }: { params?: { manufacturer?: string, craneId?: string } }) {
  const [, setLocation] = useLocation();

  if (params?.craneId && params?.manufacturer) {
    return <CraneDetailView manufacturer={params.manufacturer} craneId={params.craneId} onBack={() => setLocation(`/maintenance/${params.manufacturer}`)} />;
  }

  if (params?.manufacturer) {
    return <ManufacturerView manufacturer={params.manufacturer} onBack={() => setLocation('/maintenance')} onSelect={(id) => setLocation(`/maintenance/${params.manufacturer}/${id}`)} />;
  }

  return <Overview />;
}

function Overview() {
  const [, setLocation] = useLocation();
  const manufacturers = getManufacturers();

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
        <p className="text-muted-foreground text-sm">
          Service records, daily codes, and procedures by brand.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {manufacturers.map(mfr => {
          const cranes = getByManufacturer(mfr);
          const color = BRAND_COLORS[mfr] || '#444';
          const textColor = BRAND_TEXT[mfr] || '#fff';
          
          return (
            <Card 
              key={mfr} 
              className="cursor-pointer transition-all hover:scale-[1.02] border-transparent hover:shadow-lg relative overflow-hidden group"
              onClick={() => setLocation(`/maintenance/${mfr}`)}
            >
              <div className="absolute inset-0 opacity-10 transition-opacity group-hover:opacity-20" style={{ backgroundColor: color }} />
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4 min-h-[160px]">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl shadow-inner"
                  style={{ backgroundColor: color, color: textColor }}
                >
                  {mfr.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{mfr}</h3>
                  <p className="text-sm text-muted-foreground">{cranes.length} models</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ManufacturerView({ manufacturer, onBack, onSelect }: { manufacturer: string, onBack: () => void, onSelect: (id: string) => void }) {
  const cranes = getByManufacturer(manufacturer);
  const color = BRAND_COLORS[manufacturer] || '#444';

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <h1 className="text-2xl font-bold tracking-tight">{manufacturer} Fleet</h1>
          </div>
          <p className="text-muted-foreground text-sm">Select a crane to view procedures and codes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cranes.map(crane => (
          <Card 
            key={crane.id} 
            className="cursor-pointer hover:bg-card/80 transition-colors border-border/50 group"
            onClick={() => onSelect(crane.id)}
          >
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{crane.model}</h3>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="font-mono text-[10px] uppercase">{crane.category}</Badge>
                  <span>{crane.maxCapacity}t capacity</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function CraneDetailView({ manufacturer, craneId, onBack }: { manufacturer: string, craneId: string, onBack: () => void }) {
  const crane = getByManufacturer(manufacturer).find(c => c.id === craneId);
  const docs = crane ? getByFleetId(crane.id) : [];
  const isLiebherr = manufacturer === 'Liebherr';

  if (!crane) return <div className="p-8">Crane not found</div>;

  return (
    <div className="p-6 md:p-8 space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{crane.model}</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            <span style={{ color: BRAND_COLORS[manufacturer] || '#fff' }}>{manufacturer}</span>
            <span>•</span>
            <span>{crane.category}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Reference Docs */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                Reference Manuals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {docs.length > 0 ? (
                <div className="space-y-3">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-start justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 group">
                      <div>
                        <div className="font-semibold text-sm group-hover:text-primary transition-colors">{doc.title}</div>
                        <div className="text-xs text-muted-foreground">{doc.type} • {doc.system}</div>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => window.open(docUrl(doc), '_blank')}>
                        Open <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-6">
                  No official reference manuals found for this model.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Maintenance Docs */}
          <UploadedDocsSection craneId={crane.id} />
        </div>

        <div className="space-y-6">
          {isLiebherr && (
            <Card className="border-primary/30 shadow-[0_0_15px_-3px_rgba(247,190,33,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-primary" />
                  LICCON Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LicconInlineWidget />
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                Key Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Max Capacity</span>
                <span className="font-mono font-medium">{crane.maxCapacity} t</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Max Boom</span>
                <span className="font-mono font-medium">{crane.maxBoom} m</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Max Radius</span>
                <span className="font-mono font-medium">{crane.maxRadius} m</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Axles</span>
                <span className="font-mono font-medium">{crane.axles || 'Tracked'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function UploadedDocsSection({ craneId }: { craneId: string }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);

  const { data: uploads = [], isLoading } = useQuery({
    queryKey: ['uploads', craneId],
    queryFn: () => fetchUploadedDocs(craneId),
  });

  const uploadMut = useMutation({
    mutationFn: (f: File) => uploadDoc(craneId, f),
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['uploads', craneId] });
      // Reset file input natively
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) input.value = '';
    },
    onError: (err: any) => {
      toast.error(err.message || 'Upload failed');
    }
  });

  const handleUpload = () => {
    if (file) {
      uploadMut.mutate(file);
    }
  };

  return (
    <Card className="bg-card/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-muted-foreground" />
          Field Reports & Certificates
        </CardTitle>
        <CardDescription>Upload local maintenance records.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <Input 
              id="file-upload"
              type="file" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="bg-card cursor-pointer file:text-primary file:font-semibold file:bg-primary/10 file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
            />
          </div>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploadMut.isPending}
            className="shrink-0"
          >
            {uploadMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : uploads.length > 0 ? (
          <div className="space-y-2">
            {uploads.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-background rounded text-muted-foreground">
                    <File className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                      <span>{formatBytes(doc.size)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => window.open(doc.url, '_blank')}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg bg-secondary/10">
            No field reports uploaded yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LicconInlineWidget() {
  const [serial, setSerial] = useState('');
  const [date, setDate] = useState(makeLegacyDate());
  const [result, setResult] = useState<{first: string, second: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await generateDailyCodes(serial, date);
      setResult(res);
    } catch (err: any) {
      toast.error(err.message || 'Invalid input');
      setResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Serial</label>
          <Input 
            placeholder="073123" 
            value={serial} 
            onChange={e => setSerial(e.target.value)} 
            className="font-mono text-sm h-9 bg-background/50 border-primary/20 focus-visible:ring-primary"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Date</label>
          <Input 
            placeholder="DDMMYY" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="font-mono text-sm h-9 bg-background/50 border-primary/20 focus-visible:ring-primary"
          />
        </div>
      </div>
      <Button type="submit" size="sm" className="w-full font-bold" disabled={isGenerating}>
        {isGenerating ? 'Generating…' : 'Generate'}
      </Button>
      
      {result && (
        <div className="pt-2 animate-in fade-in zoom-in duration-300">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-background rounded border border-primary/20 p-2">
              <div className="text-[10px] text-muted-foreground uppercase mb-0.5">Code 1</div>
              <div className="font-mono font-bold text-primary">{result.first}</div>
            </div>
            <div className="bg-background rounded border border-primary/20 p-2">
              <div className="text-[10px] text-muted-foreground uppercase mb-0.5">Code 2</div>
              <div className="font-mono font-bold text-primary">{result.second}</div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
