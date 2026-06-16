<script lang="ts">
	import { base } from '$app/paths';
	import ScaleGlyph from '$lib/components/ScaleGlyph.svelte';
	import {
		explorerScales,
		signatureLabel,
		FAMILY_COLOR,
		FAMILY_LABEL,
		FAMILY_ORDER
	} from '$lib/catalog';

	let all = explorerScales();
	let notes = $state(0); // 0 = all
	let filtered = $derived(notes === 0 ? all : all.filter((s) => s.steps.length === notes));
	let namedCount = $derived(filtered.filter((s) => s.family !== 'generated').length);

	let legend = FAMILY_ORDER.filter((f) => f !== 'generated');
</script>

<header class="head">
	<h1>Explorer</h1>
	<p class="meta">
		Every rooted step-pattern summing to 12 with 5–8 notes and no leap over 2 tones —
		{all.length} shapes. Tinted badges are already in the dictionary (coloured by family); plain ones
		are un-named.
	</p>
	<div class="legend no-print">
		{#each legend as f}
			<span class="leg">
				<span class="dot" style="background:{FAMILY_COLOR[f].accent}"></span>{FAMILY_LABEL[f]}
			</span>
		{/each}
	</div>
	<label class="no-print">
		Notes
		<select bind:value={notes}>
			<option value={0}>all</option>
			{#each [5, 6, 7, 8] as nn}<option value={nn}>{nn}</option>{/each}
		</select>
		<span class="muted">· {namedCount} named of {filtered.length}</span>
	</label>
</header>

<div class="grid">
	{#each filtered as s}
		{@const named = s.family !== 'generated'}
		{@const c = FAMILY_COLOR[s.family]}
		<a
			class="cell"
			class:named
			href="{base}/scale/{s.id}"
			title={named
				? `${s.name} · ${FAMILY_LABEL[s.family]} · ${signatureLabel(s)}`
				: signatureLabel(s)}
			style={named ? `background:${c.fill};border-color:${c.accent}` : ''}
		>
			<ScaleGlyph steps={s.steps} size={46} />
			{#if named}<span class="nm">{s.name}</span>{/if}
		</a>
	{/each}
</div>

<style>
	.head {
		border-bottom: 2px solid var(--line-soft);
		padding-bottom: 0.6rem;
		margin-bottom: 0.8rem;
	}
	h1 {
		margin: 0;
	}
	.meta {
		color: var(--ink-soft);
		font-size: 0.9rem;
		max-width: 70ch;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.9rem;
		margin: 0.4rem 0 0.6rem;
	}
	.leg {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.78rem;
		color: var(--ink-soft);
	}
	.dot {
		width: 11px;
		height: 11px;
		border-radius: 3px;
		display: inline-block;
	}
	.muted {
		color: var(--ink-soft);
		font-size: 0.8rem;
		margin-left: 0.3rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
		gap: 0.4rem;
	}
	.cell {
		border: 1px solid var(--line-faint);
		border-left-width: 1px;
		border-radius: 6px;
		padding: 0.5rem;
		text-align: center;
		text-decoration: none;
		color: var(--ink);
		background: var(--bg-card);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		min-height: 3.6rem;
		justify-content: center;
	}
	.cell.named {
		border-left-width: 4px;
	}
	.cell:hover {
		filter: brightness(0.97);
		outline: 1px solid var(--accent);
	}
	.sig {
		font-variant-numeric: tabular-nums;
		font-size: 0.9rem;
	}
	.nm {
		font-size: 0.68rem;
		color: var(--ink-soft);
		line-height: 1.1;
	}
</style>
