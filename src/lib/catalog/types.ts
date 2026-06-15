export type Family =
	| 'major'
	| 'minor'
	| 'mode'
	| 'pentatonic'
	| 'blues'
	| 'symmetric'
	| 'exotic'
	| 'generated';

export interface ParentRelation {
	scaleId: string; // id or slug of the parent scale
	degree: number;
	text: string;
}

export interface ScaleRecord {
	id: string; // canonical, derived from steps (e.g. "2-2-1-2-2-2-1")
	steps: number[]; // the one required structural fact
	pcNumber: number; // derived 12-bit pitch-class number
	family: Family;
	named: boolean;
	slug?: string;
	name?: string;
	aliases?: string[];
	description?: string;
	mood?: string;
	colour?: string;
	examples?: string[];
	parent?: ParentRelation;
	relations?: string[]; // ids or slugs
}

export const FAMILY_ORDER: Family[] = [
	'major',
	'mode',
	'minor',
	'pentatonic',
	'blues',
	'symmetric',
	'exotic',
	'generated'
];

export const FAMILY_LABEL: Record<Family, string> = {
	major: 'Major',
	mode: 'Diatonic modes',
	minor: 'Minor variants',
	pentatonic: 'Pentatonic',
	blues: 'Blues',
	symmetric: 'Symmetric',
	exotic: 'Exotic',
	generated: 'Explorer'
};
