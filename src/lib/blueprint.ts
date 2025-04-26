import Blueprint from 'factorio-blueprint';
import { Solution } from '$lib/solution';
import Victor from 'victor';
import { getOptionMatrix, ObjectDirection as OD } from '$lib/blueprint-matrix';

const STRAIGHT = 'straight-rail';
const CURVED_A = 'curved-rail-a';
const CURVED_B = 'curved-rail-b';


export const createBP = (railGridX: number,railGridY: number,railOffset: number) => {
	let bp = new Blueprint();
	bp.checkWithEntityData = false;
	bp.version = 562949956239363;
	bp.icons = ['signal_G'];

	let railGridXSan = railGridX - 1;
	let offset = railOffset * 2 + 2;
	let solution = new Solution(railGridX, railGridY, railOffset);


	createStraightRail(bp, -railGridY, railGridX);
	createStraightRail(bp, -railGridY - offset, railGridX);
	createStraightRail(bp, railGridY - 2, railGridX);
	createStraightRail(bp, railGridY + offset - 2, railGridX);


	let leftStart = new Victor(-railGridXSan - railGridY, 0);
	let leftUpperEnd = new Victor(-railGridXSan, -railGridY);
	let leftLowerEnd = new Victor(-railGridXSan, +railGridY);
	createCurveFromPoints(bp, leftStart, leftUpperEnd);
	createCurveFromPoints(bp, leftStart, leftLowerEnd);
	let leftStartOffset = (new Victor(-offset, 0)).add(leftStart);
	let leftUpperEndOffset = (new Victor(0, -offset)).add(leftUpperEnd);
	let leftLowerEndOffset = (new Victor(0, offset)).add(leftLowerEnd);
	createCurveFromPoints(bp, leftStartOffset, leftUpperEndOffset);
	createCurveFromPoints(bp, leftStartOffset, leftLowerEndOffset);

	let rightStart = new Victor(railGridXSan + railGridY, 0);
	let rightUpperEnd = new Victor(railGridXSan, -railGridY);
	let rightLowerEnd = new Victor(railGridXSan, +railGridY);
	createCurveFromPoints(bp, rightStart, rightUpperEnd);
	createCurveFromPoints(bp, rightStart, rightLowerEnd);
	let rightStartOffset = (new Victor(offset, 0)).add(rightStart);
	let rightUpperEndOffset = (new Victor(0, -offset)).add(rightUpperEnd);
	let rightLowerEndOffset = (new Victor(0, offset)).add(rightLowerEnd);
	createCurveFromPoints(bp, rightStartOffset, rightUpperEndOffset);
	createCurveFromPoints(bp, rightStartOffset, rightLowerEndOffset);

	bp.setSnapping({x: solution.gridSizeX, y: solution.gridSizeY},true);


	return bp.encode()
};

const createStraightRail = (bp: Blueprint, y: number, length: number) => {
	bp.createEntity(STRAIGHT, { x: 0, y: y }, OD.EAST);
	for (let railX = 1; railX < length / 2; railX++) {
		let x = railX * 2;
		bp.createEntity(STRAIGHT, { x: x, y: y }, OD.EAST);
		bp.createEntity(STRAIGHT, { x: -x, y: y }, OD.EAST);
	}
};

const createCurveFromPoints = (bp: Blueprint, pos1: Victor, pos2: Victor) => {
	pos1 = pos1.clone();
	pos2 = pos2.clone();
	const opts = getOptionMatrix(pos1, pos2);
	let currentPos = pos1.add(opts.railSourcePrepVector);
	bp.createEntity(CURVED_A, currentPos, opts.railSourceDirection);
	currentPos = currentPos.add(opts.railSourceVector);
	bp.createEntity(CURVED_B, currentPos, opts.railSourceDirection);
	currentPos = currentPos.add(opts.railSourceEndVector);

	let targetPos = pos2.add(opts.railTargetPrepVector);
	bp.createEntity(CURVED_A, targetPos, opts.railTargetDirection);
	targetPos = targetPos.add(opts.railTargetVector);
	bp.createEntity(CURVED_B, targetPos, opts.railTargetDirection);
	targetPos = targetPos.add(opts.railTargetEndVector);
	let i = 0;
	while (currentPos.x != targetPos.x) {
		if (i++ > 100000) {
			console.log('Infinite Loop');
			break; //infinite loop protection
		}
		bp.createEntity(STRAIGHT, currentPos, opts.railStraightDirection);
		currentPos = currentPos.add(opts.forwardVector);
	}
	bp.createEntity(STRAIGHT, currentPos, opts.railStraightDirection);
};