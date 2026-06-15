<script lang="ts">
	import { generatedScales, signatureLabel } from '$lib/catalog';
	let all = generatedScales();
	let notes = $state(0); // 0 = all
	let filtered = $derived(notes === 0 ? all : all.filter((s) => s.steps.length === notes));
</script>

<header class="head">
	<h1>Explorer</h1>
	<p class="meta">
		Every rooted step-pattern summing to 12 with 5–8 notes and no leap over 2 tones —
		{all.length} scales. Named shapes get full pages; these are labelled by their interval signature.
	</p>
	<label class="no-print">
		Notes
		<select bind:value={notes}>
			<option value={0}>all</option>
			{#each [5, 6, 7, 8] as nn}<option value={nn}>{nn}</option>{/each}
		</select>
	</label>
</header>

<div class="grid">
	{#each filtered as s}
		<a class="cell" href="/scale/{s.id}">{signatureLabel(s)}</a>
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
		max-width: 60ch;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.4rem;
	}
	.cell {
		border: 1px solid var(--line-faint);
		border-radius: 6px;
		padding: 0.45rem;
		text-align: center;
		text-decoration: none;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		background: var(--bg-card);
	}
	.cell:hover {
		border-color: var(--accent);
		color: var(--accent);
	}
</style>
