

export class Solution {
	railOffset: number = 0;
	railGridX: number = 0;
	planSizeX: number = 0;
	gridSizeX: number = 0;
	gridOffsetX: number = 0;
	railGridY: number = 0;
	planSizeY: number = 0;
	gridSizeY: number = 0;
	gridOffsetY: number = 0;

	constructor(
		railGridX: number,
		railGridY: number,
		railOffset: number,
	) {
		this.railOffset = railOffset;
		this.railGridX = railGridX;
		this.planSizeX = railGridX * 2 + railGridY * 2 + (railOffset * 2 + 2) * 2;
		//10 is the offset created by the curves
		this.gridSizeX = railGridX * 2 + railGridY + railOffset + 10;
		this.gridOffsetX = (this.planSizeX - this.gridSizeX) / 2;
		this.railGridY = railGridY;
		this.planSizeY = railGridY * 2 + (railOffset * 2 + 2) * 2;
		this.gridSizeY = railGridY + railOffset;
		this.gridOffsetY = (this.planSizeY - this.gridSizeY) / 2;
		this.gridOffsetX = this.gridOffsetX - (this.gridOffsetX % 2)
		this.gridOffsetY = this.gridOffsetY - (this.gridOffsetY % 2)
	}
}