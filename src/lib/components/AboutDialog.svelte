<script lang="ts">
	let { open = $bindable(false) }: { open?: boolean } = $props();

	function close() {
		open = false;
	}

	function onBackdrop(e: MouseEvent) {
		if (e.target === e.currentTarget) close();
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) close();
	}
</script>

<svelte:window onkeydown={onKey} />

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="backdrop" onclick={onBackdrop} role="presentation">
		<dialog class="dialog" open aria-labelledby="about-title">
			<header class="dialog-head">
				<div>
					<h2 id="about-title">ScaleShaper</h2>
					<p class="tagline">
						Actively shape your understanding of scale structure, fingering, and sound.
					</p>
				</div>
				<button type="button" class="close" onclick={close} aria-label="Close">×</button>
			</header>

			<div class="body">
				<p class="lede">
					Pick a scale, choose a key, study its shape, hear it, learn the fingering, and print an
					A4 sheet.
				</p>

				<section>
					<h3>One fact defines a scale</h3>
					<p>
						Every scale is defined by its <strong>ordered semitone steps</strong> — e.g. major is
						<code>2·2·1·2·2·2·1</code>. That pattern sums to 12 and is the scale's canonical
						<code>id</code>. From <code>steps</code> alone the app derives note count, pitch
						classes, degree labels, spelling in any key, keyboard fill, grand staff, fingering, and
						more. Names, moods, and examples are optional metadata layered on top.
					</p>
				</section>

				<section>
					<h3>What each page shows</h3>
					<ul>
						<li>
							<strong>Interval line</strong> — the hero view: gap sizes (1–4 semitones) colour-coded,
							with scale degrees. Key-agnostic shape at a glance.
						</li>
						<li>
							<strong>Keyboard</strong> — two octaves in your chosen key, degree-signature colours,
							classical finger numbers with bold thumbs.
						</li>
						<li>
							<strong>Grand staff</strong> — ascending and descending, VexFlow notation with key
							signature or inline accidentals.
						</li>
						<li>
							<strong>Audio</strong> — sampled piano by default; optional Web MIDI to an external
							instrument. Click keys or play the full scale.
						</li>
						<li>
							<strong>Scale glyph</strong> — a donut icon on the pitch-class clock: arc thickness and
							colour encode each gap. Modes are rotations of the same ring.
						</li>
						<li>
							<strong>Rhythm panel</strong> — hear the scale as a looping click pattern on a 12-pulse
							cycle (deep-rhythm sonification). Box notation and a sweeping playhead on the glyph.
						</li>
						<li>
							<strong>Neighbourhood</strong> — nearest scales by circular Earth-Mover distance
							(voice-leading effort). Explore one expressive step away.
						</li>
					</ul>
				</section>

				<section>
					<h3>Discovery</h3>
					<p>
						The sidebar groups named scales by family (diatonic, minor variants, pentatonic, blues,
						symmetric, world, jazz, exotic). Search by name, alias, mood, or a tune you know
						(<em>Caravan</em>, <em>Egyptian</em>…). The <strong>Explorer</strong> lists every valid
						generated shape (~1,200+) — 5–8 notes, no leap over two tones — browsable by note count.
					</p>
				</section>

				<section>
					<h3>Print</h3>
					<p>
						Each scale page fits a single <strong>A4 landscape</strong> sheet for the selected key.
						The sidebar, audio controls, rhythm panel, and neighbourhood graph are hidden when
						printing.
					</p>
				</section>

				<section>
					<h3>Stack</h3>
					<p>
						SvelteKit static SPA · pure <code>theory/</code> core (no framework deps) · VexFlow ·
						smplr piano + Web MIDI. Adding a scale means adding a catalog row, not writing code.
					</p>
				</section>
			</div>
		</dialog>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgba(15, 18, 28, 0.45);
	}
	.dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(640px, calc(100vw - 3rem));
		max-height: min(88vh, 820px);
		margin: 0;
		border: 1px solid var(--line-soft);
		border-radius: 10px;
		padding: 0;
		background: var(--bg);
		box-shadow: 0 18px 48px rgba(0, 0, 0, 0.18);
		overflow: hidden;
	}
	.dialog-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.1rem 0.6rem;
		border-bottom: 1px solid var(--line-faint);
	}
	.dialog-head h2 {
		margin: 0;
		font-size: 1.25rem;
		color: var(--accent);
	}
	.tagline {
		margin: 0.2rem 0 0;
		font-size: 0.82rem;
		color: var(--ink-soft);
		line-height: 1.4;
		max-width: 34ch;
	}
	.close {
		border: 0;
		background: transparent;
		font-size: 1.6rem;
		line-height: 1;
		color: var(--ink-soft);
		cursor: pointer;
		padding: 0 0.2rem;
		flex: 0 0 auto;
	}
	.close:hover {
		color: var(--ink);
	}
	.body {
		padding: 0.85rem 1.1rem 1.1rem;
		overflow-y: auto;
		max-height: calc(min(88vh, 820px) - 3.5rem);
		font-size: 0.9rem;
		line-height: 1.55;
	}
	.lede {
		margin: 0 0 1rem;
		color: var(--ink);
	}
	section {
		margin-bottom: 1rem;
	}
	section:last-child {
		margin-bottom: 0;
	}
	h3 {
		margin: 0 0 0.35rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-soft);
	}
	p,
	ul {
		margin: 0;
	}
	ul {
		padding-left: 1.15rem;
	}
	li + li {
		margin-top: 0.35rem;
	}
	code {
		font-size: 0.88em;
	}
</style>
