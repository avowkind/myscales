<script lang="ts">
	import { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, StaveConnector } from 'vexflow';
	import { spellScale, keySignature, type Tonic } from '$lib/theory/spelling';
	import type { SpelledNote } from '$lib/theory/notes';

	let {
		steps,
		tonic,
		root,
		pref
	}: { steps: number[]; tonic: Tonic; root: number; pref: 'sharp' | 'flat' } = $props();

	let el: HTMLDivElement;

	const ACC: Record<number, string> = { [-2]: 'bb', [-1]: 'b', [0]: '', [1]: '#', [2]: '##' };

	function keyStr(sn: SpelledNote, octaveDelta = 0): string {
		return sn.letter.toLowerCase() + ACC[sn.accidental] + '/' + (sn.octave + octaveDelta);
	}

	// ascending (root..octave) then descending back to root
	function sequence(asc: SpelledNote[]): SpelledNote[] {
		const top: SpelledNote = { ...asc[0], octave: asc[0].octave + 1 };
		const up = [...asc, top];
		const down = up.slice().reverse().slice(1);
		return [...up, ...down];
	}

	function render() {
		if (!el) return;
		el.innerHTML = '';
		try {
			const asc = spellScale(steps, tonic, pref, 4);
			const seq = sequence(asc);
			const key = keySignature(steps, root, pref) ?? 'C';
			const width = Math.max(el.clientWidth || 760, 520);
			const height = 230;

			const renderer = new Renderer(el, Renderer.Backends.SVG);
			renderer.resize(width, height);
			const ctx = renderer.getContext();
			const sw = width - 16;

			const treble = new Stave(8, 8, sw).addClef('treble').addKeySignature(key);
			const bass = new Stave(8, 118, sw).addClef('bass').addKeySignature(key);
			treble.setContext(ctx).draw();
			bass.setContext(ctx).draw();
			try {
				new StaveConnector(treble, bass).setType('brace').setContext(ctx).draw();
				new StaveConnector(treble, bass).setType('singleLeft').setContext(ctx).draw();
			} catch {
				/* connector styling is cosmetic */
			}

			const tNotes = seq.map(
				(sn) => new StaveNote({ clef: 'treble', keys: [keyStr(sn)], duration: '8' })
			);
			const bNotes = seq.map(
				(sn) => new StaveNote({ clef: 'bass', keys: [keyStr(sn, -2)], duration: '8' })
			);

			const tv = new Voice({ num_beats: seq.length, beat_value: 8 })
				.setStrict(false)
				.addTickables(tNotes);
			const bv = new Voice({ num_beats: seq.length, beat_value: 8 })
				.setStrict(false)
				.addTickables(bNotes);

			Accidental.applyAccidentals([tv], key);
			Accidental.applyAccidentals([bv], key);

			new Formatter().joinVoices([tv]).format([tv], sw - 90);
			new Formatter().joinVoices([bv]).format([bv], sw - 90);
			tv.draw(ctx, treble);
			bv.draw(ctx, bass);
		} catch (e) {
			el.innerHTML = `<p class="stave-err">notation unavailable: ${(e as Error).message}</p>`;
		}
	}

	$effect(() => {
		// re-render when inputs change
		void [steps, tonic, root, pref];
		render();
	});
</script>

<div class="stave" bind:this={el}></div>

<style>
	.stave {
		width: 100%;
		overflow-x: auto;
	}
	.stave :global(svg) {
		max-width: 100%;
		height: auto;
	}
	:global(.stave-err) {
		color: #b00;
		font-size: 0.85rem;
	}
</style>
