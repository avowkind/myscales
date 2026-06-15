<script lang="ts">
	import { degreeInfos, degreeLabel } from '$lib/theory/degrees';
	import { gapColor } from '$lib/theory/colors';

	let { steps, roman = false }: { steps: number[]; roman?: boolean } = $props();

	const W = 1000;
	const H = 150;
	const padX = 40;
	const axisY = 95;

	// node positions in semitones 0..12 (includes the returning octave)
	let positions = $derived.by(() => {
		const pos = [0];
		let acc = 0;
		for (const s of steps) {
			acc += s;
			pos.push(acc);
		}
		return pos; // length steps.length + 1, last = 12
	});

	let degs = $derived(degreeInfos(steps));
	let xFor = $derived((semi: number) => padX + (semi / 12) * (W - 2 * padX));
</script>

<svg viewBox="0 0 {W} {H}" class="interval-line" role="img" aria-label="interval shape">
	<!-- faint 12-tone chromatic grid -->
	{#each Array(13) as _, i}
		<line x1={xFor(i)} y1={axisY - 10} x2={xFor(i)} y2={axisY + 10} class="tick" />
	{/each}
	<line x1={xFor(0)} y1={axisY} x2={xFor(12)} y2={axisY} class="axis" />

	<!-- coloured gap segments with the semitone count (the hero) -->
	{#each steps as gap, i}
		{@const x1 = xFor(positions[i])}
		{@const x2 = xFor(positions[i + 1])}
		<line {x1} y1={axisY} {x2} y2={axisY} stroke={gapColor(gap)} stroke-width="7" />
		<rect
			x={(x1 + x2) / 2 - 15}
			y={axisY - 46}
			width="30"
			height="28"
			rx="5"
			fill={gapColor(gap)}
		/>
		<text x={(x1 + x2) / 2} y={axisY - 26} class="gap-num">{gap}</text>
	{/each}

	<!-- nodes + degree labels -->
	{#each positions as p, i}
		{@const isRoot = i === 0 || i === positions.length - 1}
		<circle cx={xFor(p)} cy={axisY} r={isRoot ? 9 : 7} class:root={isRoot} class="node" />
		<text x={xFor(p)} y={axisY + 34} class="degree">
			{i === positions.length - 1 ? '8' : degreeLabel(degs[i], roman)}
		</text>
		<text x={xFor(p)} y={axisY + 50} class="semi">{p}</text>
	{/each}
</svg>

<style>
	.interval-line {
		width: 100%;
		height: auto;
		display: block;
	}
	.tick {
		stroke: var(--line-faint);
		stroke-width: 1;
	}
	.axis {
		stroke: var(--line-soft);
		stroke-width: 2;
	}
	.node {
		fill: var(--ink);
		stroke: var(--bg);
		stroke-width: 2;
	}
	.node.root {
		fill: var(--accent);
	}
	.gap-num {
		fill: #fff;
		font-weight: 700;
		font-size: 19px;
		text-anchor: middle;
	}
	.degree {
		fill: var(--ink);
		font-weight: 600;
		font-size: 17px;
		text-anchor: middle;
	}
	.semi {
		fill: var(--ink-soft);
		font-size: 11px;
		text-anchor: middle;
	}
</style>
