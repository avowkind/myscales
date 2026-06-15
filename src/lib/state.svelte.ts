// Global, navigation-persistent preferences (DESIGN.md §9 state).
import type { Pref } from './theory/spelling';

export const prefs = $state({
	tonicPc: 0, // selected key, by pitch class
	pref: 'flat' as Pref, // enharmonic spelling toggle
	roman: false, // degree labels: numbers vs roman numerals
	octaves: 2, // keyboard span
	audio: 'sample' as 'sample' | 'midi'
});
