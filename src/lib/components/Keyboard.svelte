<script lang="ts">
	import { pitchClasses } from '$lib/theory/id';
	import { degreeInfos, degreeLabel } from '$lib/theory/degrees';
	import { degreeColor } from '$lib/theory/colors';
	import { spellScale, scaleMidis, type Tonic } from '$lib/theory/spelling';
	import { fingering } from '$lib/theory/fingering';
	import { noteName } from '$lib/theory/notes';
	import { playNote } from '$lib/audio';

	let {
		steps,
		tonic,
		root,
		pref,
		roman = false,
		octaves = 2
	}: {
		steps: number[];
		tonic: Tonic;
		root: number;
		pref: 'sharp' | 'flat';
		roman?: boolean;
		octaves?: number;
	} = $props();

	const WK = 36; // white key width
	const WH = 168; // white key height
	const BK = 22; // black key width
	const BH = 104; // black key height
	const BLACK = new Set([1, 3, 6, 8, 10]);

	let hovered = $state<{ name: string; degree: string } | null>(null);
	let mouseDown = $state(false);

	// scale data
	let n = $derived(pitchClasses(steps).length);
	let degs = $derived(degreeInfos(steps));
	let spelled = $derived(spellScale(steps, tonic, pref));
	let fg = $derived(fingering(steps, root, octaves));
	let midis = $derived(scaleMidis(steps, root, 4, octaves)); // length n*octaves + 1

	// per-MIDI lookup: degree colour, finger numbers, name + degree label
	let info = $derived.by(() => {
		const m = new Map<
			number,
			{ color: string; rh: number; lh: number; name: string; degree: string }
		>();
		midis.forEach((midi, i) => {
			const di = degs[i % n];
			if (!m.has(midi)) {
				m.set(midi, {
					color: degreeColor(di.num, di.alt),
					rh: fg.rh[i],
					lh: fg.lh[i],
					name: noteName(spelled[i % n]),
					degree: degreeLabel(di, roman)
				});
			}
		});
		return m;
	});

	// board spans 3 octaves from the C at/below the root, enough for any 2-octave run
	let startMidi = $derived(Math.floor(((4 + 1) * 12 + root) / 12) * 12);
	let octavesShown = $derived(octaves + 1);

	let keys = $derived.by(() => {
		const whites: { midi: number; x: number }[] = [];
		const blacks: { midi: number; x: number }[] = [];
		let wx = 0;
		for (let s = 0; s <= octavesShown * 12; s++) {
			const midi = startMidi + s;
			if (BLACK.has(midi % 12)) {
				blacks.push({ midi, x: wx - BK / 2 });
			} else {
				whites.push({ midi, x: wx });
				wx += WK;
			}
		}
		return { whites, blacks, width: wx };
	});

	function press(midi: number) {
		playNote(midi);
	}
</script>

<div class="kb-wrap">
	<svg
		viewBox="0 0 {keys.width} {WH + 2}"
		class="keyboard"
		role="img"
		aria-label="keyboard"
		onpointerup={() => (mouseDown = false)}
		onpointerleave={() => (mouseDown = false)}
	>
		<!-- white keys -->
		{#each keys.whites as k}
			{@const hit = info.get(k.midi)}
			<g
				role="button"
				tabindex="-1"
				onpointerdown={() => {
					mouseDown = true;
					press(k.midi);
				}}
				onpointerenter={() => {
					if (mouseDown && hit) press(k.midi);
					if (hit) hovered = { name: hit.name, degree: hit.degree };
				}}
			>
				<rect
					x={k.x}
					y="0"
					width={WK}
					height={WH}
					rx="3"
					class="white"
					fill={hit ? hit.color : 'var(--key-white)'}
				/>
				{#if hit}
					<text x={k.x + WK / 2} y="18" class="finger" class:thumb={hit.rh === 1}>{hit.rh}</text>
					<text x={k.x + WK / 2} y={WH - 24} class="finger lh" class:thumb={hit.lh === 1}>
						{hit.lh}
					</text>
					<text x={k.x + WK / 2} y={WH - 8} class="keyname">{hit.name}</text>
				{/if}
			</g>
		{/each}

		<!-- black keys -->
		{#each keys.blacks as k}
			{@const hit = info.get(k.midi)}
			<g
				role="button"
				tabindex="-1"
				onpointerdown={() => {
					mouseDown = true;
					press(k.midi);
				}}
				onpointerenter={() => {
					if (mouseDown && hit) press(k.midi);
					if (hit) hovered = { name: hit.name, degree: hit.degree };
				}}
			>
				<rect
					x={k.x}
					y="0"
					width={BK}
					height={BH}
					rx="3"
					class="black"
					fill={hit ? hit.color : 'var(--key-black)'}
				/>
				{#if hit}
					<text x={k.x + BK / 2} y="16" class="finger on-black" class:thumb={hit.rh === 1}>
						{hit.rh}
					</text>
					<text x={k.x + BK / 2} y={BH - 18} class="finger on-black lh" class:thumb={hit.lh === 1}>
						{hit.lh}
					</text>
				{/if}
			</g>
		{/each}
	</svg>

	<div class="hint" aria-live="polite">
		{#if hovered}
			<span class="hint-note">{hovered.name}</span> = <span class="hint-deg">{hovered.degree}</span>
		{:else}
			<span class="muted">hover a key · click to hear · drag to play the run</span>
		{/if}
	</div>
</div>

<style>
	.kb-wrap {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}
	.keyboard {
		flex: 1;
		height: auto;
		max-height: 200px;
		touch-action: none;
		user-select: none;
	}
	.white {
		stroke: var(--line-soft);
		stroke-width: 1;
	}
	.black {
		stroke: #111;
		stroke-width: 1;
	}
	.finger {
		text-anchor: middle;
		font-size: 14px;
		font-weight: 500;
		fill: #fff;
	}
	.finger.thumb {
		font-weight: 800;
		font-size: 16px;
		text-decoration: underline;
	}
	.finger.on-black {
		fill: #fff;
	}
	.keyname {
		text-anchor: middle;
		font-size: 12px;
		font-weight: 600;
		fill: #fff;
	}
	.hint {
		flex: 0 0 8rem;
		font-size: 1.1rem;
		padding-top: 0.5rem;
	}
	.hint-note {
		font-weight: 700;
		color: var(--accent);
	}
	.muted {
		color: var(--ink-soft);
		font-size: 0.8rem;
	}
</style>
