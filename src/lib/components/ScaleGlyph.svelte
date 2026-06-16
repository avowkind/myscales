<script lang="ts">
	// T2 — circular Earth-Mover scale glyph (tickets/SCALE-GLYPH.md).
	// A donut on the pitch-class circle: root at top, each gap arc coloured AND
	// widened by its semitone size; small breaks mark the note positions.
	import { pitchClasses } from '$lib/theory/id';
	import { gapColor } from '$lib/theory/colors';

	let {
		steps,
		size = 28,
		root = true,
		playhead = null
	}: { steps: number[]; size?: number; root?: boolean; playhead?: number | null } = $props();

	let geom = $derived.by(() => {
		const c = size / 2;
		const R = size * 0.32;
		const pt = (radius: number, pc: number) => {
			const a = ((-90 + (pc / 12) * 360) * Math.PI) / 180;
			return [c + radius * Math.cos(a), c + radius * Math.sin(a)] as const;
		};
		const tk = (gap: number) => R * (0.095 + gap * 0.1);
		const np: number[] = [];
		let acc = 0;
		for (const s of steps) {
			np.push(acc);
			acc += s;
		}
		const eps = 0.2;
		const arcs = np.map((a, i) => {
			const b = i + 1 < np.length ? np[i + 1] : 12;
			const gap = b - a;
			const [x1, y1] = pt(R, a + eps);
			const [x2, y2] = pt(R, b - eps);
			const large = gap > 6 ? 1 : 0;
			return { d: `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`, color: gapColor(gap), w: tk(gap) };
		});
		const rootDot = pt(R + tk(4) / 2 + size * 0.05, 0);
		const head = playhead == null ? null : pt(R, playhead);
		return { c, R, arcs, rootDot, head };
	});
</script>

<svg viewBox="0 0 {size} {size}" width={size} height={size} class="glyph" aria-hidden="true">
	{#each geom.arcs as arc}
		<path d={arc.d} fill="none" stroke={arc.color} stroke-width={arc.w} stroke-linecap="butt" />
	{/each}
	{#if geom.head}
		<circle cx={geom.head[0]} cy={geom.head[1]} r={Math.max(1.6, size * 0.06)} class="playhead" />
	{/if}
	{#if root}
		<circle cx={geom.rootDot[0]} cy={geom.rootDot[1]} r={Math.max(1.3, size * 0.05)} class="rootdot" />
	{/if}
</svg>

<style>
	.glyph {
		display: block;
		overflow: visible;
	}
	.rootdot {
		fill: var(--ink);
	}
	.playhead {
		fill: #fff;
		stroke: var(--ink);
		stroke-width: 1.2;
	}
</style>
