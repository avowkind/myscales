// Pitch-class and note-name primitives.
// Pitch classes are 0..11 with 0 = C.

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export type Letter = (typeof LETTERS)[number];

// Natural (no accidental) pitch class of each letter.
export const LETTER_PC: Record<Letter, number> = {
	C: 0,
	D: 2,
	E: 4,
	F: 5,
	G: 7,
	A: 9,
	B: 11
};

// Default spellings used for non-diatonic scales, chosen by sharp/flat preference.
export const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
export const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];

export type Accidental = -2 | -1 | 0 | 1 | 2;

export const ACCIDENTAL_GLYPH: Record<number, string> = {
	[-2]: '𝄫',
	[-1]: '♭',
	[0]: '',
	[1]: '♯',
	[2]: '𝄪'
};

export interface SpelledNote {
	letter: Letter;
	accidental: Accidental; // semitone offset from natural
	pc: number; // 0..11
	octave: number; // scientific pitch octave for the spelled pitch
}

export function noteName(n: SpelledNote): string {
	return n.letter + ACCIDENTAL_GLYPH[n.accidental];
}

// The 12 selectable tonics, by pitch class, with both enharmonic spellings.
export interface KeyChoice {
	pc: number;
	sharp: { letter: Letter; accidental: Accidental };
	flat: { letter: Letter; accidental: Accidental };
}

export const KEY_CHOICES: KeyChoice[] = [
	{ pc: 0, sharp: { letter: 'C', accidental: 0 }, flat: { letter: 'C', accidental: 0 } },
	{ pc: 1, sharp: { letter: 'C', accidental: 1 }, flat: { letter: 'D', accidental: -1 } },
	{ pc: 2, sharp: { letter: 'D', accidental: 0 }, flat: { letter: 'D', accidental: 0 } },
	{ pc: 3, sharp: { letter: 'D', accidental: 1 }, flat: { letter: 'E', accidental: -1 } },
	{ pc: 4, sharp: { letter: 'E', accidental: 0 }, flat: { letter: 'E', accidental: 0 } },
	{ pc: 5, sharp: { letter: 'F', accidental: 0 }, flat: { letter: 'F', accidental: 0 } },
	{ pc: 6, sharp: { letter: 'F', accidental: 1 }, flat: { letter: 'G', accidental: -1 } },
	{ pc: 7, sharp: { letter: 'G', accidental: 0 }, flat: { letter: 'G', accidental: 0 } },
	{ pc: 8, sharp: { letter: 'G', accidental: 1 }, flat: { letter: 'A', accidental: -1 } },
	{ pc: 9, sharp: { letter: 'A', accidental: 0 }, flat: { letter: 'A', accidental: 0 } },
	{ pc: 10, sharp: { letter: 'A', accidental: 1 }, flat: { letter: 'B', accidental: -1 } },
	{ pc: 11, sharp: { letter: 'B', accidental: 0 }, flat: { letter: 'B', accidental: 0 } }
];

export function keyChoiceLabel(k: KeyChoice, pref: 'sharp' | 'flat'): string {
	if (k.sharp.accidental === 0) return k.sharp.letter; // natural — same either way
	const s = k.sharp.letter + ACCIDENTAL_GLYPH[k.sharp.accidental];
	const f = k.flat.letter + ACCIDENTAL_GLYPH[k.flat.accidental];
	return pref === 'sharp' ? s : f;
}
