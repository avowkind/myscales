<script lang="ts">
	// T1 — ego-network: the focused scale at the centre, its nearest EMD
	// neighbours around it (radius = distance), each drawn as its T2 glyph.
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import ScaleGlyph from './ScaleGlyph.svelte';
	import {
		neighbours as getNeighbours,
		routeOf,
		displayName,
		signatureLabel,
		type ScaleRecord
	} from '$lib/catalog';

	let { scale }: { scale: ScaleRecord } = $props();
	let k = $state(8);
	let namedOnly = $state(false);
	let hovered = $state<null | { name: string; sig: string; d: number }>(null);

	const W = 640;
	const H = 470;
	const cx = W / 2;
	const cy = H / 2;

	let nb = $derived(getNeighbours(scale, k, namedOnly));
	let nodes = $derived.by(() => {
		if (nb.length === 0) return [];
		const ds = nb.map((n) => n.d);
		const dmin = Math.min(...ds);
		const dmax = Math.max(...ds);
		const innerR = 116;
		const outerR = H / 2 - 48;
		return nb.map((n, i) => {
			const ang = (i / nb.length) * 2 * Math.PI - Math.PI / 2;
			const t = dmax > dmin ? (n.d - dmin) / (dmax - dmin) : 0;
			const r = innerR + t * (outerR - innerR);
			return { n, x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang), close: 1 - t };
		});
	});

	function open(s: ScaleRecord) {
		goto(`${base}/scale/${routeOf(s)}`);
	}
</script>

<div class="ego">
	<div class="ego-controls no-print">
		<label>Reach <input type="range" min="4" max="16" bind:value={k} /> <b>{k}</b></label>
		<label><input type="checkbox" bind:checked={namedOnly} /> named only</label>
		<span class="readout">
			{#if hovered}
				<b>{hovered.name}</b> · {hovered.sig} · d {hovered.d.toFixed(2)}
			{:else}
				hover a neighbour · click to open
			{/if}
		</span>
	</div>

	<svg viewBox="0 0 {W} {H}" class="ego-svg" role="img" aria-label="scale neighbourhood">
		{#each nodes as nd}
			<line x1={cx} y1={cy} x2={nd.x} y2={nd.y} class="edge" stroke-width={1 + nd.close * 3} />
		{/each}

		{#each nodes as nd}
			<g
				class="node"
				role="button"
				tabindex="-1"
				transform="translate({nd.x},{nd.y})"
				onclick={() => open(nd.n.scale)}
				onmouseenter={() =>
					(hovered = {
						name: displayName(nd.n.scale),
						sig: signatureLabel(nd.n.scale),
						d: nd.n.d
					})}
				onmouseleave={() => (hovered = null)}
			>
				<circle r="24" class="halo" />
				<g transform="translate(-21,-21)"><ScaleGlyph steps={nd.n.scale.steps} size={42} /></g>
				<text class="lab" y="36" text-anchor="middle">
					{nd.n.scale.named ? displayName(nd.n.scale) : signatureLabel(nd.n.scale)}
				</text>
			</g>
		{/each}

		<g transform="translate({cx},{cy})">
			<circle r="40" class="center-halo" />
			<g transform="translate(-34,-34)"><ScaleGlyph steps={scale.steps} size={68} /></g>
			<text class="lab center-lab" y="54" text-anchor="middle">{displayName(scale)}</text>
		</g>
	</svg>
</div>

<style>
	.ego-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 0.85rem;
		margin-bottom: 0.4rem;
		flex-wrap: wrap;
	}
	.ego-controls label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.readout {
		color: var(--ink-soft);
	}
	.ego-svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.edge {
		stroke: var(--line-soft);
		opacity: 0.6;
	}
	.node {
		cursor: pointer;
	}
	.halo {
		fill: transparent;
	}
	.node:hover .halo {
		fill: var(--hover);
	}
	.center-halo {
		fill: var(--bg-side);
		stroke: var(--line-soft);
	}
	.lab {
		font-size: 11px;
		fill: var(--ink-soft);
	}
	.center-lab {
		font-size: 13px;
		font-weight: 600;
		fill: var(--ink);
	}
</style>
