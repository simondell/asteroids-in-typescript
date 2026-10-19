import * as Vectors from './libs/vectors.js'

import {
	combineInParallel,
	combineInSeries,
	pipe,
	Reducer,
	Step,
} from './libs/store.js'

export enum GameActions {
	Initialise = 'GAME/INITIALISE',
	Tick = 'GAME/TICK',
}

enum ControlsActions {
	ENGAGE_THRUST = 'CONTROLS/ENGAGE_THRUST',
	SET_DIRECTION = 'CONTROLS/SET_DIRECTION',
	SHOOT = 'CONTROLS/SHOOT',
}

enum SettingsActions {
	Speed = 'DEV/SPEED',
	Stop = 'DEV/STOP'
}

export type Action =
	| { type: GameActions.Initialise; payload: Partial<Settings> }
	| { type: GameActions.Tick }
	| { type: ControlsActions.ENGAGE_THRUST; payload: boolean }
	| { type: ControlsActions.SET_DIRECTION; payload: Directions }
	| { type: ControlsActions.SHOOT }
	| { type: SettingsActions.Speed; payload: Speeds }
	| { type: SettingsActions.Stop }

export const tick = (): Action => ({ type: GameActions.Tick })
export const initialise = (payload: Partial<Settings> = {}): Action => ({ type: GameActions.Initialise, payload })

// asteroids ///////////////////////////////////////////////////////////////////
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

function moveAsteroid (asteroid: Asteroid): Asteroid
{
	const position = Vectors.add(asteroid.position, asteroid.velocity)
	return {
		...asteroid,
		position
	}
}

function asteroid (state: Asteroid | undefined, action: Action): Asteroid
{
	switch (action.type) {
		case GameActions.Initialise:
			return randomAsteroid()

		case GameActions.Tick:
			return moveAsteroid(state)

		default:
			return state
	}
}

const defaultAsteroids: Asteroid[] = []

export function asteroids (
	state: Asteroid[] = defaultAsteroids,
	action: Action
): Asteroid[]
{
	switch (action.type) {
		case GameActions.Initialise: {
			const rocks: Asteroid[] = []
			let count = 5
			while( count-- ) {
				rocks.push( asteroid(undefined, action) )
			}
			return rocks
		}

		case GameActions.Tick:
			return state.map(rock => asteroid(rock, action))

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

export const engageThrust = (payload: boolean): Action => ({ type: ControlsActions.ENGAGE_THRUST, payload })
export const setDirection = (payload: Directions): Action => ({ type: ControlsActions.SET_DIRECTION, payload })
export const shoot = (): Action => ({ type: ControlsActions.SHOOT })

export interface Controls
{
	direction: Directions
	thrust: boolean
}

const defaultControls: Controls = {
	direction: Directions.NEUTRAL,
	thrust: false,
}

function controls (state: Controls = defaultControls, action: Action): Controls
{
	switch (action.type) {
		case ControlsActions.ENGAGE_THRUST:
			return { ...state, thrust: action.payload }

		case ControlsActions.SET_DIRECTION:
			return { ...state, direction: action.payload }

		default:
			return state
	}
}
////////////////////////////////////////////////////////////////////////////////

// rocket //////////////////////////////////////////////////////////////////////
export interface Rocket
{
	acceleration: Vectors.Vector2
	angle: number
	position: Vectors.Vector2
	velocity: Vectors.Vector2
}

const defaultRocket: Rocket = {
	acceleration: { x: 0.15, y: 0 },
	angle: 0,
	position: { x: 400, y: 300 },
	velocity: { x: 0, y: 0 }
}

function rocket (state: Rocket | null = defaultRocket, action: Action): Rocket | null
{
	if( !state ) return state
	if( action.type !== GameActions.Tick ) return state

	const newPosition = Vectors.add(state.position, state.velocity)
	return {
		...state,
		position: newPosition
	}
}
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

function moveBullet (bullet: Bullet): Bullet
{
	const newPosition = Vectors.add(bullet.position, bullet.velocity)
	return {
		...bullet,
		position: newPosition
	}
}

function bullets (state: Bullet[] = [], action: Action): Bullet[]
{
	if( action.type !== GameActions.Tick ) return state

	return state.map(moveBullet)
}
////////////////////////////////////////////////////////////////////////////////

// settings ////////////////////////////////////////////////////////////////////
export enum Speeds {
	Still, // 0
	Slow,  // 1
	Fast,  // 2
}

export const setSpeed = (payload: Speeds): Action => ({ type: SettingsActions.Speed, payload })
export const stopAnimation = (): Action => ({ type: SettingsActions.Stop })

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

function settings (state: Settings = defaultSettings, action: Action): Settings
{
	switch (action.type) {
		case GameActions.Initialise:
			return { ...state, ...action.payload }

		case SettingsActions.Speed:
			return { ...state, speed: action.payload }

		case SettingsActions.Stop:
			return { ...state, speed: Speeds.Still }

		default:
			return state
	}
}
////////////////////////////////////////////////////////////////////////////////

// score ///////////////////////////////////////////////////////////////////////
export function score (state: number = 0, action: Action): number
{
	return state
}
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

// combineInParallel only knows it produces a Mapable; every slice above is
// typed against GameState's own shape, so the result always matches it too.
const perSlice = combineInParallel<Action>({
	asteroids,
	bullets,
	controls,
	rocket,
	score,
	settings,
}) as Reducer<GameState, Action>
////////////////////////////////////////////////////////////////////////////////

// cross-slice, tick-driven systems //////////////////////////////////////////////
function turnRocket (state: GameState): GameState
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

function accelerateRocket (state: GameState): GameState
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

function wrapAsteroids (state: GameState): GameState
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

const stationary = { x: 0, y: 0 }
function wrapRocket (state: GameState): GameState
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

function fireBullet (state: GameState): GameState
{
	const { rocket } = state

	if( !rocket ) return state

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

function cullLostBullets (state: GameState): GameState
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

export function damageAsteroids (state: GameState): GameState
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

export function asteroidsSmashRockets (state: GameState ): GameState
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

const simulateFrame: Step<GameState> = pipe(
	turnRocket,
	accelerateRocket,
	wrapAsteroids,
	wrapRocket,
	cullLostBullets,
	damageAsteroids,
	asteroidsSmashRockets,
)

function applyTickSystems (state: GameState, action: Action): GameState
{
	return action.type === GameActions.Tick ? simulateFrame(state) : state
}

function applyShot (state: GameState, action: Action): GameState
{
	return action.type === ControlsActions.SHOOT ? fireBullet(state) : state
}
////////////////////////////////////////////////////////////////////////////////

// store ///////////////////////////////////////////////////////////////////////
export default combineInSeries<GameState, Action>(
	perSlice,
	applyTickSystems,
	applyShot,
)
////////////////////////////////////////////////////////////////////////////////

// helpers /////////////////////////////////////////////////////////////////////
export function random (max = 1, min = 0): number
{
	return Math.random() * max + min
}

export function removeAt ( index: number, state: any[] ): any[]
{
	return [
		...state.slice( 0, index ),
		...state.slice( index + 1 )
	]
}

export function updateProps<T> (state: T, updates: Partial<T>): T
{
	return {
		...state,
		...updates,
	}
}
////////////////////////////////////////////////////////////////////////////////
