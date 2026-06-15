// Rule-based fingering (DESIGN.md §10). Computed per key because which scale
// notes are black keys — and therefore where the thumb may fall — changes with
// key. Each hand gets its own thumb placement: for the RH the thumb starts a
// group (1-2-3 / 1-2-3-4 going up); for the LH the thumb ends an ascending group
// (…4-3-2-1), so the two hands' turns fall in different places.
import { pitchClasses } from './id';

export type Hand = 'rh' | 'lh';

const BLACK = new Set([1, 3, 6, 8, 10]);

export interface Fingering {
	rh: number[]; // length = notes*octaves + 1 (closing root)
	lh: number[];
	rhThumbs: number[]; // scale-degree indices where the RH thumb falls
	lhThumbs: number[];
}

function isBlack(root: number, pc: number): boolean {
	return BLACK.has((root + pc) % 12);
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

/** All cyclic thumb-placements that split the octave into gaps of 2..4 notes. */
function candidateThumbSets(n: number): Set<number>[] {
	const sets: Set<number>[] = [];
	for (let mask = 1; mask < 1 << n; mask++) {
		const t: number[] = [];
		for (let d = 0; d < n; d++) if (mask & (1 << d)) t.push(d);
		if (t.length < 2) continue;
		let ok = true;
		for (let i = 0; i < t.length; i++) {
			const gap = mod(t[(i + 1) % t.length] - t[i], n) || n;
			if (gap < 2 || gap > 4) {
				ok = false;
				break;
			}
		}
		if (ok) sets.push(new Set(t));
	}
	return sets;
}

function fingersFor(T: Set<number>, n: number, octaves: number, hand: Hand): number[] {
	const total = n * octaves + 1;
	const arr: number[] = [];
	for (let i = 0; i < total; i++) {
		let d = 0;
		while (d < 4 && !T.has(mod(hand === 'rh' ? i - d : i + d, n))) d++;
		arr.push(Math.min(1 + d, 5));
	}
	if (hand === 'rh') {
		// the highest note tops out on the little finger only when it would
		// otherwise start a fresh group (a thumb); mid-group tops keep their finger.
		if (arr[total - 1] === 1) arr[total - 1] = 5;
	} else {
		// the lowest LH note is never a thumb — it belongs to the group above and
		// is fingered by its distance to the first thumb up the scale.
		let k = 1;
		while (k < n && !T.has(mod(k, n))) k++;
		arr[0] = Math.min(1 + k, 5);
	}
	return arr;
}

function scoreFingers(arr: number[], n: number, root: number, pcs: number[], hand: Hand): number {
	let cost = 0;
	let thumbs = 0;
	for (let i = 0; i < arr.length; i++) {
		const black = isBlack(root, pcs[i % n]);
		const f = arr[i];
		if (f === 1) {
			thumbs++;
			if (black) cost += 100; // thumbs must avoid black keys
		}
		if (f === 4) cost += black ? -6 : 1; // reward a long finger on a black key
	}
	cost += thumbs * 2; // fewer turns is better
	// tiebreak: RH prefers the smaller finger early (1-2-3 before 1-2-3-4),
	// LH prefers the larger (mirror image).
	let tb = 0;
	for (let i = 0; i < arr.length; i++) tb += arr[i] * Math.pow(0.02, i + 1);
	cost += hand === 'rh' ? tb : -tb;
	return cost;
}

function bestHand(steps: number[], root: number, octaves: number, hand: Hand) {
	const pcs = pitchClasses(steps);
	const n = pcs.length;
	let best: number[] = [];
	let bestT = new Set<number>([0]);
	let bestCost = Infinity;
	for (const T of candidateThumbSets(n)) {
		const arr = fingersFor(T, n, octaves, hand);
		const c = scoreFingers(arr, n, root, pcs, hand);
		if (c < bestCost) {
			bestCost = c;
			best = arr;
			bestT = T;
		}
	}
	return { fingers: best, thumbs: [...bestT].sort((a, b) => a - b) };
}

export function fingering(steps: number[], root: number, octaves = 2): Fingering {
	const rh = bestHand(steps, root, octaves, 'rh');
	const lh = bestHand(steps, root, octaves, 'lh');
	return { rh: rh.fingers, lh: lh.fingers, rhThumbs: rh.thumbs, lhThumbs: lh.thumbs };
}
