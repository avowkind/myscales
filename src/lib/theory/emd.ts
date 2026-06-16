// T1 — circular Earth-Mover's distance between scales (tickets/EXPLORER-LAYOUT.md).
// Each scale is a uniform mass distribution over its pitch classes (rooted). The
// distance is the minimal transport cost around the 12-tone circle = voice-leading
// effort. Closed form for circular EMD: sum |C_i - median(C)| over prefix sums.
import { pitchClasses } from './id';

function massVector(steps: number[]): number[] {
	const pcs = pitchClasses(steps);
	const v = new Array(12).fill(0);
	for (const pc of pcs) v[pc] += 1 / pcs.length;
	return v;
}

/** Rooted circular Earth-Mover's distance. Smaller = more aurally similar. */
export function circularEMD(stepsA: number[], stepsB: number[]): number {
	const a = massVector(stepsA);
	const b = massVector(stepsB);
	const C: number[] = [];
	let acc = 0;
	for (let i = 0; i < 12; i++) {
		acc += a[i] - b[i];
		C.push(acc);
	}
	const median = [...C].sort((x, y) => x - y)[5];
	return C.reduce((s, c) => s + Math.abs(c - median), 0);
}
