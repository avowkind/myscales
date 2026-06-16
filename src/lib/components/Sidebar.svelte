<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import ScaleGlyph from './ScaleGlyph.svelte';
	import {
		namedByFamily,
		routeOf,
		search,
		signatureLabel,
		FAMILY_COLOR,
		type ScaleRecord
	} from '$lib/catalog';

	let query = $state('');
	let groups = namedByFamily();
	let results = $derived(query.trim() ? search(query) : []);

	function active(scale: ScaleRecord): boolean {
		return $page.url.pathname === `${base}/scale/${routeOf(scale)}`;
	}
</script>

<nav class="sidebar">
	<a class="brand" href="{base}/scale/major">MyScales</a>

	<input class="search" placeholder="search name, mood, tune…" bind:value={query} />

	{#if query.trim()}
		<div class="group">
			<div class="group-label">Results</div>
			{#if results.length === 0}
				<div class="empty">no matches</div>
			{/if}
			{#each results as s}
				<a class="item" class:active={active(s)} href="{base}/scale/{routeOf(s)}">
					<ScaleGlyph steps={s.steps} size={20} />
					<span class="nm">{s.name}</span>
				</a>
			{/each}
		</div>
	{:else}
		{#each groups as g}
			<div class="group">
				<div class="group-label">
					<span class="fam-dot" style="background:{FAMILY_COLOR[g.family].accent}"></span>{g.label}
				</div>
				{#each g.scales as s}
					<a class="item" class:active={active(s)} href="{base}/scale/{routeOf(s)}">
						<ScaleGlyph steps={s.steps} size={20} />
						<span class="nm">{s.name}</span>
						<span class="sig">{signatureLabel(s)}</span>
					</a>
				{/each}
			</div>
		{/each}
		<div class="group">
			<div class="group-label">Explorer</div>
			<a class="item" class:active={$page.url.pathname === `${base}/explorer`} href="{base}/explorer">
				All generated scales →
			</a>
		</div>
	{/if}
</nav>

<style>
	.sidebar {
		width: 250px;
		flex: 0 0 250px;
		height: 100vh;
		overflow-y: auto;
		border-right: 1px solid var(--line-soft);
		padding: 1rem 0.75rem 3rem;
		background: var(--bg-side);
		font-size: 0.9rem;
	}
	.brand {
		display: block;
		font-weight: 800;
		font-size: 1.2rem;
		color: var(--accent);
		text-decoration: none;
		margin-bottom: 0.75rem;
	}
	.search {
		width: 100%;
		padding: 0.4rem 0.5rem;
		border: 1px solid var(--line-soft);
		border-radius: 6px;
		margin-bottom: 0.75rem;
		font-size: 0.85rem;
	}
	.group {
		margin-bottom: 0.85rem;
	}
	.group-label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		text-transform: uppercase;
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		color: var(--ink-soft);
		margin-bottom: 0.25rem;
		font-weight: 700;
	}
	.fam-dot {
		width: 9px;
		height: 9px;
		border-radius: 2px;
		display: inline-block;
		flex: 0 0 auto;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.22rem 0.5rem;
		border-radius: 5px;
		color: var(--ink);
		text-decoration: none;
	}
	.item :global(svg.glyph) {
		flex: 0 0 auto;
	}
	.nm {
		flex: 1;
		min-width: 0;
	}
	.item:hover {
		background: var(--hover);
	}
	.item.active {
		background: var(--accent);
		color: #fff;
	}
	.sig {
		font-size: 0.65rem;
		color: var(--ink-soft);
		font-variant-numeric: tabular-nums;
	}
	.item.active .sig {
		color: rgba(255, 255, 255, 0.85);
	}
	.empty {
		color: var(--ink-soft);
		padding: 0.3rem 0.5rem;
	}
</style>
