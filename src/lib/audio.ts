// Audio engine (DESIGN.md §5.4): sampled piano by default, optional Web MIDI out.
import { SplendidGrandPiano } from 'smplr';
import { prefs } from './state.svelte';

let ctx: AudioContext | null = null;
let piano: SplendidGrandPiano | null = null;
let pianoReady: Promise<unknown> | null = null;

let midiOut: any = null;
let midiNames: string[] = [];

function getCtx(): AudioContext {
	ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
	return ctx;
}

async function ensurePiano(): Promise<SplendidGrandPiano> {
	if (!piano) {
		piano = new SplendidGrandPiano(getCtx());
		pianoReady = piano.load;
	}
	await pianoReady;
	return piano;
}

export async function enableMidi(): Promise<string[]> {
	const access = await (navigator as any).requestMIDIAccess();
	const outs = [...access.outputs.values()] as any[];
	midiOut = outs[0] ?? null;
	midiNames = outs.map((o) => o.name ?? 'output');
	return midiNames;
}

function sendMidi(midi: number, time: number, duration: number) {
	if (!midiOut) return;
	const on = Math.max(0, time - performance.now() / 1000) * 1000;
	const off = on + duration * 1000;
	midiOut.send([0x90, midi, 100], performance.now() + on);
	midiOut.send([0x80, midi, 0], performance.now() + off);
}

/** Play one note now. */
export async function playNote(midi: number, duration = 0.6) {
	if (prefs.audio === 'midi' && midiOut) {
		sendMidi(midi, getCtx().currentTime, duration);
		return;
	}
	const p = await ensurePiano();
	p.start({ note: midi, duration });
}

/** Play a sequence of MIDI notes in time. */
export async function playSequence(midis: number[], step = 0.34) {
	if (prefs.audio === 'midi' && midiOut) {
		const t0 = getCtx().currentTime + 0.05;
		midis.forEach((m, i) => sendMidi(m, t0 + i * step, step * 0.95));
		return;
	}
	const p = await ensurePiano();
	const t0 = getCtx().currentTime + 0.06;
	midis.forEach((m, i) => p.start({ note: m, time: t0 + i * step, duration: step * 0.95 }));
}

/** Ascending then descending. */
export function playScale(ascMidis: number[], step = 0.32) {
	const down = [...ascMidis].reverse().slice(1);
	playSequence([...ascMidis, ...down], step);
}
