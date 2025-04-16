<script>
	import 'chota/dist/chota.min.css';
	import { browser } from '$app/environment';

	let daymode = $state(true);

	if (browser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		document.body.classList.add('dark');
		daymode = false;
	}

	const changeMode = () => {
		daymode = !daymode;
		if (daymode) {
			document.body.classList.remove('dark');
		} else {
			document.body.classList.add('dark');
		}
	};

	let { children } = $props();
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
			{#if daymode}
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
			href="javascript:"
			onclick={() => {
				changeMode();
			}}>{daymode ? '☀️' : '🌙'}</a
		>
	</div>
</nav>

{@render children()}
