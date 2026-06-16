<script lang="ts">
	// T1 — ego-network: the focused scale at the centre, expanded outward by
	// depth (BFS over nearest-EMD neighbours). Deeper = neighbours-of-neighbours;
	// icon sizes shrink as the network grows.
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import ScaleGlyph from './ScaleGlyph.svelte';
	import { circularEMD } from '$lib/theory/emd';
	import {
		neighbours as getNeighbours,
		routeOf,
		displayName,
		signatureLabel,
		type ScaleRecord
	} from '$lib/catalog';

	let { scale }: { scale: ScaleRecord } = $props();
	let depth = $state(2);
	let namedOnly = $state(true);
	let hovered = $state<null | { name: string; sig: string; d: number }>(null);

	const W = 660;
	const H = 540;
	const cx = W / 2;
	const cy = H / 2;
	const BRANCH = 5; // neighbours expanded per node
	const MAX_NODES = 64; // keep it readable / fast

	interface GNode {
		scale: ScaleRecord;
		depth: number;
		parent: string | null;
		d: number;
	}

	// breadth-first expansion from the focal scale
	let graph = $derived.by(() => {
		const map = new Map<string, GNode>();
		map.set(scale.id, { scale, depth: 0, parent: null, d: 0 });
		let frontier: ScaleRecord[] = [scale];
		for (let lvl = 1; lvl <= depth && map.size < MAX_NODES; lvl++) {
			const next: ScaleRecord[] = [];
			for (const node of frontier) {
				for (const { scale: s } of getNeighbours(node, BRANCH, namedOnly)) {
					if (!map.has(s.id) && map.size < MAX_NODES) {
						map.set(s.id, {
							scale: s,
							depth: lvl,
							parent: node.id,
							d: circularEMD(scale.steps, s.steps)
						});
						next.push(s);
					}
				}
			}
			frontier = next;
			if (frontier.length === 0) break;
		}
		return [...map.values()];
	});

	let layout = $derived.by(() => {
		const nodes = graph;
		const maxD = Math.max(1, ...nodes.map((n) => n.depth));
		const outerR = Math.min(W, H) / 2 - 50;
		const byDepth = new Map<number, GNode[]>();
		for (const n of nodes) {
			if (n.depth === 0) continue;
			const arr = byDepth.get(n.depth) ?? [];
			arr.push(n);
			byDepth.set(n.depth, arr);
		}
		const pos = new Map<string, [number, number]>([[scale.id, [cx, cy]]]);
		let minArc = Infinity;
		for (const [d, arr] of byDepth) {
			const R = (d / maxD) * outerR;
			arr.forEach((n, i) => {
				const ang = ((i + 0.5) / arr.length) * 2 * Math.PI + d * 0.7;
				pos.set(n.scale.id, [cx + R * Math.cos(ang), cy + R * Math.sin(ang)]);
			});
			if (arr.length > 1) minArc = Math.min(minArc, (2 * Math.PI * R) / arr.length);
		}
		const radialGap = outerR / maxD;
		let size = Math.min(minArc * 0.78, radialGap * 0.82);
		if (!isFinite(size)) size = 40;
		size = Math.max(14, Math.min(40, size));
		const focalSize = Math.max(40, Math.min(64, size * 1.5));
		return { nodes, pos, size, focalSize };
	});

	function open(s: ScaleRecord) {
		goto(`${base}/scale/${routeOf(s)}`);
	}
</script>

<div class="ego">
	<div class="ego-controls no-print">
		<label>Depth <input type="range" min="1" max="4" bind:value={depth} /> <b>{depth}</b></label>
		<label><input type="checkbox" bind:checked={namedOnly} /> named only</label>
		<span class="count">{layout.nodes.length - 1} scales</span>
		<span class="readout">
			{#if hovered}
				<b>{hovered.name}</b> · {hovered.sig} · d {hovered.d.toFixed(2)}
			{:else}
				hover a scale · click to open
			{/if}
		</span>
	</div>

	<svg viewBox="0 0 {W} {H}" class="ego-svg" role="img" aria-label="scale neighbourhood">
		{#each layout.nodes as n (n.scale.id)}
			{#if n.parent}
				{@const a = layout.pos.get(n.scale.id)}
				{@const p = layout.pos.get(n.parent)}
				{#if a && p}<line x1={p[0]} y1={p[1]} x2={a[0]} y2={a[1]} class="edge" />{/if}
			{/if}
		{/each}

		{#each layout.nodes as n (n.scale.id)}
			{#if n.depth > 0}
				{@const xy = layout.pos.get(n.scale.id)}
				{#if xy}
					<g
						class="node"
						role="button"
						tabindex="-1"
						transform="translate({xy[0]},{xy[1]})"
						onclick={() => open(n.scale)}
						onmouseenter={() =>
							(hovered = {
								name: displayName(n.scale),
								sig: signatureLabel(n.scale),
								d: n.d
							})}
						onmouseleave={() => (hovered = null)}
					>
						<circle r={layout.size / 2 + 4} class="halo" />
						<g transform="translate({-layout.size / 2},{-layout.size / 2})">
							<ScaleGlyph steps={n.scale.steps} size={layout.size} root={layout.size >= 20} />
						</g>
						{#if layout.size >= 24}
							<text class="lab" y={layout.size / 2 + 12} text-anchor="middle">
								{n.scale.named ? displayName(n.scale) : signatureLabel(n.scale)}
							</text>
						{/if}
					</g>
				{/if}
			{/if}
		{/each}

		<g transform="translate({cx},{cy})">
			<circle r={layout.focalSize / 2 + 7} class="center-halo" />
			<g transform="translate({-layout.focalSize / 2},{-layout.focalSize / 2})">
				<ScaleGlyph steps={scale.steps} size={layout.focalSize} />
			</g>
			<text class="lab center-lab" y={layout.focalSize / 2 + 16} text-anchor="middle">
				{displayName(scale)}
			</text>
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
	.count {
		color: var(--ink-soft);
		font-variant-numeric: tabular-nums;
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
		opacity: 0.55;
		stroke-width: 1.2;
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
