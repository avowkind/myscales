// Encyclopedia generator (DESIGN.md §3): every rooted step-pattern summing to 12
// with 5–8 notes and no step larger than 4 semitones.
import { stepsToId, pcNumber } from '../theory/id';
import type { ScaleRecord } from './types';

const MIN_NOTES = 5;
const MAX_NOTES = 8;
const MAX_STEP = 4;

function compositions(total: number, maxParts: number): number[][] {
	const out: number[][] = [];
	function recurse(remaining: number, parts: number[]) {
		if (remaining === 0) {
			if (parts.length >= MIN_NOTES && parts.length <= MAX_NOTES) out.push([...parts]);
			return;
		}
		if (parts.length >= maxParts) return;
		for (let s = 1; s <= Math.min(MAX_STEP, remaining); s++) {
			parts.push(s);
			recurse(remaining - s, parts);
			parts.pop();
		}
	}
	recurse(total, []);
	return out;
}

export function generateScales(): ScaleRecord[] {
	return compositions(12, MAX_NOTES).map((steps) => ({
		id: stepsToId(steps),
		steps,
		pcNumber: pcNumber(steps),
		family: 'generated' as const,
		named: false
	}));
}
