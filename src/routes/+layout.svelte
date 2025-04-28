<script lang="ts">
	import 'chota/dist/chota.min.css';
	import Blueprint from 'factorio-blueprint';
	import { globals } from './state.svelte.js';
	import type { LayoutProps } from '../../.svelte-kit/types/src/routes/$types';

	let { data, children }: LayoutProps = $props();
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';


	const changeMode = () => {
		globals.dayMode = !globals.dayMode;
		setBody();
	};

	const setBody = () => {
		if (globals.dayMode) {
			document.body.classList.remove('dark');
		} else {
			document.body.classList.add('dark');
		}
	};

	Blueprint.setEntityData({
		curved_rail_a: {
			type: 'item',
			width: 3,
			height: 5
		},
		curved_rail_b: {
			type: 'item',
			width: 5,
			height: 6
		}
	});
	onMount(() => {
		if (browser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			globals.dayMode = false;
		}
		setBody();

	});
</script>

<nav class="nav">
	<div class="nav-left">
		<!--a class="active">Calculator</a>
      <a>How To</a-->
	</div>
	<div class="nav-center">
		<div class="brand">Factorio Hexagon Grid Calculator</div>
	</div>
	<div class="nav-right">
		<a href="https://github.com/Sipnol/Factorio-Hex-Grid-Calculator">
			{#if globals.dayMode}
				<img
					src="https://icongr.am/simple/github.svg?size=128&color=000000&colored=false"
					alt="Github"
				/>
			{:else}
				<img
					src="https://icongr.am/simple/github.svg?size=96&color=FFFFFF&colored=false"
					alt="Github"
				/>
			{/if}
		</a>
		<a
			href=javascript:
			onclick={() => {
				changeMode();
			}}>{globals.dayMode ? '☀️' : '🌙'}</a
		>
	</div>
</nav>

{@render children()}
