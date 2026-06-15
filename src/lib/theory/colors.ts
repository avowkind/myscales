// Colour systems (DESIGN.md §6). Two independent palettes.

// A. Gap-size palette for the interval line, keyed by semitone distance.
export const GAP_COLORS: Record<number, string> = {
	1: '#e4572e', // semitone — red
	2: '#3d7dca', // whole tone — blue
	3: '#f2a516', // minor-third leap — amber
	4: '#2e9e6b' // major-third leap — green
};

export function gapColor(size: number): string {
	return GAP_COLORS[size] ?? '#888888';
}

// B. Degree-signature palette for keyboard fills. Root/4th/5th/7th carry signature
// hues; flats render darker, sharps lighter; other degrees are neutral.
const DEGREE_BASE: Record<number, string> = {
	1: '#c0392b', // root — deep red
	4: '#2471a3', // subdominant — blue
	5: '#1e8449', // dominant — green
	7: '#7d3c98' // leading tone — purple
};
const NEUTRAL = '#5d6d7e';

function mix(hex: string, withWhite: boolean, amount: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	const t = withWhite ? 255 : 0;
	const f = (c: number) => Math.round(c + (t - c) * amount);
	return '#' + [f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, '0')).join('');
}

export function degreeColor(num: number, alt: -1 | 0 | 1): string {
	const base = DEGREE_BASE[num] ?? NEUTRAL;
	if (alt === -1) return mix(base, false, 0.28); // flat → darker
	if (alt === 1) return mix(base, true, 0.34); // sharp → lighter
	return base;
}
