import { Link } from 'wouter';
import type { TechDoc } from '@/data/techDocs';
import { FLEET } from '@/data/craneFleet';
import { manualDetailHref, manualMetadata } from '../../../api-server/src/lib/catalog/manualDetail';

export function ManualShortcut({ doc, from = '/docs', openedAt }: { doc: TechDoc; from?: string; openedAt?: string }) {
  const meta = manualMetadata(doc, FLEET);
  return <Link href={manualDetailHref(doc.id, { from })} className="block min-w-0 space-y-2 rounded-lg border border-border bg-card p-4 hover:border-primary focus-visible:outline focus-visible:outline-primary">
    <h3 className="font-semibold leading-snug">{doc.title}</h3>
    <p className="text-xs text-muted-foreground">{meta.manufacturer} · {meta.type}</p>
    {meta.models.length > 0 && <p className="line-clamp-2 text-xs text-muted-foreground">{meta.models.join(' · ')}</p>}
    {openedAt && Number.isFinite(Date.parse(openedAt)) && <time dateTime={openedAt} className="block text-xs text-muted-foreground">{new Date(openedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>}
  </Link>;
}
