import type { CraneModel } from './craneFleet';
import { TECH_DOCS, type TechDoc } from './techDocs';
import { compactSearch, normalizeSearch } from './searchNormalization';

export function sameModel(value: string | null, crane: Pick<CraneModel, 'model' | 'manufacturer'>) {
  if (!value) return false;
  return [crane.model, `${crane.manufacturer} ${crane.model}`].some((model) => compactSearch(value) === compactSearch(model));
}
export function relatedManuals(crane: Pick<CraneModel, 'model' | 'manufacturer'>, documents: TechDoc[] = TECH_DOCS) {
  const modelTokens = crane.model.match(/[a-z]+|[0-9]+/gi) ?? [];
  const namedModel = modelTokens.length ? new RegExp(`(^|[^a-z0-9])${modelTokens.join('[^a-z0-9]*')}($|[^a-z0-9])`, 'i') : null;
  return documents.flatMap((doc) => {
    const modelMatch = [...doc.appliesTo, ...doc.craneTypes].some((model) => sameModel(model, crane))
      || Boolean(namedModel?.test(doc.title));
    const manufacturerMatch = [doc.manufacturer, doc.system, doc.sourceSystem].some((value) =>
      value && normalizeSearch(value).split(' ').includes(normalizeSearch(crane.manufacturer)));
    if (!modelMatch && !manufacturerMatch) return [];
    return [{ documentId: doc.id, reason: modelMatch ? 'Model named in catalogue metadata; check manual limits.' : 'Manufacturer/system match only; applicability unconfirmed.', modelMatch }];
  }).sort((a, b) => Number(b.modelMatch) - Number(a.modelMatch));
}
