// T3 — scale as rhythm (tickets/SCALE-RHYTHM.md). A scale's pitch classes are
// onsets on a 12-pulse cycle; the steps are the inter-onset intervals.
import { pitchClasses } from './id';

/** Onset positions on the 12-pulse cycle = the scale's pitch classes. */
export function onsets(steps: number[]): number[] {
	return pitchClasses(steps);
}

/** Interval-class vector: count of each interval class 1..6 in the pc-set. */
export function intervalVector(steps: number[]): number[] {
	const pcs = pitchClasses(steps);
	const v = [0, 0, 0, 0, 0, 0];
	for (let i = 0; i < pcs.length; i++) {
		for (let j = i + 1; j < pcs.length; j++) {
			let d = Math.abs(pcs[i] - pcs[j]);
			d = Math.min(d, 12 - d);
			v[d - 1]++;
		}
	}
	return v;
}

/** Deep: every interval class occurs a distinct number of times (Toussaint). */
export function isDeep(steps: number[]): boolean {
	const v = intervalVector(steps);
	return new Set(v).size === v.length;
}

/** Euclidean rhythm E(k, n): a maximally even binary pattern, onset at index 0. */
export function euclid(k: number, n: number): number[] {
	if (k <= 0) return new Array(n).fill(0);
	if (k >= n) return new Array(n).fill(1);
	let groups: number[][] = [];
	for (let i = 0; i < n; i++) groups.push([i < k ? 1 : 0]);
	let a = k;
	let b = n - k;
	while (b > 1) {
		const m = Math.min(a, b);
		const next: number[][] = [];
		for (let i = 0; i < m; i++) next.push(groups[i].concat(groups[groups.length - m + i]));
		const remainder = groups.slice(m, groups.length - m);
		groups = next.concat(remainder);
		a = next.length;
		b = remainder.length;
		if (a <= 1) break;
	}
	const flat = groups.flat();
	const first = flat.indexOf(1);
	return flat.slice(first).concat(flat.slice(0, first));
}

/** Maximally even: the pc-set is a rotation of the Euclidean rhythm E(n, 12). */
export function isMaximallyEven(steps: number[]): boolean {
	const pcs = pitchClasses(steps);
	const n = pcs.length;
	const pattern = euclid(n, 12);
	const ePcs: number[] = [];
	for (let i = 0; i < 12; i++) if (pattern[i]) ePcs.push(i);
	const target = pcs.slice().sort((a, b) => a - b).join(',');
	for (let r = 0; r < 12; r++) {
		const rot = ePcs
			.map((p) => (p + r) % 12)
			.sort((a, b) => a - b)
			.join(',');
		if (rot === target) return true;
	}
	return false;
}
