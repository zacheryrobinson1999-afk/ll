import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { TECH_DOCS } from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';
import { workflowRequest, type ActivityEvent } from '@/lib/workflowApi';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Button } from '@/components/ui/button';

export function ActivityRows({ events }: { events: ActivityEvent[] }) {
  const labels: Record<string, string> = { manual_opened: 'Opened manual', bookmark_added: 'Bookmarked', bookmark_removed: 'Removed bookmark', crane_viewed: 'Viewed crane' };
  return events.length ? <div className="space-y-2">{events.map((event) => {
    const doc = TECH_DOCS.find((item) => item.id === event.entityId);
    const crane = FLEET.find((item) => item.id === event.entityId);
    const href = event.entityType === 'crane' ? `/fleet?crane=${encodeURIComponent(event.entityId)}` : `/docs?document=${encodeURIComponent(event.entityId)}`;
    return <Link key={event.id} href={href} className="block min-h-11 rounded-md border border-border p-3 hover:border-primary">
      <span className="text-xs text-muted-foreground">{labels[event.type] ?? 'Activity'} · {new Date(event.createdAt).toLocaleString()}</span>
      <p className="break-words text-sm">{doc?.title ?? crane?.model ?? event.entityId}</p>
    </Link>;
  })}</div> : <p className="text-sm text-muted-foreground">No recent activity yet.</p>;
}
export function RecentActivity() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState(false); const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0); const { bookmarks } = useBookmarks();
  useEffect(() => {
    let active = true; setLoading(true);
    void workflowRequest<{ activity: ActivityEvent[] }>('/activity').then((result) => {
      if (active) { setEvents(result.activity); setError(false); }
    }).catch(() => { if (active) setError(true); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry, bookmarks]);
  return <section className="min-w-0 rounded-lg border border-border bg-card p-4" aria-label="Recent activity">
    <h3 className="mb-3 text-lg font-bold">Recent activity</h3>
    {loading ? <p role="status">Loading activity…</p> : error ? <div role="alert">Activity is unavailable.<Button variant="outline" onClick={() => setRetry((value) => value + 1)}>Retry</Button></div> : <ActivityRows events={events} />}
  </section>;
}
