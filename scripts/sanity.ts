import { idToSteps } from '../src/lib/theory/id';
import { degreeLabels } from '../src/lib/theory/degrees';
import { spellScale, scaleMidis, keySignature, tonicPc } from '../src/lib/theory/spelling';
import { fingering } from '../src/lib/theory/fingering';
import { noteName, KEY_CHOICES } from '../src/lib/theory/notes';
import { getScale, ALL_SCALES, generatedScales } from '../src/lib/catalog';

function show(idOrSlug: string, keyLetter: any, acc: any, pref: any) {
	const sc = getScale(idOrSlug)!;
	const tonic = { letter: keyLetter, accidental: acc };
	const notes = spellScale(sc.steps, tonic, pref);
	const root = tonicPc(tonic);
	const fg = fingering(sc.steps, root);
	console.log(`\n## ${sc.name ?? sc.id}  in ${noteName({ ...tonic, pc: 0, octave: 4 })} (${pref})`);
	console.log('  id        :', sc.id, ' pc#', sc.pcNumber);
	console.log('  degrees   :', degreeLabels(sc.steps).join(' '));
	console.log('  notes     :', notes.map((n) => noteName(n) + n.octave).join(' '));
	console.log('  gaps      :', sc.steps.join('-'));
	console.log('  keySig    :', keySignature(sc.steps, root, pref));
	console.log('  RH        :', fg.rh.join(' '), ' thumbs', fg.rhThumbs.join(','));
	console.log('  LH        :', fg.lh.join(' '), ' thumbs', fg.lhThumbs.join(','));
	console.log('  midis     :', scaleMidis(sc.steps, root).join(' '));
}

show('major', 'C', 0, 'sharp');
show('major', 'E', -1, 'flat'); // Eb major — RH should start off-thumb
show('major', 'B', 0, 'sharp'); // B major — thumbs avoid black keys
show('aeolian', 'A', 0, 'sharp');
show('phrygian-dominant', 'C', 0, 'flat');
show('minor-pentatonic', 'A', 0, 'sharp');
show('whole-tone', 'C', 0, 'sharp');

console.log('\nTotal scales:', ALL_SCALES.length, '| generated:', generatedScales().length);
console.log('Sample generated ids:', generatedScales().slice(0, 5).map((s) => s.id).join('  '));
