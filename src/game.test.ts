import * as game from './game'
import mockState from './__mocks__/gameState'

const squareAsteroid = {
	testId: 'square',
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
	testId: 'triangle',
	points: [
		{ x: 0, y: -1 },
		{ x: 1, y: 0 },
		{ x: 0, y: 1 },
	],
	position: { x: 23, y: 42 },
	radius: 1,
	velocity: { x: 5, y: -5 },
}

describe('asteroids', () => {
	test.each([
		[squareAsteroid, { x: 1, y: 2 }],
		[triangleAsteroid, { x: 28, y: 37 }]
	])('ticks should move %o to %j', (roid, expectedPos) => {
		const moved = game.asteroids([roid], game.tick())

		expect(moved[0].position).toEqual(expectedPos)
	})
})

describe('on bullet collisions with asteroids', () => {
		let beforeTick: game.GameState
		let afterTick: game.GameState

		describe('and when there are no bullets in play', () => {
				beforeEach(
					() => {
						const asteroids = [
							squareAsteroid,
							triangleAsteroid
						]
						const bullets: game.Bullet[] = []

						beforeTick = {
							...mockState,
							asteroids,
							bullets,
						}

						afterTick = game.damageAsteroids( beforeTick, game.tick() )
					}
				)
				test('expect no change to the asteroids', () => {
						expect( afterTick.asteroids ).toContain( squareAsteroid )
						expect( afterTick.asteroids ).toContain( triangleAsteroid )
					}
				)

				test('expect no change to the bullets', () => {
						expect( afterTick.bullets ).toEqual( [] )
					}
				)
			}
		)

		describe('and when bullets are in play', () => {
				const hits = {
					position: { x: 22, y: 42 },
					velocity: { x: 10, y: 0 },
				}

				const misses = {
					position: { x: 100, y: 100 },
					velocity: { x: 0, y: 10 },
				}

				describe('and when the bullet misses all the asteroids', () => {
						beforeEach(
							() => {
								const asteroids = [
									squareAsteroid,
									triangleAsteroid,
								]
								const bullets = [
									misses
								]
								
								beforeTick = {
									...mockState,
									asteroids,
									bullets,
								}

								afterTick = game.damageAsteroids( beforeTick, game.tick() )
							}
						)

						test('retain all the asteroids', () => {
								expect( afterTick.asteroids ).toContain( squareAsteroid )
								expect( afterTick.asteroids ).toContain( triangleAsteroid )
							}
						)

						test('retain the bullet', () => {
								expect( afterTick.bullets ).toContain( misses )
							}
						)
					}
				)

				describe('and when the bullet hits an asteroid', () => {
						beforeEach(
							() => {
								const asteroids = [
									squareAsteroid,
									triangleAsteroid,
								]
								const bullets = [
									hits
								]
								
								beforeTick = {
									...mockState,
									asteroids,
									bullets,
								}

								afterTick = game.damageAsteroids( beforeTick, game.tick() )
							}
						)

						test('remove the asteroid', () => {
								expect( afterTick.asteroids ).not.toContain( triangleAsteroid )
							}
						)

						test('retain the other asteroid', () => {
								expect( afterTick.asteroids ).toContain( squareAsteroid )
							}
						)

						test('remove the bullet', () => {
								expect( afterTick.bullets ).not.toContain( hits )
							}
						)

						test('increase the score by 1', () => {
							expect( afterTick.score ).toEqual( beforeTick.score + 1 )
						})
					}
				)
			}
		)
})

describe('when rockets and asteroids collide', () => {
	test('collisions nix the rocket', () => {
			const rocketKillerAsteroid = {
				testId: 'rocket-killer',
				points: [
					{ x: 0, y: 0 },
					{ x: 0, y: -1 },
					{ x: 1, y: -1 },
					{ x: 1, y: 0 },
				],
        position: { x: 420, y: 280 },
				radius: 45,
				velocity: { x: 0, y: 1 },
			}

			const stateBefore = {
				...mockState,
				asteroids: [
					squareAsteroid,
					triangleAsteroid,
					rocketKillerAsteroid,
				]
			}

			const stateAfter = game.asteroidsSmashRockets( stateBefore, game.tick() )

			expect( stateAfter.rocket ).toEqual( null )
	})

	test('misses have no effect', () => {
			const stateBefore = {
				...mockState,
				asteroids: [
					squareAsteroid,
					triangleAsteroid,
				]
			}

			const stateAfter = game.asteroidsSmashRockets( stateBefore, game.tick() )

			expect( stateAfter.rocket ).toEqual( stateBefore.rocket )
	})

	// test(
	// 	'the lives count reduces by 1',
	// 	() => {
			
	// 	}
	// )
})

describe('the score', () => {
	test('set to zero when game starts', () => {
		const score = game.score(undefined, game.initialise())

		expect(score).toEqual(0)
	})
})
////////////////////////////////////////////////////////////////////////////////