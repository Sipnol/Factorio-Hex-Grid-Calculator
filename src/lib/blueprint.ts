import Blueprint from 'factorio-blueprint';
import { Solution } from '$lib/solution';
import Victor from 'victor';
import { getDirectionMatrix, getRailOptionMatrix, ObjectDirection as OD, PoleConnections } from '$lib/blueprint-matrix';
import type Entity from 'factorio-blueprint/dist/src/entity';

const STRAIGHT = 'straight-rail';
const CURVED_A = 'curved-rail-a';
const CURVED_B = 'curved-rail-b';
const POWER_POLE = 'big-electric-pole';

interface Position {
	x: number;
	y: number;
}

type PowerPolePositions = {
	position: Victor;
	entity?: Entity;
	entities?: Entity[];
}


export class HexagonGrid {
	bp: Blueprint;

	railGridX: number;
	railGridY: number;
	railOffset: number;
	offset: number;

	leftPos: Victor;
	leftUpperPos: Victor;
	leftLowerPos: Victor;

	rightPos: Victor;
	rightUpperPos: Victor;
	rightLowerPos: Victor;

	leftOffsetPos: Victor;
	leftUpperOffsetPos: Victor;
	leftLowerOffsetPos: Victor;

	rightOffsetPos: Victor;
	rightUpperOffsetPos: Victor;
	rightLowerOffsetPos: Victor;

	constructor(railGridX: number, railGridY: number, railOffset: number) {
		this.railGridX = railGridX;
		this.railGridY = railGridY;
		this.railOffset = railOffset;

		this.calculatePositions();

		this.bp = new Blueprint();
		this.bp.checkWithEntityData = false;
		this.bp.version = 562949956239363;
		this.bp.icons = ['signal_G'];
	}

	public createHexGrid(): HexagonGrid {
		this.createStraightRail(-this.railGridY, this.railGridX);
		this.createStraightRail(-this.railGridY - this.offset, this.railGridX);
		this.createStraightRail(this.railGridY - 2, this.railGridX);
		this.createStraightRail(this.railGridY + this.offset - 2, this.railGridX);

		this.createCurveFromPoints(this.leftPos, this.leftUpperPos);
		this.createCurveFromPoints(this.leftPos, this.leftLowerPos);

		this.createCurveFromPoints(this.leftOffsetPos, this.leftUpperOffsetPos);
		this.createCurveFromPoints(this.leftOffsetPos, this.leftLowerOffsetPos);

		this.createCurveFromPoints(this.rightPos, this.rightUpperPos);
		this.createCurveFromPoints(this.rightPos, this.rightLowerPos);

		this.createCurveFromPoints(this.rightOffsetPos, this.rightUpperOffsetPos);
		this.createCurveFromPoints(this.rightOffsetPos, this.rightLowerOffsetPos);

		return this;
	}

	public createPowerPoles() {
		let poles = new Map<string, PowerPolePositions>();
		let offset = new Victor(0.5, 0.5);
		poles.set('left', { position: new Victor(-2, -1).add(this.leftPos) });
		poles.set('right', { position: new Victor(2, -1).add(this.rightPos) });
		poles.set('leftUpper', { position: new Victor(-10, -1).add(this.leftUpperPos).addScalar(-this.railOffset) });
		poles.set('leftLower', { position: new Victor(-10, -1).add(this.leftLowerPos).add(new Victor(-this.railOffset, this.railOffset)) });
		poles.set('rightUpper', { position: new Victor(10, -1).add(this.rightUpperPos).add(new Victor(this.railOffset, -this.railOffset)) });
		poles.set('rightLower', { position: new Victor(10, -1).add(this.rightLowerPos).addScalar(this.railOffset) });

		poles.forEach((v: PowerPolePositions) => {
			v.entity = this.createEntity(POWER_POLE, v.position.add(offset));
		}, this);

		PoleConnections.forEach((target, source) => {
			let sourceEntity = poles.get(source).entity;
			let targetEntity = poles.get(target).entity;
			poles.get(source).entities = this.createConnectingPowerPoles(
				poles.get(source).position.clone(),
				poles.get(target).position.clone()
			);
			let last = sourceEntity;
			poles.get(source).entities.sort((a: Entity, b: Entity) => {
				if (poles.get(source).position.x < poles.get(target).position.x) {
					return a.position.x - b.position.x;
				} else {
					return b.position.x - a.position.x;
				}
			});
			poles.get(source).entities.forEach((entity) => {
				last.neighbours.push(entity);
				entity.neighbours.push(last);
				last = entity;
			});
			last.neighbours.push(targetEntity);
			targetEntity.neighbours.push(last);
		}, this);
	}

	public prepareExportBlueprint(setSnapping: boolean = true, center: boolean = true): HexagonGrid {
		let solution = new Solution(this.railGridX, this.railGridY, this.railOffset);
		if (center) {
			let translateVector = this.bp.topLeft().clone();
			translateVector.add(new Victor(solution.gridOffsetX, solution.gridOffsetY));
			this.bp.fixCenter(translateVector);
		}
		if (setSnapping) {
			this.bp.setSnapping({ x: solution.gridSizeX, y: solution.gridSizeY }, true);
		}
		return this;
	}

	private calculatePositions() {
		let railGridXSan = this.railGridX - 1;
		this.offset = this.railOffset * 2 + 2;

		this.leftPos = new Victor(-railGridXSan - this.railGridY, 0);
		this.leftUpperPos = new Victor(-railGridXSan, -this.railGridY);
		this.leftLowerPos = new Victor(-railGridXSan, +this.railGridY);

		this.rightPos = new Victor(railGridXSan + this.railGridY, 0);
		this.rightUpperPos = new Victor(railGridXSan, -this.railGridY);
		this.rightLowerPos = new Victor(railGridXSan, +this.railGridY);

		this.leftOffsetPos = (new Victor(-this.offset, 0)).add(this.leftPos);
		this.leftUpperOffsetPos = (new Victor(0, -this.offset)).add(this.leftUpperPos);
		this.leftLowerOffsetPos = (new Victor(0, this.offset)).add(this.leftLowerPos);

		this.rightOffsetPos = (new Victor(this.offset, 0)).add(this.rightPos);
		this.rightUpperOffsetPos = (new Victor(0, -this.offset)).add(this.rightUpperPos);
		this.rightLowerOffsetPos = (new Victor(0, this.offset)).add(this.rightLowerPos);
	}

	private createStraightRail(y: number, length: number) {
		this.createEntity(STRAIGHT, { x: 0, y: y }, OD.EAST);
		for (let railX = 1; railX < length / 2; railX++) {
			let x = railX * 2;
			this.createEntity(STRAIGHT, { x: x, y: y }, OD.EAST);
			this.createEntity(STRAIGHT, { x: -x, y: y }, OD.EAST);
		}
	}

	private createCurveFromPoints(pos1: Victor, pos2: Victor) {
		pos1 = pos1.clone();
		pos2 = pos2.clone();
		const opts = getRailOptionMatrix(pos1, pos2);
		let currentPos = pos1.add(opts.railSourcePrepVector);
		this.createEntity(CURVED_A, currentPos, opts.railSourceDirection);
		currentPos = currentPos.add(opts.railSourceVector);
		this.createEntity(CURVED_B, currentPos, opts.railSourceDirection);
		currentPos = currentPos.add(opts.railSourceEndVector);

		let targetPos = pos2.add(opts.railTargetPrepVector);
		this.createEntity(CURVED_A, targetPos, opts.railTargetDirection);
		targetPos = targetPos.add(opts.railTargetVector);
		this.createEntity(CURVED_B, targetPos, opts.railTargetDirection);
		targetPos = targetPos.add(opts.railTargetEndVector);

		this.createEntity(STRAIGHT, currentPos, opts.railStraightDirection);
		while (opts.loopComparison(currentPos, targetPos)) {
			currentPos = currentPos.add(opts.forwardVector);
			this.createEntity(STRAIGHT, currentPos, opts.railStraightDirection);
		}
	}

	private createConnectingPowerPoles(pos1: Victor, pos2: Victor): Entity[] {
		//due to the space in the intersections the poles at these corners are off center. this compensates that
		const diagCompVector = new Victor(0, 4 + this.railOffset);
		const diagCompVector2 = new Victor(18, 18);
		const diagVector = new Victor(22, 22);
		let straightVector = new Victor(32, 32);

		const directionVector = getDirectionMatrix(pos1, pos2);
		const directionVectorInverse = directionVector.clone().invert();
		const maxPoleDistance = pos1.y === pos2.y ? 32 : 31; //diagonal poles have an effective max of 31.smth
		let polesNeeded = Math.ceil(pos1.distance(pos2) / maxPoleDistance) - 1;
		const polesCreated: Entity[] = [];
		if (polesNeeded < 1) {
			return polesCreated;
		}

		if (pos1.y !== pos2.y) {
			straightVector = diagVector;
			pos1.add(diagCompVector.clone().multiply(directionVector));
			pos2.add(diagCompVector.clone().multiply(directionVectorInverse));
			if (polesNeeded > 2) {
				pos1.add(diagCompVector2.clone().multiply(directionVector));
				pos2.add(diagCompVector2.clone().multiply(directionVectorInverse));
				polesCreated.push(this.createEntity(POWER_POLE, pos1.clone()), this.createEntity(POWER_POLE, pos2.clone()));
				polesNeeded -= 2;
			}
		}
		if (polesNeeded > 2) {
			while (polesNeeded > 2) {
				pos1.add(straightVector.clone().multiply(directionVector));
				pos2.add(straightVector.clone().multiply(directionVectorInverse));
				polesCreated.push(this.createEntity(POWER_POLE, pos1.clone()), this.createEntity(POWER_POLE, pos2.clone()));
				polesNeeded -= 2;
			}
		}
		if (polesNeeded === 2) {
			let lastPole = new Victor(Math.floor(pos1.absDistanceX(pos2) / 3), Math.floor(pos1.absDistanceY(pos2) / 3));
			polesCreated.push(
				this.createEntity(POWER_POLE, pos1.add(lastPole.clone().multiply(directionVector))),
				this.createEntity(POWER_POLE, pos2.add(lastPole.clone().multiply(directionVectorInverse)))
			);
			return polesCreated;
		} else {
			let lastPole = new Victor(pos1.absDistanceX(pos2) / 2, pos1.absDistanceY(pos2) / 2);
			lastPole.multiply(directionVector).add(pos1);
			polesCreated.push(this.createEntity(POWER_POLE, lastPole));
			return polesCreated;
		}
	}

	private createEntity(name: string, position: Position, direction: number = OD.NORTH): Entity {
		return this.bp.createEntity(name, position, direction, true, false, true);
	}
}
