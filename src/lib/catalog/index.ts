// Merged catalog: named scales win over generated ones sharing the same id
// (DESIGN.md §3.2). Lookups resolve either an id or a slug.
import { NAMED_SCALES } from './named';
import { generateScales } from './generate';
import { FAMILY_ORDER, FAMILY_LABEL } from './types';
import type { ScaleRecord, Family } from './types';

export type { ScaleRecord, Family } from './types';
export { FAMILY_ORDER, FAMILY_LABEL } from './types';

const byId = new Map<string, ScaleRecord>();
const bySlug = new Map<string, ScaleRecord>();

for (const s of generateScales()) byId.set(s.id, s);
for (const s of NAMED_SCALES) byId.set(s.id, s); // named overrides generated
for (const s of byId.values()) if (s.slug) bySlug.set(s.slug, s);

export const ALL_SCALES: ScaleRecord[] = [...byId.values()];

/** Resolve a route param that may be a slug or a raw id. */
export function getScale(idOrSlug: string): ScaleRecord | undefined {
	return bySlug.get(idOrSlug) ?? byId.get(idOrSlug);
}

/** Pretty signature label, e.g. "2·2·1·2·2·2·1". */
export function signatureLabel(scale: ScaleRecord): string {
	return scale.steps.join('·');
}

export function displayName(scale: ScaleRecord): string {
	return scale.name ?? signatureLabel(scale);
}

/** The canonical route segment for a scale (slug when named, else id). */
export function routeOf(scale: ScaleRecord): string {
	return scale.slug ?? scale.id;
}

export interface FamilyGroup {
	family: Family;
	label: string;
	scales: ScaleRecord[];
}

/** Named scales grouped by family for the sidebar (Explorer handled separately). */
export function namedByFamily(): FamilyGroup[] {
	const groups: FamilyGroup[] = [];
	for (const family of FAMILY_ORDER) {
		if (family === 'generated') continue;
		const scales = NAMED_SCALES.filter((s) => s.family === family).sort((a, b) =>
			(a.name ?? '').localeCompare(b.name ?? '')
		);
		if (scales.length) groups.push({ family, label: FAMILY_LABEL[family], scales });
	}
	return groups;
}

export function generatedScales(): ScaleRecord[] {
	return ALL_SCALES.filter((s) => s.family === 'generated').sort((a, b) => a.pcNumber - b.pcNumber);
}

export function search(query: string): ScaleRecord[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const hay = (s: ScaleRecord) =>
		[s.name, s.id, s.mood, s.colour, s.description, ...(s.aliases ?? []), ...(s.examples ?? [])]
			.filter(Boolean)
			.join(' ')
			.toLowerCase();
	return ALL_SCALES.filter((s) => s.named && hay(s).includes(q)).slice(0, 30);
}
