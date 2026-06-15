// Scale-degree labelling, derived purely from interval offsets (DESIGN.md §5.1).
import { pitchClasses } from './id';

export interface DegreeInfo {
	num: number; // 1..7
	alt: -1 | 0 | 1; // flat / natural / sharp relative to the major-scale degree
}

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

// Fixed chromatic-offset → degree map. The tritone (6) is context-sensitive and
// resolved in degreeInfos() below.
const BASE: Record<number, DegreeInfo> = {
	0: { num: 1, alt: 0 },
	1: { num: 2, alt: -1 },
	2: { num: 2, alt: 0 },
	3: { num: 3, alt: -1 },
	4: { num: 3, alt: 0 },
	5: { num: 4, alt: 0 },
	7: { num: 5, alt: 0 },
	8: { num: 6, alt: -1 },
	9: { num: 6, alt: 0 },
	10: { num: 7, alt: -1 },
	11: { num: 7, alt: 0 }
};

/** Degree info for every note of the scale, in order. */
export function degreeInfos(steps: number[]): DegreeInfo[] {
	const pcs = pitchClasses(steps);
	const set = new Set(pcs);
	return pcs.map((pc) => {
		if (pc === 6) {
			// tritone: ♯4 (raised fourth) if there's no perfect 4th, else ♭5.
			return set.has(5) ? { num: 5, alt: -1 } : { num: 4, alt: 1 };
		}
		return BASE[pc];
	});
}

export function degreeLabel(d: DegreeInfo, roman = false): string {
	const acc = d.alt === -1 ? '♭' : d.alt === 1 ? '♯' : '';
	return acc + (roman ? ROMAN[d.num] : String(d.num));
}

export function degreeLabels(steps: number[], roman = false): string[] {
	return degreeInfos(steps).map((d) => degreeLabel(d, roman));
}
