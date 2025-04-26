import Victor from 'victor';

export enum RailDirections {
	UP_LEFT = 0,
	UP_RIGHT = 2,
	RIGHT_UP = 4,
	RIGHT_DOWN = 6,
	DOWN_RIGHT = 8,
	DOWN_LEFT = 10,
	LEFT_DOWN = 12,
	LEFT_UP = 14,
}

export enum ObjectDirection {
	NORTH = 0,
	NORTH_EAST = 2,
	EAST = 4,
	SOUTH_EAST = 6,
	SOUTH = 8,
	SOUTH_WEST = 10,
	WEST = 12,
	NORTH_WEST = 14,
}

const RailDirectionVectors = new Map<RailDirections,Victor>([
	[RailDirections.UP_LEFT, new Victor(-2,-4)],
	[RailDirections.UP_RIGHT, new Victor(2,-4)],
	[RailDirections.RIGHT_UP, new Victor(6,-2)],
	[RailDirections.RIGHT_DOWN, new Victor(6,2)],
	[RailDirections.DOWN_RIGHT, new Victor(2,6)],
	[RailDirections.DOWN_LEFT, new Victor(-2,6)],
	[RailDirections.LEFT_DOWN, new Victor(-4,2)],
	[RailDirections.LEFT_UP, new Victor(-4,-2)],
]);

const RailDirectionEndVectors = new Map<RailDirections,Victor>([
	[RailDirections.UP_LEFT, new Victor(-4,-4)],
	[RailDirections.UP_RIGHT, new Victor(2,-4)],
	[RailDirections.RIGHT_UP, new Victor(2,-4)],
	[RailDirections.RIGHT_DOWN, new Victor(2,2)],
	[RailDirections.DOWN_RIGHT, new Victor(2,2)],
	[RailDirections.DOWN_LEFT, new Victor(-4,2)],
	[RailDirections.LEFT_DOWN, new Victor(-4,2)],
	[RailDirections.LEFT_UP, new Victor(-4,-4)],
]);

const RailDirectionStraight = new Map<RailDirections,ObjectDirection>([
	[RailDirections.UP_LEFT, ObjectDirection.NORTH_WEST],
	[RailDirections.UP_RIGHT, ObjectDirection.NORTH_EAST],
	[RailDirections.RIGHT_UP, ObjectDirection.NORTH_EAST],
	[RailDirections.RIGHT_DOWN, ObjectDirection.SOUTH_EAST],
	[RailDirections.DOWN_RIGHT, ObjectDirection.SOUTH_EAST],
	[RailDirections.DOWN_LEFT, ObjectDirection.SOUTH_WEST],
	[RailDirections.LEFT_DOWN, ObjectDirection.SOUTH_WEST],
	[RailDirections.LEFT_UP, ObjectDirection.NORTH_WEST],
]);

type OptionMatrix = {
	railSourceDirection: RailDirections;
	railSourcePrepVector: Victor;
	railSourceVector: Victor;
	railSourceEndVector: Victor;
	railTargetDirection: RailDirections;
	railTargetPrepVector: Victor;
	railTargetVector: Victor;
	railTargetEndVector: Victor;
	railStraightDirection: ObjectDirection,
	forwardVector: Victor;
}

type OptionMatrixBuildArgs = {
	railSourceDirection: RailDirections;
	railSourcePrepVector: Victor;

	railTargetDirection: RailDirections;
	railTargetPrepVector: Victor;
	railStraightDirection: ObjectDirection,
	forwardVector: Victor;
}

export const getOptionMatrix = (pos1:Victor, pos2:Victor): OptionMatrix => {
	const RD = RailDirections;
	const OD = ObjectDirection;
	let opt = {xDir: 'right',yDir: 'up'};
	if(pos2.x < pos1.x) {
		opt.xDir = 'left';
	}
	if (pos2.y > pos1.y) {
		//going down ... IDK why its inverted
		opt.yDir = 'down';
	}
	if(opt.xDir === 'right' && opt.yDir === 'up') {
		return buildOptions({
			railSourceDirection: RD.UP_RIGHT,
			railSourcePrepVector: new Victor(2,-2),
			railTargetDirection: RD.LEFT_DOWN,
			railTargetPrepVector: new Victor(-2,2),
			railStraightDirection: OD.NORTH_EAST,
			forwardVector: new Victor(2,-2),
		})

	}
	if(opt.xDir === 'right' && opt.yDir === 'down') {
		return buildOptions({
			railSourceDirection: RD.DOWN_RIGHT,
			railSourcePrepVector: new Victor(2,2),
			railTargetDirection: RD.LEFT_UP,
			railTargetPrepVector: new Victor(-2,0),
			railStraightDirection: OD.SOUTH_EAST,
			forwardVector: new Victor(2,2),
		});
	}
	if(opt.xDir === 'left' && opt.yDir === 'up') {
		return buildOptions({
			railSourceDirection: RD.UP_LEFT,
			railSourcePrepVector: new Victor(2,-2),
			railTargetDirection: RD.RIGHT_DOWN,
			railTargetPrepVector: new Victor(4,2),
			railStraightDirection: OD.NORTH_WEST,
			forwardVector: new Victor(-2,-2),
		})
	}
	if(opt.xDir === 'left' && opt.yDir === 'down') {
		return buildOptions({
			railSourceDirection: RD.DOWN_LEFT,
			railSourcePrepVector: new Victor(2,2),
			railTargetDirection: RD.RIGHT_UP,
			railTargetPrepVector: new Victor(4,0),
			railStraightDirection: OD.SOUTH_WEST,
			forwardVector: new Victor(-2,2),
		})
	}
	throw "Error: direction not supported.";
}

const buildOptions = (data: OptionMatrixBuildArgs):OptionMatrix => {
	let rsv = RailDirectionVectors.get(data.railSourceDirection);
	let rtv = RailDirectionVectors.get(data.railTargetDirection);
	let rsev = RailDirectionEndVectors.get(data.railSourceDirection)
	let rtev = RailDirectionEndVectors.get(data.railTargetDirection)
	if(rsv === undefined || rtv === undefined || rsev === undefined || rtev === undefined) {
		throw new Error("Unable to determine rail direction");
	}
	return {
		railSourceDirection: data.railSourceDirection,
		railSourcePrepVector: data.railSourcePrepVector,
		railSourceVector: rsv,
		railSourceEndVector: rsev,
		railTargetDirection: data.railTargetDirection,
		railTargetPrepVector: data.railTargetPrepVector,
		railTargetVector: rtv,
		railTargetEndVector: rtev,
		railStraightDirection: data.railStraightDirection,
		forwardVector: data.forwardVector,
	}
}