import * as game from './game'

// asteroids //////////////////////////////////////////////////////////////////
const squareAsteroid = {
	points: [
		{ x: 0, y: 0 },
		{ x: 0, y: -1 },
		{ x: 1, y: -1 },
		{ x: 1, y: 0 },
	],
	position: { x: 1, y: 1 },
	radius: 1,
	velocity: { x: 0, y: 1 },
}

const triangleAsteroid = {
	points: [
		{ x: 0, y: -1 },
		{ x: 1, y: 0 },
		{ x: 0, y: 1 },
	],
	position: { x: 23, y: 42 },
	radius: 1,
	velocity: { x: 5, y: -5 },
}

test.each([
	[squareAsteroid, { x: 1, y: 2 }],
	[triangleAsteroid, { x: 28, y: 37 }]
])('ticks should move %o to %j', (roid, expectedPos) => {
	const tick = { type: 'GAME/TICK' }

	const moved = game.asteroids([roid], tick)

	expect(moved[0].position).toEqual(expectedPos)
})
////////////////////////////////////////////////////////////////////////////////
