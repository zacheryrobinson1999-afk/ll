import { useEffect, useState } from 'react';
import { workflowRequest, type ActivityEvent } from '@/lib/workflowApi';

export function useManualActivity(detailId: string | null) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (detailId) return;
    let active = true;
    const refresh = () => { void workflowRequest<{ activity: ActivityEvent[] }>('/activity')
      .then(result => { if (active) { setEvents(result.activity); setError(false); } })
      .catch(() => { if (active) { setEvents([]); setError(true); } }); };
    refresh(); window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('focus', refresh); };
  }, [detailId, retry]);
  return { events, error, retry: () => setRetry(value => value + 1) };
}
