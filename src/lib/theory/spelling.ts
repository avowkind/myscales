// Note spelling and key-signature logic (DESIGN.md §7).
import { LETTERS, LETTER_PC, SHARP_NAMES, FLAT_NAMES } from './notes';
import type { Letter, Accidental, SpelledNote } from './notes';
import { pitchClasses } from './id';

export type Pref = 'sharp' | 'flat';

export interface Tonic {
	letter: Letter;
	accidental: Accidental;
}

export function tonicPc(t: Tonic): number {
	return (((LETTER_PC[t.letter] + t.accidental) % 12) + 12) % 12;
}

/** Octave of the letter whose natural pitch lands nearest to the absolute MIDI value. */
function octaveForLetter(letter: Letter, absMidi: number): number {
	const lpc = LETTER_PC[letter];
	return Math.round((absMidi - lpc) / 12) - 1;
}

function parseFromTable(name: string): { letter: Letter; accidental: Accidental } {
	const letter = name[0] as Letter;
	const accidental = (name.includes('♯') ? 1 : name.includes('♭') ? -1 : 0) as Accidental;
	return { letter, accidental };
}

/**
 * Spell the scale as an ascending run of notes starting at the tonic.
 * 7-note scales get one letter per degree; others fall back to the
 * sharp/flat table per the preference.
 */
export function spellScale(
	steps: number[],
	tonic: Tonic,
	pref: Pref,
	baseOctave = 4
): SpelledNote[] {
	const pcs = pitchClasses(steps);
	const n = pcs.length;
	const root = tonicPc(tonic);
	const baseMidi = (baseOctave + 1) * 12 + root;

	const partial: { letter: Letter; accidental: Accidental; pc: number; absMidi: number }[] = [];
	const tonicLetterIdx = LETTERS.indexOf(tonic.letter);

	for (let i = 0; i < n; i++) {
		const absMidi = baseMidi + cumulative(steps, i);
		const actualPc = (root + pcs[i]) % 12;
		let letter: Letter;
		let accidental: Accidental;
		if (n === 7) {
			letter = LETTERS[(tonicLetterIdx + i) % 7];
			const natural = LETTER_PC[letter];
			let diff = (((actualPc - natural) % 12) + 12) % 12;
			if (diff > 6) diff -= 12; // -6..6, prefer nearest
			accidental = diff as Accidental;
		} else {
			const table = pref === 'sharp' ? SHARP_NAMES : FLAT_NAMES;
			({ letter, accidental } = parseFromTable(table[actualPc]));
		}
		partial.push({ letter, accidental, pc: actualPc, absMidi });
	}

	return partial.map((p) => ({
		letter: p.letter,
		accidental: p.accidental,
		pc: p.pc,
		octave: octaveForLetter(p.letter, p.absMidi)
	}));
}

function cumulative(steps: number[], i: number): number {
	let acc = 0;
	for (let k = 0; k < i; k++) acc += steps[k];
	return acc;
}

/** Absolute MIDI numbers for the scale ascending across `octaves`, plus the final root. */
export function scaleMidis(steps: number[], root: number, baseOctave = 4, octaves = 2): number[] {
	const baseMidi = (baseOctave + 1) * 12 + root;
	const out: number[] = [];
	for (let o = 0; o < octaves; o++) {
		let acc = 0;
		for (const s of steps) {
			out.push(baseMidi + o * 12 + acc);
			acc += s;
		}
	}
	out.push(baseMidi + octaves * 12); // closing root
	return out;
}

const MAJOR = [2, 2, 1, 2, 2, 2, 1];
const MAJOR_CUM = [0, 2, 4, 5, 7, 9, 11];

function rotationOf(steps: number[], pattern: number[]): number | null {
	if (steps.length !== pattern.length) return null;
	for (let r = 0; r < pattern.length; r++) {
		let match = true;
		for (let i = 0; i < pattern.length; i++) {
			if (steps[i] !== pattern[(r + i) % pattern.length]) {
				match = false;
				break;
			}
		}
		if (match) return r;
	}
	return null;
}

// Major-key signatures as VexFlow key strings, indexed by tonic pitch class.
const MAJOR_KEY: Record<number, { sharp: string; flat: string }> = {
	0: { sharp: 'C', flat: 'C' },
	1: { sharp: 'C#', flat: 'Db' },
	2: { sharp: 'D', flat: 'D' },
	3: { sharp: 'Eb', flat: 'Eb' },
	4: { sharp: 'E', flat: 'E' },
	5: { sharp: 'F', flat: 'F' },
	6: { sharp: 'F#', flat: 'Gb' },
	7: { sharp: 'G', flat: 'G' },
	8: { sharp: 'Ab', flat: 'Ab' },
	9: { sharp: 'A', flat: 'A' },
	10: { sharp: 'Bb', flat: 'Bb' },
	11: { sharp: 'B', flat: 'Cb' }
};

/**
 * Key signature for the stave. Diatonic modes get their parent major's signature;
 * everything else returns null (notated with inline accidentals). DESIGN §7.3.
 */
export function keySignature(steps: number[], root: number, pref: Pref): string | null {
	const r = rotationOf(steps, MAJOR);
	if (r === null) return null;
	const parentPc = (((root - MAJOR_CUM[r]) % 12) + 12) % 12;
	return MAJOR_KEY[parentPc][pref];
}
