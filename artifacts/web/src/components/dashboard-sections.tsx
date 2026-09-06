import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, ChevronRight, Plus, Star, StickyNote } from 'lucide-react';
import { Link } from 'wouter';
import { TECH_DOCS, type TechDoc } from '@/data/techDocs';
import { useDocumentLibrary } from '@/hooks/useDocumentLibrary';
import { listNotes, type WorkshopNote } from '@/lib/notesApi';
import { listDiary, type DiaryEntry } from '@/lib/diaryApi';
import { displayWorkDate, localDateKey } from '@/lib/diaryDates';
import { RecentActivity } from '@/components/recent-activity';
import { Button } from '@/components/ui/button'; import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardSections() {
  const { favouriteIds, recentlyViewedIds } = useDocumentLibrary(); const [notes, setNotes] = useState<WorkshopNote[]>([]); const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const today = localDateKey(new Date()); const historyStart = new Date(); historyStart.setDate(historyStart.getDate() - 89); const from = localDateKey(historyStart);
  useEffect(() => {
    let active = true;
    void Promise.allSettled([listNotes(), listDiary({ from, to: today })]).then(([noteResult, diaryResult]) => {
      if (!active) return;
      if (noteResult.status === 'fulfilled') setNotes(noteResult.value);
      if (diaryResult.status === 'fulfilled') setDiary(diaryResult.value);
    });
    return () => { active = false; };
  }, [from, today]);
  const byId = useMemo(() => new Map(TECH_DOCS.map((doc) => [doc.id, doc])), []);
  const recentManuals = recentlyViewedIds.map((id) => byId.get(id)).filter((doc): doc is TechDoc => Boolean(doc)).slice(0, 3);
  const favourites = favouriteIds.map((id) => byId.get(id)).filter((doc): doc is TechDoc => Boolean(doc)).slice(0, 3);
  const todayEntry = diary.find((entry) => entry.date === today); const recentWork = diary.slice(0, 4);
  return <section className="space-y-5 py-4" aria-labelledby="dashboard-heading"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="dashboard-heading" className="text-2xl font-bold">Your Workshop</h2><p className="text-sm text-muted-foreground">Recent references and private work records</p></div><div className="flex gap-2"><Button asChild variant="outline" className="h-11"><Link href={`/diary?date=${today}`}><Plus className="mr-1 h-4 w-4" />Diary</Link></Button><Button asChild className="h-11"><Link href="/notes?new=1"><Plus className="mr-1 h-4 w-4" />Note</Link></Button></div></div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"><DashboardCard title="Today’s Diary" icon={<CalendarDays />} action="Open diary" href="/diary">{todayEntry ? <DiaryRow entry={todayEntry} /> : <Empty text="No daily summary yet." />}</DashboardCard><DashboardCard title="Recent Workshop Notes" icon={<StickyNote />} action="All notes" href="/notes">{notes.length ? notes.slice(0, 3).map((note) => <Link key={note.id} href={`/notes?note=${note.id}`} className="block rounded-md border border-border p-3 hover:border-primary/60"><div className="truncate font-medium">{note.title}</div><div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">{note.craneModel && <span>{note.craneModel}</span>}{note.systemCategory && <span>· {note.systemCategory}</span>}<span>· {new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(note.updatedAt))}</span></div></Link>) : <Empty text="No workshop notes yet." />}</DashboardCard><DashboardCard title="Recent Manuals" icon={<BookOpen />} action="Manuals" href="/docs"><ManualRows docs={recentManuals} empty="Manuals you open appear here." /></DashboardCard><DashboardCard title="Favourite Manuals" icon={<Star />} action="Favourites" href="/docs"><ManualRows docs={favourites} empty="Star a manual to keep it close." /></DashboardCard><DashboardCard title="Recent Daily Summaries" icon={<CalendarDays />} action="History" href="/diary">{recentWork.length ? recentWork.map((entry) => <DiaryRow key={entry.id} entry={entry} />) : <Empty text="Your latest daily summaries appear here." />}</DashboardCard></div>
    <Link href="/bookmarks" className="inline-flex min-h-11 items-center font-semibold text-primary">Your private bookmarks</Link>
    <RecentActivity />
  </section>;
}
function DashboardCard({ title, icon, action, href, children }: { title: string; icon: React.ReactNode; action: string; href: string; children: React.ReactNode }) { return <Card className="min-w-0 overflow-hidden"><CardHeader className="flex flex-row items-center justify-between gap-2 p-4 pb-2"><CardTitle className="flex min-w-0 items-center gap-2 text-lg [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0 [&_svg]:text-primary">{icon}<span className="truncate">{title}</span></CardTitle><Link href={href} className="flex min-h-11 shrink-0 items-center text-xs font-bold text-primary">{action}<ChevronRight className="h-4 w-4" /></Link></CardHeader><CardContent className="min-w-0 space-y-2 p-4 pt-2">{children}</CardContent></Card>; }
function DiaryRow({ entry }: { entry: DiaryEntry }) { return <Link href={`/diary?date=${entry.date}`} className="block rounded-md border border-border p-3 hover:border-primary/60"><div className="font-medium">{displayWorkDate(entry.date)}</div><p className="mt-1 line-clamp-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">{entry.summary}</p></Link>; }
function ManualRows({ docs, empty }: { docs: TechDoc[]; empty: string }) { return docs.length ? docs.map((doc) => <Link key={doc.id} href={`/docs?document=${doc.id}`} className="flex min-h-12 items-center gap-3 rounded-md border border-border p-3 hover:border-primary/60"><BookOpen className="h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><div className="truncate font-medium">{doc.title}</div><div className="truncate text-xs text-muted-foreground">{doc.system} · {doc.type}</div></div></Link>) : <Empty text={empty} />; }
function Empty({ text }: { text: string }) { return <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">{text}</p>; }
