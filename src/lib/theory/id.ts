// Scale id encoding (DESIGN.md §2.2): the id IS the interval-step signature.

export function stepsToId(steps: number[]): string {
	return steps.join('-');
}

export function idToSteps(id: string): number[] {
	return id.split('-').map((s) => parseInt(s, 10));
}

/** Cumulative pitch classes of the scale, rooted at 0 (length = number of notes). */
export function pitchClasses(steps: number[]): number[] {
	const pcs: number[] = [];
	let acc = 0;
	for (const s of steps) {
		pcs.push(acc % 12);
		acc += s;
	}
	return pcs;
}

/** 12-bit pitch-class number, root = bit 0 (Major = 2741). */
export function pcNumber(steps: number[]): number {
	let mask = 0;
	for (const pc of pitchClasses(steps)) mask |= 1 << pc;
	return mask;
}

export function isValidSteps(steps: number[]): boolean {
	return steps.length > 0 && steps.every((s) => s > 0) && steps.reduce((a, b) => a + b, 0) === 12;
}
