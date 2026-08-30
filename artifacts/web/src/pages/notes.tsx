import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FileText, Pencil, Plus, Search, StickyNote, Trash2, X } from 'lucide-react';
import { TECH_DOCS } from '@/data/techDocs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createNote, deleteNote, listNotes, updateNote, type NoteInput, type WorkshopNote } from '@/lib/notesApi';
import { useLocation } from 'wouter';

const emptyInput: NoteInput = { title: '', body: '', craneModel: null, systemCategory: null, documentId: null, documentTitle: null, pageReference: null, tags: [] };
const control = 'h-12 w-full rounded-md border border-input bg-background px-3 text-base';

function dateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function NotesPage() {
  const [location, navigate] = useLocation();
  const [notes, setNotes] = useState<WorkshopNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<WorkshopNote | null>(null);
  const [form, setForm] = useState<NoteInput>(emptyInput);
  const [tagText, setTagText] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [model, setModel] = useState('all');
  const [system, setSystem] = useState('all');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const { toast } = useToast();

  useEffect(() => { void listNotes().then(setNotes).catch((error: Error) => toast({ title: 'Could not load notes', description: error.message, variant: 'destructive' })).finally(() => setLoading(false)); }, [toast]);
  useEffect(() => {
    if (loading) return;
    const noteId = new URLSearchParams(location.split('?')[1] ?? '').get('note');
    if (!noteId) return;
    const note = notes.find((item) => item.id === noteId);
    if (note) openEdit(note);
  }, [loading, location, notes]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get('document');
    if (!documentId) return;
    const document = TECH_DOCS.find((item) => item.id === documentId);
    if (!document) return;
    setForm({ ...emptyInput, craneModel: document.craneTypes[0] ?? null, systemCategory: document.system, documentId: document.id, documentTitle: document.title });
    setEditorOpen(true);
    window.history.replaceState(null, '', `${import.meta.env.BASE_URL}notes`);
  }, []);

  const models = useMemo(() => [...new Set(notes.map((note) => note.craneModel).filter((value): value is string => Boolean(value)))].sort(), [notes]);
  const systems = useMemo(() => [...new Set(notes.map((note) => note.systemCategory).filter((value): value is string => Boolean(value)))].sort(), [notes]);
  const visible = useMemo(() => notes.filter((note) => {
    const query = search.trim().toLocaleLowerCase();
    return (!query || [note.title, note.body, note.craneModel, note.systemCategory, note.documentTitle, note.pageReference, ...note.tags].some((value) => value?.toLocaleLowerCase().includes(query)))
      && (model === 'all' || note.craneModel === model)
      && (system === 'all' || note.systemCategory === system);
  }).sort((a, b) => (sort === 'newest' ? -1 : 1) * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())), [notes, search, model, system, sort]);

  const openCreate = () => { setEditing(null); setForm(emptyInput); setTagText(''); setEditorOpen(true); };
  const openEdit = (note: WorkshopNote) => { setEditing(note); setForm({ title: note.title, body: note.body, craneModel: note.craneModel, systemCategory: note.systemCategory, documentId: note.documentId, documentTitle: note.documentTitle, pageReference: note.pageReference, tags: note.tags }); setTagText(note.tags.join(', ')); setEditorOpen(true); };
  const setText = (key: keyof NoteInput, value: string) => setForm((current) => ({ ...current, [key]: value.trim() ? value : null }));

  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true);
    const input = { ...form, title: form.title.trim(), body: form.body.trim(), tags: [...new Set(tagText.split(',').map((tag) => tag.trim()).filter(Boolean))] };
    try {
      const saved = editing ? await updateNote(editing.id, input) : await createNote(input);
      setNotes((current) => editing ? current.map((note) => note.id === saved.id ? saved : note) : [saved, ...current]);
      setEditorOpen(false); toast({ title: editing ? 'Note updated' : 'Note saved' });
    } catch (error) { toast({ title: 'Could not save note', description: (error as Error).message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const remove = async (note: WorkshopNote) => {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    try { await deleteNote(note.id); setNotes((current) => current.filter((item) => item.id !== note.id)); toast({ title: 'Note deleted' }); }
    catch (error) { toast({ title: 'Could not delete note', description: (error as Error).message, variant: 'destructive' }); }
  };

  const hasFilters = search || model !== 'all' || system !== 'all';
  return <div className="mx-auto min-h-full max-w-[1400px] space-y-5 p-4 pb-28 sm:p-6 sm:pb-28 md:p-8 lg:pb-8">
    <div className="flex items-start justify-between gap-3"><div><h1 className="text-3xl font-bold tracking-tight">Workshop Notes</h1><p className="mt-1 text-sm text-muted-foreground">Your private field notes, available wherever you sign in.</p></div><Button className="hidden h-12 font-bold sm:flex" onClick={openCreate}><Plus className="mr-2 h-5 w-5" />Create note</Button></div>
    <Button className="h-12 w-full font-bold sm:hidden" onClick={openCreate}><Plus className="mr-2 h-5 w-5" />Create note</Button>
    <Card><CardContent className="grid gap-3 p-4 lg:grid-cols-[minmax(260px,1fr)_220px_220px_160px_auto]">
      <div className="relative"><Search className="absolute left-3 top-4 h-5 w-5 text-muted-foreground" /><Input className="h-12 pl-10 text-base" placeholder="Search your notes…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <select aria-label="Filter by crane model" className={control} value={model} onChange={(event) => setModel(event.target.value)}><option value="all">All crane models</option>{models.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Filter by system" className={control} value={system} onChange={(event) => setSystem(event.target.value)}><option value="all">All systems</option>{systems.map((item) => <option key={item}>{item}</option>)}</select>
      <select aria-label="Sort notes" className={control} value={sort} onChange={(event) => setSort(event.target.value as 'newest' | 'oldest')}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
      {hasFilters && <Button variant="outline" className="h-12" onClick={() => { setSearch(''); setModel('all'); setSystem('all'); }}><X className="mr-2 h-4 w-4" />Clear</Button>}
    </CardContent></Card>
    {loading ? <div className="py-16 text-center text-muted-foreground">Loading notes…</div> : visible.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map((note) => <Card key={note.id} className="flex min-w-0 flex-col border-border/70 bg-card/70"><CardHeader className="p-5 pb-3"><div className="flex items-start justify-between gap-3"><CardTitle className="min-w-0 break-words text-xl leading-tight">{note.title}</CardTitle><div className="flex shrink-0 gap-1"><Button size="icon" variant="ghost" className="h-11 w-11" aria-label={`Edit ${note.title}`} onClick={() => openEdit(note)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="h-11 w-11 text-destructive" aria-label={`Delete ${note.title}`} onClick={() => void remove(note)}><Trash2 className="h-4 w-4" /></Button></div></div><div className="flex flex-wrap gap-1.5">{note.craneModel && <Badge variant="secondary">{note.craneModel}</Badge>}{note.systemCategory && <Badge variant="outline">{note.systemCategory}</Badge>}</div></CardHeader><CardContent className="flex flex-1 flex-col p-5 pt-1"><p className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">{note.body}</p>{note.documentTitle && <div className="mt-4 rounded-md border border-border bg-background/40 p-3 text-xs"><div className="flex items-center gap-2 font-medium"><FileText className="h-4 w-4 text-primary" />{note.documentTitle}</div>{note.pageReference && <div className="mt-1 text-muted-foreground">Page/reference: {note.pageReference}</div>}</div>}{note.tags.length > 0 && <div className="mt-4 flex flex-wrap gap-1.5">{note.tags.map((tag) => <Badge key={tag} variant="outline">#{tag}</Badge>)}</div>}<div className="mt-auto pt-5 text-xs text-muted-foreground">Created {dateTime(note.createdAt)}{note.updatedAt !== note.createdAt && <> · Updated {dateTime(note.updatedAt)}</>}</div></CardContent></Card>)}</div> : <Card className="border-dashed"><CardContent className="px-5 py-16 text-center"><StickyNote className="mx-auto mb-4 h-10 w-10 text-primary" /><h2 className="text-xl font-bold">{notes.length ? 'No notes match these filters' : 'No workshop notes yet'}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{notes.length ? 'Clear a filter or try a different search.' : 'Capture a pressure reading, diagnostic clue, or manual reference while it is fresh.'}</p>{!notes.length && <Button className="mt-5 h-12 font-bold" onClick={openCreate}><Plus className="mr-2 h-5 w-5" />Create your first note</Button>}</CardContent></Card>}
    <Dialog open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open && new URLSearchParams(location.split('?')[1] ?? '').has('note')) navigate('/notes', { replace: true }); }}><DialogContent className="max-h-[96dvh] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto p-4 sm:p-6"><DialogHeader><DialogTitle>{editing ? 'Edit workshop note' : 'New workshop note'}</DialogTitle><DialogDescription>Only your signed-in account can view or change this note.</DialogDescription></DialogHeader><form className="space-y-5" onSubmit={(event) => void save(event)}>
      <div className="space-y-2"><Label htmlFor="note-title">Title</Label><Input id="note-title" className="h-12 text-base" maxLength={160} required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. V37.3 pressure check" /></div>
      <div className="space-y-2"><Label htmlFor="note-body">Workshop note</Label><Textarea id="note-body" className="min-h-44 resize-y text-base leading-6" maxLength={20000} required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Record the finding, measurement, or next step…" /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="note-model">Crane/model (optional)</Label><Input id="note-model" className="h-12 text-base" maxLength={120} value={form.craneModel ?? ''} onChange={(event) => setText('craneModel', event.target.value)} placeholder="LTM 1050-3.1" /></div><div className="space-y-2"><Label htmlFor="note-system">System/category (optional)</Label><Input id="note-system" className="h-12 text-base" maxLength={120} value={form.systemCategory ?? ''} onChange={(event) => setText('systemCategory', event.target.value)} placeholder="Suspension" /></div></div>
      <div className="space-y-2"><Label htmlFor="note-document">Manual/document (optional)</Label><Input id="note-document" className="h-12 text-base" maxLength={300} value={form.documentTitle ?? ''} onChange={(event) => setText('documentTitle', event.target.value)} placeholder="Relevant hydraulic manual" /></div>
      <div className="space-y-2"><Label htmlFor="note-page">Page/reference (optional)</Label><Input id="note-page" className="h-12 text-base" maxLength={160} value={form.pageReference ?? ''} onChange={(event) => setText('pageReference', event.target.value)} placeholder="Hydraulic diagram, page 37" /></div>
      <div className="space-y-2"><Label htmlFor="note-tags">Tags (optional, comma-separated)</Label><Input id="note-tags" className="h-12 text-base" value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="pressure, valves, follow-up" /></div>
      <Button className="h-13 w-full text-base font-bold" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Save workshop note'}</Button>
    </form></DialogContent></Dialog>
  </div>;
}
