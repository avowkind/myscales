<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	onMount(() => goto('/scale/major', { replaceState: true }));
</script>

<p>Loading…</p>
