<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { Solution } from '$lib/solution';
	import { HexagonGrid } from '$lib/blueprint';
	import { globals } from './state.svelte';

	class Inputs {

		#railGridX: number = $state(0);
		#railGridY: number = $state(0);
		#railOffset: number = $state(0);
		#includePowerPoles: boolean = $state(false);

		constructor() {
			this.#railGridX = Number.parseInt(page.url.searchParams.get('railGridX') ?? '0');
			this.#railGridY = Number.parseInt(page.url.searchParams.get('railGridY') ?? '0');
			this.#railOffset = Number.parseInt(page.url.searchParams.get('railOffset') ?? '0');
			this.#includePowerPoles = page.url.searchParams.get('includePowerPoles')?.toLowerCase() === 'true' ?? false;
		}

		public allValid (): boolean {
			return this.#railGridX > 0 && this.#railGridY > 0 && this.#railOffset > 0;
		}

		public get railGridX(): number {
			return this.#railGridX;
		}

		public get railGridY(): number {
			return this.#railGridY;
		}

		public get railOffset(): number {
			return this.#railOffset;
		}

		get includePowerPoles(): boolean {
			return this.#includePowerPoles;
		}

		public set railGridX(value) {
			this.#railGridX = value;
			page.url.searchParams.set('railGridX', value.toString());
		}

		public set railGridY(value) {
			this.#railGridY = value;
			page.url.searchParams.set('railGridY', value.toString());
		}

		public set railOffset(value) {
			this.#railOffset = value;
			page.url.searchParams.set('railOffset', value.toString());
		}

		set includePowerPoles(value: boolean) {
			this.#includePowerPoles = value;
			page.url.searchParams.set('includePowerPoles', value.toString());
			updateUrl()
			calculate()
		}
	}


	let inputs: Inputs = new Inputs();
	let solution: Solution = $state(new Solution(0,0,0));
	let blueprint: string = $state("");



	const updateUrl = () => {
		goto(page.url.search);
		calculate()
	};

	const calculate = () => {
		if(!inputs.allValid()) {
			return;
		}
		solution = new Solution(inputs.railGridX, inputs.railGridY,inputs.railOffset);
		let grid = new HexagonGrid(inputs.railGridX, inputs.railGridY,inputs.railOffset);
		grid.createHexGrid();
		if(inputs.includePowerPoles) {
			grid.createPowerPoles()
		}
		grid.prepareExportBlueprint();
		blueprint = grid.bp.encode();
	};

	const copyToClipboard = () => {
		calculate()
		navigator.clipboard.writeText(blueprint);
	}


	calculate()
</script>

<div class="container">
	<div>
		<details>
			<summary> How To </summary>
			<ol>
				<li>create your straight rail lines for either top or bottom.</li>
				<li>
					start from one of the edges and go upwards, you want half the y distance including the
					straight piece.
				</li>
				<li>from here add the same distance from your downward rails to the side.</li>
				<figure>
					<img src="/example_picture.jpg" height="400px" width="400px" alt="" />
					<figcaption>
						you should have something like this now, place a rail piece one down and right (shown
						red) and connect your straight line to here.
					</figcaption>
				</figure>
				<li>
					add the other curve remove the scaffold rails and copy the curves to the rest of the
					hexagon
				</li>
				<li>
					blueprint your hexagon add in the grid sizes and offset and off you go with perfectly
					tiling bestagons
				</li>
			</ol>
		</details>
		<hr />
	</div>
	<div class="row">
		<div class="col">
			<label for="rail_grid_x">Length of straight rail tiles in Hexagon</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railGridX} id="rail_grid_x" />
		</div>
		<div class="col">
			<label for="rail_grid_y">Vertical Length</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railGridY} id="rail_grid_y" />
		</div>
	</div>
	<div class="row">
		<div class="col-5">
			<label for="rail_offset">Offset between rails in rail tiles</label>
		</div>
		<div class="col-1" onfocusout={updateUrl}>
			<input type="number" bind:value={inputs.railOffset} id="rail_offset" />
		</div>
	</div>
	<div class="is-center">
		<p class="text-dark">
			Make sure to use an uneven amount of straight rails, and an even amount for the Vertical
			length and the Offset.
		</p>
	</div>
	<div class="is-center">
		<p class="text-dark">Uneven Offset should work in theory but the calculations will be off.</p>
	</div>

	{#if solution !== undefined && solution.railGridX !== 0}
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

					<tr>
						<td>{solution.railGridX}</td>
						<td>{solution.railGridY} &lpar;{solution.railGridY / 2}&rpar;</td>
						<td>{solution.planSizeX}</td>
						<td>{solution.planSizeY}</td>
						<td>{solution.gridSizeX}</td>
						<td>{solution.gridSizeY}</td>
						<td>{solution.gridOffsetX}</td>
						<td>{solution.gridOffsetY}</td>
					</tr>

			</tbody>
		</table>
		<div class="row">
			<div class="col">
				<h2>Blueprint</h2>
			</div>
			<div class="col-1 is-center">
				<button class="button outline dark" onclick={copyToClipboard}><img src="https://icongr.am/fontawesome/copy.svg?size=16&color={globals.dayMode ? '000000' : 'ffffff'}" alt="copyButton"></button>
			</div>
			<div class="col-2 is-center">
				<label for="power_pole_check"><input id="power_pole_check" type="checkbox" bind:checked={inputs.includePowerPoles}>Include Power Poles</label>
			</div>

		</div>
		<pre>{blueprint}</pre>
	{/if}
</div>

