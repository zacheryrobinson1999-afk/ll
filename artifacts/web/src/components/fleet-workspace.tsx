import { manualDetailHref } from '../../../api-server/src/lib/catalog/manualDetail';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import type { CraneModel } from '@/data/craneFleet';
import { TECH_DOCS } from '@/data/techDocs';
import { isCustomCrane } from '@/lib/customFleet';
import { listNotes } from '@/lib/notesApi';
import { workflowRequest, type FleetDetails } from '@/lib/workflowApi';
import { relatedManuals, sameModel } from '../../../api-server/src/lib/catalog/fleetRelevance';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BookmarkButton } from './bookmark-button';
import { ActivityRows } from './recent-activity';
import { Button } from './ui/button';

export function FleetWorkspace({ crane }: { crane: CraneModel }) {
  const { bookmarks } = useBookmarks();
  const manuals = useMemo(() => relatedManuals(crane), [crane]);
  const [details, setDetails] = useState<FleetDetails | null>(null);
  const [error, setError] = useState(false); const [retry, setRetry] = useState(0);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let result: FleetDetails;
        if (isCustomCrane(crane)) {
          const notes = await listNotes();
          result = { notes: notes.filter((note) => sameModel(note.craneModel, crane)).slice(0, 10), activity: [], bookmarks: [], unavailable: [] };
        } else {
          result = await workflowRequest<FleetDetails>(`/fleet/${encodeURIComponent(crane.id)}`);
        }
        if (active) { setDetails(result); setError(false); }
      } catch { if (active) setError(true); }
    };
    void load(); return () => { active = false; };
  }, [crane, retry]);
  useEffect(() => {
    if (!isCustomCrane(crane)) void workflowRequest(`/fleet/${encodeURIComponent(crane.id)}/view`, 'POST').catch(() => {});
  }, [crane.id]);
  const saved = manuals.filter((manual) => bookmarks.some((bookmark) => bookmark.documentId === manual.documentId));
  const manualRows = (rows: typeof manuals) => rows.map((match) => {
    const doc = TECH_DOCS.find((item) => item.id === match.documentId)!;
    return <article key={doc.id} className="space-y-2 rounded-md border border-border p-3">
      <Link href={manualDetailHref(doc.id, { from: `/fleet?crane=${encodeURIComponent(crane.id)}` })} className="block font-medium text-primary">{doc.title}</Link>
      <p className="text-xs text-muted-foreground">{doc.type} · {doc.system}</p>
      <p className="text-xs text-muted-foreground">{match.reason}</p>
      <div className="flex flex-wrap gap-2"><Button asChild><Link href={manualDetailHref(doc.id, { from: `/fleet?crane=${encodeURIComponent(crane.id)}` })}>View manual</Link></Button><BookmarkButton documentId={doc.id} /></div>
    </article>;
  });
  return <div className="space-y-6">
    <section><h3 className="font-semibold">Fleet identity</h3><p className="break-words text-sm">{crane.units.length ? `Fleet numbers: ${crane.units.join(', ')}` : `Catalogue ID: ${crane.id}`}</p>
      <p className="text-xs text-muted-foreground">Serial number and year are not recorded in this catalogue.</p></section>
    <section className="space-y-2"><h3 className="font-semibold">Related manuals</h3><p className="text-xs text-muted-foreground">Check model, serial and control-system applicability before use.</p>{manuals.length ? manualRows(showAll ? manuals : manuals.slice(0, 3)) : <p className="text-sm">No supported catalogue matches.</p>}
      {manuals.length > 3 && <Button variant="outline" onClick={() => setShowAll((value) => !value)} aria-expanded={showAll}>{showAll ? 'Show fewer manuals' : `Show all ${manuals.length} related manuals`}</Button>}</section>
    <section className="space-y-2"><h3 className="font-semibold">Your bookmarked related manuals</h3>{saved.length ? manualRows(saved) : <p className="text-sm text-muted-foreground">No related bookmarks yet.</p>}</section>
    {error ? <div role="alert">Private crane data is unavailable.<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button></div> : !details ? <p role="status">Loading private crane data…</p> : <>
      {details.unavailable.length > 0 && <p role="alert">Unable to load: {details.unavailable.join(', ')}.<Button onClick={() => setRetry((value) => value + 1)}>Retry</Button></p>}
      <section className="space-y-2"><h3 className="font-semibold">Your linked workshop notes</h3>{details.notes.length ? details.notes.map((note) => <Link key={note.id} href={`/notes?note=${encodeURIComponent(note.id)}`} className="block min-h-11 rounded-md border p-3 text-sm">{note.title}</Link>) : <p className="text-sm text-muted-foreground">No notes with this exact model link.</p>}</section>
      <section className="space-y-2"><h3 className="font-semibold">Your crane activity</h3>{isCustomCrane(crane) ? <p className="text-sm text-muted-foreground">Custom cranes remain on this device; their views are not recorded on the server.</p> : <ActivityRows events={details.activity} />}</section>
    </>}
    <p className="text-xs text-muted-foreground">Daily summaries have no structured crane link, so diary mentions are not inferred.</p>
  </div>;
}
