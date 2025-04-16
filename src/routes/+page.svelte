<script lang="ts">
	import 'chota/dist/chota.min.css';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	class Inputs {
		#railGridX: number = $state(0);
		#railGridYStart: number = $state(0);
		#railGridYEnd: number = $state(0);
		#railOffset: number = $state(0);

		constructor() {
			this.#railGridX = Number.parseInt(page.url.searchParams.get('railGridX') ?? '0');
			this.#railGridYStart = Number.parseInt(page.url.searchParams.get('railGridYStart') ?? '0');
			this.#railGridYEnd = Number.parseInt(page.url.searchParams.get('railGridYEnd') ?? '0');
			this.#railOffset = Number.parseInt(page.url.searchParams.get('railOffset') ?? '0');
		}

		public get railGridX(): number {
			return this.#railGridX;
		}

		public get railGridYStart(): number {
			return this.#railGridYStart;
		}

		public get railGridYEnd(): number {
			return this.#railGridYEnd;
		}

		public get railOffset(): number {
			return this.#railOffset;
		}

		public set railGridX(value) {
			this.#railGridX = value;
			page.url.searchParams.set('railGridX', value.toString());
		}

		public set railGridYStart(value) {
			this.#railGridYStart = value;
			page.url.searchParams.set('railGridYStart', value.toString());
		}

		public set railGridYEnd(value) {
			this.#railGridYEnd = value;
			page.url.searchParams.set('railGridYEnd', value.toString());
		}

		public set railOffset(value) {
			this.#railOffset = value;
			page.url.searchParams.set('railOffset', value.toString());
		}
	}

	class Solution {
		railGridY: number = 0;
		planSizeY: number = 0;
		gridSizeY: number = 0;
		gridOffsetY: number = 0;
		railGridX: number = 0;
		planSizeX: number = 0;
		gridSizeX: number = 0;
		gridOffsetX: number = 0;
		active: boolean = $state(false);

		constructor(
			railGridY: number,
			planSizeY: number,
			gridSizeY: number,
			gridOffsetY: number,
			railGridX: number,
			planSizeX: number,
			gridSizeX: number,
			gridOffsetX: number
		) {
			this.railGridY = railGridY;
			this.planSizeY = planSizeY;
			this.gridSizeY = gridSizeY;
			this.gridOffsetY = gridOffsetY;
			this.railGridX = railGridX;
			this.planSizeX = planSizeX;
			this.gridSizeX = gridSizeX;
			this.gridOffsetX = gridOffsetX;
		}
	}

	let daymode = $state(true);
	let inputs: Inputs = new Inputs();
	let solutions: Solution[] = $state([]);

	if (browser && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		document.body.classList.add('dark');
		daymode = false;
	}

	const updateUrl = () => {
		goto(page.url.search);
	};

	const activate = (index: any) => {
		solutions[index].active = !solutions[index].active;
		console.log(index, solutions[index].active);
	};

	const changeMode = () => {
		daymode = !daymode;
		if (daymode) {
			document.body.classList.remove('dark');
		} else {
			document.body.classList.add('dark');
		}
	};

	const calculate = () => {
		solutions = [];

		let offsetX = inputs.railOffset + 10;
		for (let railGridY = inputs.railGridYStart; railGridY < inputs.railGridYEnd; railGridY += 2) {
			let gridSizeX = inputs.railGridX * 2 + railGridY + offsetX;
			let gridSizeY = railGridY + inputs.railOffset;
			let planSizeY = railGridY * 2 + (inputs.railOffset * 2 + 2) * 2;
			let planSizeX = inputs.railGridX * 2 + railGridY * 2 + (inputs.railOffset * 2 + 2) * 2;
			let gridOffsetX = (planSizeX - gridSizeX) / 2;
			let gridOffsetY = (planSizeY - gridSizeY) / 2;
			gridOffsetX = gridOffsetX - gridOffsetX % 2;
			gridOffsetY = gridOffsetY - gridOffsetY % 2;

			solutions.push(
				new Solution(
					railGridY,
					planSizeY,
					gridSizeY,
					gridOffsetY,
					inputs.railGridX,
					planSizeX,
					gridSizeX,
					gridOffsetX,
				)
			);
		}
		console.log('done');
	};
</script>

<div class="container">
	<div class="row">
		<div class="col-11">
			<h1>Factorio Hexagon Grid Calculator</h1>
		</div>
		<div class="col-1">
			<a
				href="javascript:"
				onclick={() => {
					changeMode();
				}}>{daymode ? '☀️' : '🌙'}</a
			>
		</div>
	</div>
	<div class="row">
		<div class="col-3">
			<label for="rail_grid_x">Width of Upper edge of Hexagon</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railGridX} id="rail_grid_x" />
		</div>
		<div class="col-3">
			<label for="rail_grid_y_start">Vertical Length Start</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railGridYStart} id="rail_grid_y_start" />
		</div>
	</div>
	<div class="row">
		<div class="col-3">
			<label for="rail_offset">Space inbetween Rails</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railOffset} id="rail_offset" />
		</div>
		<div class="col-3">
			<label for="rail_grid_y_end">Vertical Length End</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railGridYEnd} id="rail_grid_y_end" />
		</div>
	</div>
	<div class="row">
		<div class="col is-center">
			<button type="button" class="button primary" onclick={calculate}>Calculate</button>
		</div>
	</div>

	{#if solutions.length > 0}
		<table class="striped">
			<thead>
				<tr>
					<th>Rail Grid X</th>
					<th>Rail Grid Y &lpar;&half;&rpar;</th>
					<th>Plan X Size</th>
					<th>Plan Y Size</th>
					<th>Grid X Size</th>
					<th>Grid Y Size</th>
					<th>Grid X Offset</th>
					<th>Grid Y Offset</th>
				</tr>
			</thead>
			<tbody>
				{#each solutions as solution, index}
					<tr class={solution.active ? 'active' : 'inactive'} onclick={() => activate(index)}>
						<td>{solution.railGridX}</td>
						<td>{solution.railGridY} &lpar;{solution.railGridY / 2}&rpar;</td>
						<td>{solution.planSizeX}</td>
						<td>{solution.planSizeY}</td>
						<td>{solution.gridSizeX}</td>
						<td>{solution.gridSizeY}</td>
						<td>{solution.gridOffsetX}</td>
						<td>{solution.gridOffsetY}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	/* table {
		border-collapse: separate;
		border-spacing: 0;
	} */

	th {
		/* header cell */
		position: sticky;
		top: 0;
		background-color: #000000;
	}

	.active {
		border: 2px solid #ffffff;
	}
</style>
