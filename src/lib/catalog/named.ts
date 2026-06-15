// Hand-authored named scales. Only `steps` + metadata are supplied; id and
// pcNumber are derived. DESIGN.md §2.1.
import { stepsToId, pcNumber } from '../theory/id';
import type { ScaleRecord, Family, ParentRelation } from './types';

interface Seed {
	slug: string;
	name: string;
	steps: number[];
	family: Family;
	aliases?: string[];
	description?: string;
	mood?: string;
	colour?: string;
	examples?: string[];
	parent?: ParentRelation;
	relations?: string[];
}

const SEEDS: Seed[] = [
	{
		slug: 'major',
		name: 'Major (Ionian)',
		steps: [2, 2, 1, 2, 2, 2, 1],
		family: 'major',
		aliases: ['Ionian'],
		description: 'The reference scale; all degrees natural.',
		mood: 'Bright, resolved, stable.',
		colour: 'clear daylight yellow',
		examples: ['Twinkle, Twinkle', 'most pop & folk'],
		relations: ['aeolian', 'mixolydian', 'lydian']
	},
	{
		slug: 'dorian',
		name: 'Dorian',
		steps: [2, 1, 2, 2, 2, 1, 2],
		family: 'mode',
		mood: 'Minor but hopeful; the natural 6 lifts it.',
		colour: 'cool teal',
		examples: ['Scarborough Fair', 'So What — Miles Davis'],
		parent: { scaleId: 'major', degree: 2, text: '2nd mode of the major scale' },
		relations: ['major', 'aeolian', 'phrygian']
	},
	{
		slug: 'phrygian',
		name: 'Phrygian',
		steps: [1, 2, 2, 2, 1, 2, 2],
		family: 'mode',
		mood: 'Dark, Spanish; the ♭2 bites.',
		colour: 'deep indigo',
		examples: ['flamenco', 'metal riffing'],
		parent: { scaleId: 'major', degree: 3, text: '3rd mode of the major scale' },
		relations: ['major', 'aeolian', 'phrygian-dominant']
	},
	{
		slug: 'lydian',
		name: 'Lydian',
		steps: [2, 2, 2, 1, 2, 2, 1],
		family: 'mode',
		mood: 'Floating, dreamy; the ♯4 opens it up.',
		colour: 'pale sky blue',
		examples: ['The Simpsons theme', 'film wonder cues'],
		parent: { scaleId: 'major', degree: 4, text: '4th mode of the major scale' },
		relations: ['major', 'mixolydian']
	},
	{
		slug: 'mixolydian',
		name: 'Mixolydian',
		steps: [2, 2, 1, 2, 2, 1, 2],
		family: 'mode',
		mood: 'Major with a bluesy ♭7; dominant.',
		colour: 'warm ochre',
		examples: ['Sweet Home Alabama', 'Norwegian Wood'],
		parent: { scaleId: 'major', degree: 5, text: '5th mode of the major scale' },
		relations: ['major', 'dorian']
	},
	{
		slug: 'aeolian',
		name: 'Natural Minor (Aeolian)',
		steps: [2, 1, 2, 2, 1, 2, 2],
		family: 'minor',
		aliases: ['Aeolian', 'Natural minor'],
		mood: 'Sombre, classic minor.',
		colour: 'slate grey-blue',
		examples: ['Stairway descent', 'countless ballads'],
		parent: { scaleId: 'major', degree: 6, text: '6th mode of the major scale (relative minor)' },
		relations: ['harmonic-minor', 'melodic-minor', 'dorian']
	},
	{
		slug: 'locrian',
		name: 'Locrian',
		steps: [1, 2, 2, 1, 2, 2, 2],
		family: 'mode',
		mood: 'Unstable; diminished tonic, ♭2 and ♭5.',
		colour: 'murky violet',
		examples: ['rare — tension passages'],
		parent: { scaleId: 'major', degree: 7, text: '7th mode of the major scale' },
		relations: ['major', 'phrygian']
	},
	{
		slug: 'harmonic-minor',
		name: 'Harmonic Minor',
		steps: [2, 1, 2, 2, 1, 3, 1],
		family: 'minor',
		mood: 'Minor with a raised 7; exotic leading tone.',
		colour: 'burgundy',
		examples: ['classical cadences', 'neoclassical metal'],
		relations: ['aeolian', 'phrygian-dominant', 'melodic-minor']
	},
	{
		slug: 'melodic-minor',
		name: 'Melodic Minor (ascending)',
		steps: [2, 1, 2, 2, 2, 2, 1],
		family: 'minor',
		aliases: ['Jazz minor'],
		mood: 'Minor third over a major-ish top.',
		colour: 'muted rose',
		examples: ['jazz improvisation'],
		relations: ['aeolian', 'harmonic-minor', 'major']
	},
	{
		slug: 'major-pentatonic',
		name: 'Major Pentatonic',
		steps: [2, 2, 3, 2, 3],
		family: 'pentatonic',
		mood: 'Open, singable, no semitones.',
		colour: 'spring green',
		examples: ['Amazing Grace', 'My Girl'],
		relations: ['minor-pentatonic', 'major']
	},
	{
		slug: 'minor-pentatonic',
		name: 'Minor Pentatonic',
		steps: [3, 2, 2, 3, 2],
		family: 'pentatonic',
		mood: 'The rock/blues backbone.',
		colour: 'denim blue',
		examples: ['blues & rock solos'],
		relations: ['major-pentatonic', 'blues-minor']
	},
	{
		slug: 'blues-minor',
		name: 'Minor Blues',
		steps: [3, 2, 1, 1, 3, 2],
		family: 'blues',
		description: 'Minor pentatonic plus the ♭5 "blue note".',
		mood: 'Gritty, vocal, expressive.',
		colour: 'smoky indigo',
		examples: ['12-bar blues'],
		relations: ['minor-pentatonic']
	},
	{
		slug: 'whole-tone',
		name: 'Whole Tone',
		steps: [2, 2, 2, 2, 2, 2],
		family: 'symmetric',
		mood: 'Weightless, dreamlike, no pull.',
		colour: 'frosted lilac',
		examples: ['Debussy', 'dream sequences'],
		relations: ['octatonic-hw']
	},
	{
		slug: 'octatonic-hw',
		name: 'Octatonic (Half–Whole)',
		steps: [1, 2, 1, 2, 1, 2, 1, 2],
		family: 'symmetric',
		aliases: ['Diminished (dominant)'],
		mood: 'Tense, symmetrical, jazzy.',
		colour: 'electric teal',
		examples: ['dominant-chord jazz lines'],
		relations: ['octatonic-wh', 'whole-tone']
	},
	{
		slug: 'octatonic-wh',
		name: 'Octatonic (Whole–Half)',
		steps: [2, 1, 2, 1, 2, 1, 2, 1],
		family: 'symmetric',
		aliases: ['Diminished'],
		mood: 'Tense, symmetrical, eerie.',
		colour: 'deep cyan',
		examples: ['diminished-chord passages'],
		relations: ['octatonic-hw']
	},
	{
		slug: 'phrygian-dominant',
		name: 'Phrygian Dominant',
		steps: [1, 3, 1, 2, 1, 2, 2],
		family: 'exotic',
		aliases: ['Spanish Phrygian', 'Freygish', 'Hijaz'],
		description: 'Major third over a Phrygian ♭2/♭6 — the harmonic-minor dominant.',
		mood: 'Tense, exotic, Spanish / Middle-Eastern.',
		colour: 'deep amber, smoky red',
		examples: ["Caravan (the 'Egyptian' sound)", 'Misirlou', 'Hava Nagila'],
		parent: { scaleId: 'harmonic-minor', degree: 5, text: '5th mode of the harmonic minor scale' },
		relations: ['harmonic-minor', 'phrygian', 'double-harmonic']
	},
	{
		slug: 'double-harmonic',
		name: 'Double Harmonic Major',
		steps: [1, 3, 1, 2, 1, 3, 1],
		family: 'exotic',
		aliases: ['Byzantine', 'Arabic', 'Gypsy major'],
		mood: 'Two augmented steps; intensely exotic.',
		colour: 'gilded crimson',
		examples: ['Misirlou (head)', 'Middle-Eastern themes'],
		relations: ['phrygian-dominant', 'hungarian-minor']
	},
	{
		slug: 'hungarian-minor',
		name: 'Hungarian Minor',
		steps: [2, 1, 3, 1, 1, 3, 1],
		family: 'exotic',
		aliases: ['Gypsy minor'],
		mood: 'Harmonic minor with a raised 4; dramatic.',
		colour: 'dark wine',
		examples: ['Hungarian/Romani folk'],
		relations: ['harmonic-minor', 'double-harmonic']
	}
];

export const NAMED_SCALES: ScaleRecord[] = SEEDS.map((s) => ({
	id: stepsToId(s.steps),
	steps: s.steps,
	pcNumber: pcNumber(s.steps),
	family: s.family,
	named: true,
	slug: s.slug,
	name: s.name,
	aliases: s.aliases,
	description: s.description,
	mood: s.mood,
	colour: s.colour,
	examples: s.examples,
	parent: s.parent,
	relations: s.relations
}));
