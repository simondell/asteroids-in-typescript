import * as Vectors from './libs/vectors.js'

import {
	Action,
	combineInParallel,
	combineInSeries,
	createActionCreator,
	handleAction,
	handleActions,
	Mapable,
	Reducer,
} from './libs/store.js'

export enum GameActions {
	Initialise = 'GAME/INITIALISE',
	Tick = 'GAME/TICK',
}

export const tick = createActionCreator(GameActions.Tick)
export const initialise = createActionCreator(GameActions.Initialise)

// asteroids ///////////////////////////////////////////////////////////////////
enum AsteroidActions {
	Add = 'ASTEROID/ADD',
}

export const addAsteroid = createActionCreator(AsteroidActions.Add)

export interface Asteroid
{
	// colour:
	// enabled: boolean
	points: Vectors.Vector2[]
	position: Vectors.Vector2
	radius: number
	velocity: Vectors.Vector2
}

function randomAsteroid (): Asteroid
{
	const position = {
		x: random(800),
		y: random(600),
	}

	const velocity = {
		x: random(20, -10),
		y: random(20, -10),
	}

	const radius = Math.floor( random( 70, 30 ) )
	const points: Vectors.Vector2[] = []
	for( let angle = 0; angle < 360; angle += random( 104, 0 ) ) {
		const nextPoint = {
			x: radius + random( radius / 2, radius / -2 ),
			y: 0
		}
		points.push( Vectors.rotateByDegrees( angle, nextPoint ) )
	}

	return {
		points,
		position,
		radius,
		velocity,
	}
}

function moveAsteroid (
	state: Asteroid,
	action: Action
): Asteroid
{
	const position = Vectors.add(state.position, state.velocity)
	return {
		...state,
		position
	}
}

// const asteroid = handleAction(tick, moveAsteroid, randomAsteroid())
const asteroid = handleActions([
	[initialise, randomAsteroid],
	[tick, moveAsteroid]
], {})

const defaultAsteroids: Asteroid[] = []

export function asteroids (
	state = defaultAsteroids,
	action: Action
): Asteroid[]
{
	switch (action.type) {
		case GameActions.Initialise: {
			const rocks: Asteroid[] = []
			let count = 5
			while( count-- ) {
				const rock = asteroid(undefined, action)
				rocks.push( rock )
			}
			return rocks
		}

		case GameActions.Tick: {
			const rocks: Asteroid[] = []
			let count = state.length
			while( count-- ) {
				const rock = asteroid(state[count], action)
				rocks.push( rock )
			}
			return rocks
		}

		default:
			return state
	}
}
////////////////////////////////////////////////////////////////////////////////

// controls ////////////////////////////////////////////////////////////////////
export enum Directions {
	NEUTRAL,
	LEFT,
	RIGHT,
}

enum ControlsActions {
	ENGAGE_THRUST = 'CONTROLS/ENGAGE_THRUST',
	SET_DIRECTION = 'CONTROLS/SET_DIRECTION',
	SHOOT = 'CONTROLS/SHOOT',
}

export const engageThrust = createActionCreator(ControlsActions.ENGAGE_THRUST)
export const setDirection = createActionCreator(ControlsActions.SET_DIRECTION)
export const shoot = createActionCreator(ControlsActions.SHOOT)

export interface Controls
{
	direction: Directions
	thrust: boolean
}

const defaultControls = {
	direction: Directions.NEUTRAL,
	thrust: false,
	// shoot: false,
}

export const controls = handleActions([
	[engageThrust, setPropertyToPayload<Controls>('thrust')],
	[setDirection, setPropertyToPayload<Controls>('direction')],
], defaultControls)
////////////////////////////////////////////////////////////////////////////////

// rocket //////////////////////////////////////////////////////////////////////
export interface Rocket
{
	acceleration: Vectors.Vector2
	angle: number
	position: Vectors.Vector2
	velocity: Vectors.Vector2
}

// rocket state
const defaultRocket = {
	acceleration: { x: 0.15, y: 0 },
	angle: 0,
	position: { x: 400, y: 300 },
	velocity: { x: 0, y: 0 }
}

const rocket = handleAction(
	tick,
	function (state: Rocket)
	{
		if( !state ) return state

		const newPosition = Vectors.add(state.position, state.velocity)
		return {
			...state,
			position: newPosition
		}
	},
	defaultRocket
)
////////////////////////////////////////////////////////////////////////////////

// bullets /////////////////////////////////////////////////////////////////////
export interface Bullet
{
	position: Vectors.Vector2
	velocity: Vectors.Vector2
}

const defaultBullet = {
	position: { x: 11, y: 0 },
	velocity: { x: 10, y: 0 },
}

// function bullets (state: Bullet[] = []) {
// 	return state
// }

function moveBullet (bullet: Bullet, action: Action): Bullet | undefined
{
	const newPosition = Vectors.add(bullet.position, bullet.velocity)
	return {
		...bullet,
		position: newPosition
	}
}

const bullets = handleActions([
	[tick, reduceAll<Bullet>(moveBullet)],
	],
	[]
)
////////////////////////////////////////////////////////////////////////////////

// settings ////////////////////////////////////////////////////////////////////
export enum Speeds {
	Still, // 0
	Slow,  // 1
	Fast,  // 2
}

enum SettingsActions {
	Speed = 'DEV/SPEED',
	Stop = 'DEV/STOP'
}

// const setSpeed = createActionCreator<SettingsActions.Speed, Speeds>(SettingsActions.Speed)
export const setSpeed = createActionCreator(SettingsActions.Speed)
export const stopAnimation = createActionCreator(SettingsActions.Stop)

export interface Settings
{
	gameHeight: number
	gameWidth: number
	speed: Speeds
}

const defaultSettings: Settings = {
	gameHeight: 0,
	gameWidth: 0,
	speed: Speeds.Still,
}

function applyInitialSettings (
	state: Settings,
	action: Action
): Settings
{
	return {
		...state,
		...updateProps(state, action.payload.settings)
	}
}

function stillMyBeatingHeart (
	state: Settings,
	action: Action
): Settings
{
	return {
		...state,
		speed: Speeds.Still
	}
}

const settings = handleActions([
	[initialise, applyInitialSettings],
	[setSpeed, setPropertyToPayload('speed')],
	[stopAnimation, stillMyBeatingHeart],
], defaultSettings)
////////////////////////////////////////////////////////////////////////////////

// score ///////////////////////////////////////////////////////////////////////
export const score = handleAction(
	initialise,
	function score (state = 0, action)
	{
		return state
	}
)
////////////////////////////////////////////////////////////////////////////////

// per slice ///////////////////////////////////////////////////////////////////
export interface GameState
{
	asteroids: Asteroid[]
	bullets: Bullet[]
	controls: Controls
	rocket: Rocket | null
	score: number
	settings: Settings
}

const perSlice = combineInParallel({
	asteroids,
	bullets,
	controls,
	rocket,
	score,
	settings,
})
////////////////////////////////////////////////////////////////////////////////

// cross-slice /////////////////////////////////////////////////////////////////
const turnRocket = handleAction(
	tick,
	function (state: GameState): GameState
	{
		const {
			controls,
			rocket,
		} = state

		const { direction } = controls

		if( !rocket ) return state
		if( direction === Directions.NEUTRAL ) return state

		const angularVelocity = direction === Directions.LEFT ? - 5 : + 5
		const nextAngle = rocket.angle + angularVelocity

		const nextRocket = {
			...rocket,
			angle: nextAngle
		}

		return {
			...state,
			rocket: nextRocket
		}
	}
)

const accelerateRocket = handleAction(
	tick,
	function (state: GameState): GameState
	{
		const {
			controls,
			rocket,
		} = state

		const { thrust } = controls

		if( !rocket ) return state
		if( !thrust ) return state

		const {
			acceleration,
			angle,
			velocity,
		} = rocket

		const thrustVector = Vectors.rotateByDegrees(angle, acceleration)
		const newVelocity = Vectors.add(velocity, thrustVector)

		const nextRocket = {
			...rocket,
			velocity: newVelocity,
		}

		return {
			...state,
			rocket: nextRocket
		}
	}
)

// TODO this might be faster
// function moveRocket (state: GameState) {
// 	const {
// 		controls,
// 		rocket,
// 	} = state

// 	let angle: number
// 	if( controls.direction != Directions.NEUTRAL ){
// 		const angularVelocity = controls.direction === Directions.LEFT ? - 5 : + 5
// 		angle = rocket.angle + angularVelocity
// 	}

// 	let velocity: Vectors.Vector2
// 	if( controls.thrust ){
// 		const {
// 			acceleration,
// 			angle,
// 			velocity: prevVelocity,
// 		} = rocket

// 		const thrustVector = Vectors.rotateByDegrees(angle, acceleration)
// 		velocity = Vectors.add(prevVelocity, thrustVector)
// 	}

// 	if( angle || velocity ){
// 		return {
// 			...state,
// 			rocket: updateProps( rocket, { angle, velocity } )
// 		}
// 	}

// 	return state
// }
const wrapAsteroids = handleAction(
	tick,
	function (state: GameState): GameState
	{
		const {
			asteroids,
			settings,
		} = state

		let wrappedAsteroids: Asteroid[] = asteroids
		let i = asteroids.length
		while( i-- )
		{
			const rock = wrappedAsteroids[i]

			let x: number = rock.position.x
			if( x + rock.radius < 0 )
			{
				x = settings.gameWidth + rock.radius
			}
			else if( x - rock.radius > settings.gameWidth )
			{
				x = 0 - rock.radius
			}

			let y: number = rock.position.y
			if( y + rock.radius < 0 )
			{
				y = settings.gameHeight + rock.radius
			}
			else if ( y - rock.radius > settings.gameHeight)
			{
				y = 0 - rock.radius
			}

			let position = { x, y }
			if( !Vectors.equal( rock.position, { x, y } ) )
			{
				wrappedAsteroids = [
					...wrappedAsteroids.slice(0, i),
					{ ...wrappedAsteroids[i], position },
					...wrappedAsteroids.slice(i + 1)
				]
			}
		}

		if( wrappedAsteroids == asteroids ) return state

		return {
			...state,
			asteroids: wrappedAsteroids
		}
	}
)

const stationary = { x: 0, y: 0 }
const wrapRocket = handleAction(
	tick,
	function (state: GameState): GameState
	{
		const {
			rocket,
			settings,
		} = state

		if( !rocket ) return state

		const { velocity } = rocket

		if( Vectors.equal( velocity, stationary ) ) return state

		let { x, y } = rocket.position
		if( x < 0 )
		{
			x = settings.gameWidth
		}
		else if( x > settings.gameWidth)
		{
			x = 0
		} 

		if( y < 0 )
		{
			y = settings.gameHeight;
		}
		else if ( y > settings.gameHeight )
		{
		 y = 0
		}

		const position = { x, y }
		const newRocket: Rocket = updateProps<Rocket>( rocket, { position } )
		return {
			...state,
			rocket: newRocket
		}
	}
)

// function shotFired (state: GameState, action: Action) {
const shotFired = handleAction(
	shoot,
	function (state: GameState, action: Action): GameState
	{
		const { rocket } = state

		const offset = Vectors.rotateByDegrees(
			rocket.angle,
			defaultBullet.position,
		)
		const position = Vectors.add(rocket.position, offset)

		const velocity = Vectors.rotateByDegrees(
			rocket.angle,
			defaultBullet.velocity
		)

		const newBullet = {
			position,
			velocity,
		}

		const bullets = [
			...state.bullets,
			newBullet
		]

		return {
			...state,
			bullets
		}
	}
)

const cullLostBullets = handleAction(
	tick,
	function (state: GameState): GameState
	{
		const { settings: {
			gameHeight,
			gameWidth,
		}} = state

		function cullWhenOutOfBounds (
			bullets: Bullet[],
			bullet: Bullet,
			index: number
		): Bullet[]
		{
			const { position: { x, y } } = bullet
			if(
				(x > -2 && x < (gameWidth + 2))
				&&
				(y > -2 && y < (gameHeight + 2))
			)
			{
				return bullets
			}
			else
			{
				return removeAt(index, bullets)
			}
		}

		return {
			...state,
			bullets: state.bullets.reduce(cullWhenOutOfBounds, state.bullets)
		}
	}
)

type HitsMisses = [Asteroid[], Bullet[], number]

function getSurvivors (
	hitsMisses: HitsMisses,
	asteroid: Asteroid,
	index: number
): HitsMisses
{
	const [survivors, bullets, prevScore] = hitsMisses
	let collidingBullet = bullets.findIndex(
		bullet => {
			const diff = Vectors.subtract( asteroid.position, bullet.position )
			const separation = Vectors.magnitude( diff )
			return separation <= asteroid.radius
		}
	)

	if( collidingBullet == -1 ) return [survivors, bullets, prevScore]

	const score = prevScore + 1

	return [
		removeAt(index, survivors),
		removeAt(collidingBullet, bullets),
		score,
	]
}

export const damageAsteroids = handleAction(
	tick,
	function (state: GameState): GameState
	{
		const {
			asteroids,
			bullets,
			score,
		} = state

		if( !bullets.length ) return state

		const [survivors, misses, newScore]: HitsMisses = asteroids.reduce(
			getSurvivors,
			[asteroids, bullets, score]
		)

		return {
			...state,
			asteroids: survivors,
			bullets: misses,
			score: newScore,
		}
	}
)

export const asteroidsSmashRockets = handleAction(
	tick,
	function asteroidsSmashRockets (state: GameState ): GameState
	{
		if( !state.rocket ) return state

		const isHit = state.asteroids.find( asteroid => {
			const diff = Vectors.subtract( asteroid.position, state.rocket.position )
			const separation = Vectors.magnitude( diff )
			// The rocket collision is based on web drawing sizes. Better to add a 
			//   width and length to the rocket and base it on (one of) those
			return separation <= asteroid.radius + 10
		})

		if( !isHit ) return state

		return {
			...state,
			rocket: null,
		}
	}
)

// store ///////////////////////////////////////////////////////////////////////
export default combineInSeries(
	perSlice,
	turnRocket,
	accelerateRocket,
	wrapAsteroids,
	wrapRocket,
	shotFired,
	cullLostBullets,
	damageAsteroids,
	asteroidsSmashRockets,
)
////////////////////////////////////////////////////////////////////////////////

// helpers /////////////////////////////////////////////////////////////////////
export function random (max = 1, min = 0): number
{
	return Math.random() * max + min
}

// function randomFloor (max = 1, min = 0) {
// 	return Math.floor(random(max, min))
// }

export function reduceAll<T> (reducer: Reducer<T>): Reducer<T[]>
{
	return (
		function (state: T[], action: Action): T[]
		{
			const items: T[] = []
			let count = state.length
			while( count-- )
			{
				const item = reducer(state[count], action)
				
				if( !item ) continue 
				
				items.push( item )
			}
			return items
		}
	)
}

export function removeAt ( index: number, state: any[] ): any[]
{
	return [
		...state.slice( 0, index ),
		...state.slice( index + 1 )
	]
}

export function setPropertyToPayload<T extends Mapable> (name: keyof T)
{
	return (
		function (state: T, action: Action): T
		{
			return {
				...state,
				[name]: action.payload
			}
		}
	)
}

export function updateProps<T> (state: T, updates: Partial<T>): T
{
	return {
		...state,
		...updates,
	}
}
////////////////////////////////////////////////////////////////////////////////
