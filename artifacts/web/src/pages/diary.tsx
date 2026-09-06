import { useEffect, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation, useSearch } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getDiary, getDiaryById, listDiary, saveDiary, type DiaryEntry } from '@/lib/diaryApi';
import { addMonths, calendarDays, displayWorkDate, localDateKey, monthRange } from '@/lib/diaryDates';

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  return localDateKey(new Date(year!, month! - 1, day)) === value;
}

export default function DiaryPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [original, setOriginal] = useState('');
  const [fromLegacy, setFromLegacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setCalendarLoading(true); setCalendarError(''); setEntries([]);
    void listDiary(monthRange(month)).then(result => { if (active) setEntries(result); })
      .catch((err: Error) => { if (active) setCalendarError(err.message); })
      .finally(() => { if (active) setCalendarLoading(false); });
    return () => { active = false; };
  }, [month, refresh]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(search);
    const requested = params.get('date') ?? params.get('new');
    if (requested && validDate(requested)) setDate(requested);
    else if (params.has('entry')) {
      void getDiaryById(params.get('entry')!).then(entry => {
        if (active && entry) navigate(`/diary?date=${entry.date}`, { replace: true });
      }).catch((err: Error) => { if (active) setCalendarError(err.message); });
    }
    return () => { active = false; };
  }, [search, navigate]);

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoading(true); setError(''); setFeedback(''); setSummary(''); setOriginal(''); setFromLegacy(false);
    void getDiary(date).then(entry => {
      if (!active) return;
      setSummary(entry?.summary ?? ''); setOriginal(entry?.summary ?? ''); setFromLegacy(entry?.fromLegacy ?? false);
    }).catch((err: Error) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date, retry]);

  const openDay = (value: string) => {
    setError(''); setFeedback(''); setLoading(true); setSummary(''); setOriginal('');
    setDate(value);
    navigate(`/diary?date=${value}`, { replace: true });
  };
  const close = () => {
    if (saving || (summary !== original && !window.confirm('Discard your unsaved daily summary changes?'))) return;
    setDate(null); navigate('/diary', { replace: true });
  };
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!date || loading || saving) return;
    setSaving(true); setFeedback('');
    try {
      const entry = await saveDiary({ date, summary });
      setSummary(entry.summary); setOriginal(entry.summary); setFromLegacy(false);
      setFeedback('Daily summary saved.'); setRefresh(value => value + 1);
    } catch (err) { setFeedback(`Could not save: ${(err as Error).message}`); }
    finally { setSaving(false); }
  };
  const recorded = new Set(entries.map(entry => entry.date));
  const today = localDateKey(new Date());

  return <div className="mx-auto min-h-full max-w-3xl space-y-5 p-4 pb-28 sm:p-6 md:p-8">
    <div><h1 className="text-3xl font-bold tracking-tight">Technician Diary</h1>
      <p className="mt-1 text-sm text-muted-foreground">One daily summary, private to your technician account. Select a date to write or edit.</p></div>
    <Card>
      <CardHeader className="p-4"><div className="flex items-center justify-between gap-2">
        <Button aria-label="Previous month" size="icon" variant="outline" className="h-11 w-11" onClick={() => setMonth(addMonths(month, -1))}><ChevronLeft /></Button>
        <CardTitle className="text-center text-lg">{new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' }).format(month)}</CardTitle>
        <Button aria-label="Next month" size="icon" variant="outline" className="h-11 w-11" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight /></Button>
      </div><Button variant="ghost" className="mt-2 h-11" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); openDay(today); }}>Today</Button></CardHeader>
      <CardContent className="p-2 sm:p-4">
        <div className="grid grid-cols-7 text-center text-xs font-bold uppercase text-muted-foreground">{'Sun Mon Tue Wed Thu Fri Sat'.split(' ').map(day => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">{calendarDays(month).map(({ date: day, currentMonth }) => {
          const key = localDateKey(day);
          return <button key={key} type="button" aria-label={`${displayWorkDate(key)}${recorded.has(key) ? ', has daily summary' : ''}`} aria-current={key === today ? 'date' : undefined}
            onClick={() => { if (!currentMonth) setMonth(new Date(day.getFullYear(), day.getMonth(), 1)); openDay(key); }}
            className={`relative min-h-12 rounded-md border text-sm sm:min-h-16 ${key === today ? 'border-primary bg-primary/10' : currentMonth ? 'border-border bg-background hover:border-primary/60' : 'border-transparent text-muted-foreground/50'}`}>
            {day.getDate()}{recorded.has(key) && <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary" />}
          </button>;
        })}</div>
        <p className="mt-3 text-center text-xs text-muted-foreground" role="status">{calendarLoading ? 'Loading summaries…' : 'A dot marks a date with a summary.'}</p>
        {calendarError && <div role="alert" className="mt-3 text-sm text-destructive">Could not load calendar: {calendarError} <Button variant="outline" onClick={() => setRefresh(value => value + 1)}>Retry</Button></div>}
      </CardContent>
    </Card>
    <Dialog open={date !== null} onOpenChange={open => { if (!open) close(); }}>
      <DialogContent className="max-h-[95dvh] w-[calc(100%-1rem)] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader><DialogTitle>{date ? displayWorkDate(date) : 'Daily summary'}</DialogTitle><DialogDescription>Private to you. Saving updates this date’s summary.</DialogDescription></DialogHeader>
        {loading ? <p role="status">Loading daily summary…</p> : error ? <div role="alert"><p>{error}</p><Button className="mt-3 h-12" onClick={() => setRetry(value => value + 1)}>Retry</Button></div> : <form className="space-y-4" onSubmit={event => void save(event)}>
          <div className="space-y-2"><Label htmlFor="daily-summary">Daily summary</Label>
            <Textarea id="daily-summary" autoFocus required disabled={saving} value={summary} onChange={event => { setSummary(event.target.value); setFeedback(''); }}
              className="min-h-64 resize-y text-base leading-relaxed" placeholder="What did you work on today?" aria-describedby="summary-help" /></div>
          <p id="summary-help" className="text-xs text-muted-foreground">Up to 20,000 characters.{fromLegacy ? ' Previous diary notes for this date have been combined here. The originals remain stored.' : ''}</p>
          {summary.trim().length > 20_000 && <p role="alert" className="text-sm text-destructive">Please shorten this summary to 20,000 characters before saving. Stored history is unchanged.</p>}
          <Button className="h-12 w-full font-bold" disabled={saving || !summary.trim() || summary.trim().length > 20_000}>{saving ? 'Saving…' : 'Save summary'}</Button>
          {feedback && <p role="status" aria-live="polite" className="text-sm">{feedback}</p>}
        </form>}
      </DialogContent>
    </Dialog>
  </div>;
}
