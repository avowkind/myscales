<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import { prefs } from '$lib/state.svelte';
	import {
		getScale,
		displayName,
		signatureLabel,
		routeOf,
		type ScaleRecord
	} from '$lib/catalog';
	import { KEY_CHOICES, keyChoiceLabel, noteName } from '$lib/theory/notes';
	import { degreeLabels } from '$lib/theory/degrees';
	import { spellScale, scaleMidis, type Tonic } from '$lib/theory/spelling';
	import { playScale } from '$lib/audio';
	import IntervalLine from '$lib/components/IntervalLine.svelte';
	import Keyboard from '$lib/components/Keyboard.svelte';
	import NotationStave from '$lib/components/NotationStave.svelte';
	import ScaleGlyph from '$lib/components/ScaleGlyph.svelte';
	import EgoNetwork from '$lib/components/EgoNetwork.svelte';

	let scale = $derived(getScale($page.params.id));
	let tonic = $derived<Tonic>(KEY_CHOICES[prefs.tonicPc][prefs.pref]);
	let degrees = $derived(scale ? degreeLabels(scale.steps, prefs.roman) : []);
	let notes = $derived(scale ? spellScale(scale.steps, tonic, prefs.pref) : []);

	function relation(idOrSlug: string): ScaleRecord | undefined {
		return getScale(idOrSlug);
	}

	function play() {
		if (scale) playScale(scaleMidis(scale.steps, prefs.tonicPc, 4, prefs.octaves));
	}
</script>

{#if !scale}
	<p>Unknown scale: {$page.params.id}</p>
{:else}
	<header class="head">
		<div class="title-block">
			<ScaleGlyph steps={scale.steps} size={66} />
			<div>
				<h1>{displayName(scale)}</h1>
				<p class="meta">
					{#if scale.parent}<span class="badge">{scale.parent.text}</span>{/if}
					{#if scale.mood}<span class="mood">{scale.mood}</span>{/if}
					{#if scale.colour}<span class="colour">· {scale.colour}</span>{/if}
				</p>
			</div>
		</div>

		<div class="controls no-print">
			<label>
				Key
				<select bind:value={prefs.tonicPc}>
					{#each KEY_CHOICES as k}
						<option value={k.pc}>{keyChoiceLabel(k, prefs.pref)}</option>
					{/each}
				</select>
			</label>
			<div class="toggle">
				<button class:on={prefs.pref === 'sharp'} onclick={() => (prefs.pref = 'sharp')}>♯</button>
				<button class:on={prefs.pref === 'flat'} onclick={() => (prefs.pref = 'flat')}>♭</button>
			</div>
			<div class="toggle">
				<button class:on={!prefs.roman} onclick={() => (prefs.roman = false)}>1·2·3</button>
				<button class:on={prefs.roman} onclick={() => (prefs.roman = true)}>Ⅰ·Ⅱ·Ⅲ</button>
			</div>
			<div class="toggle">
				<button class:on={prefs.audio === 'sample'} onclick={() => (prefs.audio = 'sample')}
					>Piano</button
				>
				<button class:on={prefs.audio === 'midi'} onclick={() => (prefs.audio = 'midi')}>MIDI</button>
			</div>
			<button class="play" onclick={play}>▶ Play</button>
			<button class="print-btn" onclick={() => window.print()}>⎙ Print</button>
		</div>
	</header>

	<section class="hero">
		<h2 class="section-label">Interval shape <span class="sig">{signatureLabel(scale)}</span></h2>
		<IntervalLine steps={scale.steps} roman={prefs.roman} />
	</section>

	<div class="row">
		<section class="card kb-card">
			<h2 class="section-label">
				Keyboard · two octaves · {keyChoiceLabel(KEY_CHOICES[prefs.tonicPc], prefs.pref)}
			</h2>
			{#key `${scale.id}-${prefs.tonicPc}-${prefs.pref}-${prefs.roman}`}
				<Keyboard
					steps={scale.steps}
					{tonic}
					root={prefs.tonicPc}
					pref={prefs.pref}
					roman={prefs.roman}
					octaves={prefs.octaves}
				/>
			{/key}
		</section>

		<section class="card stave-card">
			<h2 class="section-label">Grand staff · ascending &amp; descending</h2>
			{#key `${scale.id}-${prefs.tonicPc}-${prefs.pref}`}
				<NotationStave steps={scale.steps} {tonic} root={prefs.tonicPc} pref={prefs.pref} />
			{/key}
		</section>
	</div>

	<div class="row">
		<section class="card notes-card">
			<h2 class="section-label">Notes</h2>
			<table class="notes">
				<tbody>
					<tr>
						<th>Degree</th>
						{#each degrees as d}<td>{d}</td>{/each}
						<td>8</td>
					</tr>
					<tr>
						<th>Note</th>
						{#each notes as nlabel}<td class="note">{noteName(nlabel)}</td>{/each}
						<td class="note">{noteName(notes[0])}</td>
					</tr>
					<tr>
						<th>Gap</th>
						{#each scale.steps as g}<td class="gap">{g}</td>{/each}
						<td></td>
					</tr>
				</tbody>
			</table>
		</section>

		<section class="card rel-card">
			{#if scale.relations?.length}
				<h2 class="section-label">Close relatives</h2>
				<div class="rels">
					{#each scale.relations as r}
						{@const rs = relation(r)}
						{#if rs}<a class="rel" href="{base}/scale/{routeOf(rs)}">{displayName(rs)}</a>{/if}
					{/each}
				</div>
			{/if}
			{#if scale.examples?.length}
				<h2 class="section-label">Heard in</h2>
				<ul class="examples">
					{#each scale.examples as ex}<li>{ex}</li>{/each}
				</ul>
			{/if}
			{#if scale.description}
				<p class="desc">{scale.description}</p>
			{/if}
		</section>
	</div>

	<section class="card neigh-card">
		<h2 class="section-label">Neighbourhood · nearest scales by ear (Earth-Mover distance)</h2>
		{#key scale.id}
			<EgoNetwork {scale} />
		{/key}
	</section>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
		border-bottom: 2px solid var(--line-soft);
		padding-bottom: 0.6rem;
		margin-bottom: 0.8rem;
	}
	.title-block {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}
	h1 {
		margin: 0;
		font-size: 1.7rem;
	}
	.meta {
		margin: 0.25rem 0 0;
		color: var(--ink-soft);
		font-size: 0.9rem;
	}
	.badge {
		background: var(--hover);
		border-radius: 4px;
		padding: 0.1rem 0.4rem;
		margin-right: 0.4rem;
		color: var(--ink);
	}
	.colour {
		font-style: italic;
	}
	.controls {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.controls label {
		font-size: 0.8rem;
		color: var(--ink-soft);
	}
	select {
		font-size: 1rem;
		padding: 0.2rem 0.3rem;
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
		padding: 0.3rem 0.5rem;
		cursor: pointer;
	}
	.toggle button.on {
		background: var(--accent);
		color: #fff;
	}
	.play,
	.print-btn {
		border: 1px solid var(--line-soft);
		border-radius: 6px;
		background: var(--bg);
		padding: 0.35rem 0.7rem;
		cursor: pointer;
	}
	.play {
		background: var(--accent);
		color: #fff;
		border-color: var(--accent);
	}
	.section-label {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-soft);
		margin: 0 0 0.4rem;
		font-weight: 700;
	}
	.sig {
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		margin-left: 0.4rem;
	}
	.hero {
		margin-bottom: 0.8rem;
	}
	.row {
		display: flex;
		gap: 1rem;
		align-items: stretch;
		margin-bottom: 0.8rem;
		flex-wrap: wrap;
	}
	.card {
		background: var(--bg-card);
		border: 1px solid var(--line-faint);
		border-radius: 8px;
		padding: 0.7rem 0.85rem;
	}
	.kb-card {
		flex: 1 1 58%;
		min-width: 420px;
	}
	.stave-card {
		flex: 1 1 38%;
		min-width: 360px;
	}
	.notes-card {
		flex: 1 1 58%;
		min-width: 420px;
	}
	.rel-card {
		flex: 1 1 38%;
		min-width: 280px;
	}
	.neigh-card {
		margin-bottom: 0.8rem;
	}
	table.notes {
		border-collapse: collapse;
		width: 100%;
	}
	table.notes th {
		text-align: left;
		font-size: 0.7rem;
		color: var(--ink-soft);
		text-transform: uppercase;
		padding-right: 0.6rem;
	}
	table.notes td {
		text-align: center;
		padding: 0.2rem 0.35rem;
		font-variant-numeric: tabular-nums;
		border-left: 1px solid var(--line-faint);
	}
	td.note {
		font-weight: 700;
	}
	td.gap {
		color: var(--ink-soft);
	}
	.rels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 0.6rem;
	}
	.rel {
		background: var(--hover);
		border-radius: 5px;
		padding: 0.2rem 0.5rem;
		text-decoration: none;
		color: var(--ink);
		font-size: 0.85rem;
	}
	.examples {
		margin: 0.2rem 0 0.6rem;
		padding-left: 1.1rem;
		font-size: 0.88rem;
	}
	.desc {
		font-size: 0.88rem;
		color: var(--ink-soft);
		margin: 0;
	}
</style>
