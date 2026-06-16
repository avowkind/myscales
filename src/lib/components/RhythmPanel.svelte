<script lang="ts">
	import { onDestroy } from 'svelte';
	import { onsets, isDeep, isMaximallyEven } from '$lib/theory/rhythm';
	import { startRhythm, stopRhythm } from '$lib/audio';

	let { steps }: { steps: number[] } = $props();

	let reading = $state<'chromatic' | 'meter'>('chromatic');
	let tempo = $state(320); // pulses per minute
	let playing = $state(false);

	let pcs = $derived(onsets(steps));
	let n = $derived(pcs.length);
	let deep = $derived(isDeep(steps));
	let maxEven = $derived(isMaximallyEven(steps));

	// pulses in the cycle, and which are onsets, per reading
	let cycle = $derived.by(() => {
		if (reading === 'chromatic') return { pulses: 12, onset: new Set(pcs) };
		return { pulses: n, onset: new Set(Array.from({ length: n }, (_, i) => i)) };
	});

	function apply() {
		startRhythm(cycle.onset, cycle.pulses, 60 / tempo);
	}
	function toggle() {
		if (playing) {
			stopRhythm();
			playing = false;
		} else {
			apply();
			playing = true;
		}
	}

	// restart the loop live when the pattern or tempo changes mid-play
	$effect(() => {
		void [reading, tempo, steps];
		if (playing) apply();
	});

	onDestroy(stopRhythm);
</script>

<div class="rhythm">
	<div class="controls no-print">
		<button class="play" class:on={playing} onclick={toggle}>{playing ? '◼ Stop' : '▶ Loop'}</button>
		<div class="toggle">
			<button class:on={reading === 'chromatic'} onclick={() => (reading = 'chromatic')}>
				12-pulse
			</button>
			<button class:on={reading === 'meter'} onclick={() => (reading = 'meter')}>{n}-pulse</button>
		</div>
		<label class="tempo">Tempo <input type="range" min="160" max="600" step="10" bind:value={tempo} /></label>
		{#if deep}<span class="badge deep" title="every interval class occurs a distinct number of times">deep</span>{/if}
		{#if maxEven}<span class="badge even" title="a rotation of the Euclidean rhythm — maximally even">Euclidean</span>{/if}
	</div>

	<div class="boxes" style="--cells:{cycle.pulses}">
		{#each Array(cycle.pulses) as _, i}
			{@const on = cycle.onset.has(i)}
			<div class="cell" class:on class:accent={on && i === 0} title={`pulse ${i}`}></div>
		{/each}
	</div>
	<div class="notation">[
		{#each Array(cycle.pulses) as _, i}<span class:on={cycle.onset.has(i)}
				>{cycle.onset.has(i) ? 'x' : '.'}</span
			>{/each}
		]</div>
</div>

<style>
	.controls {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex-wrap: wrap;
		margin-bottom: 0.6rem;
	}
	.play {
		border: 1px solid var(--accent);
		background: var(--accent);
		color: #fff;
		border-radius: 6px;
		padding: 0.3rem 0.7rem;
		cursor: pointer;
	}
	.play.on {
		background: #c0392b;
		border-color: #c0392b;
	}
	.toggle {
		display: inline-flex;
		border: 1px solid var(--line-soft);
		border-radius: 6px;
		overflow: hidden;
	}
	.toggle button {
		border: 0;
		background: var(--bg);
		padding: 0.3rem 0.55rem;
		cursor: pointer;
	}
	.toggle button.on {
		background: var(--accent);
		color: #fff;
	}
	.tempo {
		font-size: 0.8rem;
		color: var(--ink-soft);
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.badge {
		font-size: 0.72rem;
		font-weight: 700;
		padding: 0.12rem 0.45rem;
		border-radius: 4px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.badge.deep {
		background: #e0a10622;
		color: #8a6406;
		border: 1px solid #e0a10688;
	}
	.badge.even {
		background: #2e9e6b22;
		color: #1e6e49;
		border: 1px solid #2e9e6b88;
	}
	.boxes {
		display: grid;
		grid-template-columns: repeat(var(--cells), 1fr);
		gap: 5px;
		max-width: 520px;
	}
	.cell {
		aspect-ratio: 1;
		border-radius: 4px;
		background: var(--bg);
		border: 1px solid var(--line-soft);
	}
	.cell.on {
		background: var(--ink);
		border-color: var(--ink);
	}
	.cell.accent {
		background: #e0a106;
		border-color: #e0a106;
	}
	.notation {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 1.1rem;
		letter-spacing: 0.18em;
		color: var(--ink-soft);
		margin-top: 0.5rem;
	}
	.notation .on {
		color: var(--ink);
		font-weight: 700;
	}
</style>
