import * as Vectors from './libs/vectors.js'

import {
	Action,
	combineInParallel,
	combineInSeries,
	createActionCreator,
	handleAction,
	handleActions,
	Mapable,
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

export interface Asteroid {
	// colour:
	// enabled: boolean
	points: Vectors.Vector2[]
	position: Vectors.Vector2
	radius: number
	velocity: Vectors.Vector2
}

function randomAsteroid (): Asteroid {
	const position = {
		x: random(800),
		y: random(600),
	}

	const velocity = {
		x: random(20, -10),
		y: random(20, -10),
	}

	const radius = Math.floor( random( 80, 40 ) )
	const points: Vectors.Vector2[] = []
	for( let angle = 0; angle < 360; angle += random( -10, 64 ) ) {
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
){
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

export function asteroids (state = defaultAsteroids, action: Action) {
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

// controls ////////////////////////////////////////////////////////////////////
export enum Directions {
	NEUTRAL,
	LEFT,
	RIGHT,
}

enum ControlsActions {
	ENGAGE_THRUST = 'CONTROLS/ENGAGE_THRUST',
	SET_DIRECTION = 'CONTROLS/SET_DIRECTION'
}

export const engageThrust = createActionCreator(ControlsActions.ENGAGE_THRUST)
export const setDirection = createActionCreator(ControlsActions.SET_DIRECTION)

export interface Controls {
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
export interface Rocket {
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
	(state: Rocket) => {
		const newPosition = Vectors.add(state.position, state.velocity)
		return {
			...state,
			position: newPosition
		}
	},
	defaultRocket
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

export interface Settings {
	gameHeight: number
	gameWidth: number
	speed: Speeds
}

const defaultSettings: Settings = {
	gameHeight: 0,
	gameWidth: 0,
	speed: Speeds.Still,
}

function applyInitialSettings (state: Settings, action: Action): Settings {
	return {
		...state,
		...updateProps(state, action.payload.settings)
	}
}

function stillMyBeatingHeart (state: Settings, action: Action): Settings {
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

// per slice ///////////////////////////////////////////////////////////////////
type GameState = {
	asteroids: Asteroid[]
	controls: Controls
	rocket: Rocket
	settings: Settings
}

const perSlice = combineInParallel({
	asteroids,
	controls,
	rocket,
	settings,
})
////////////////////////////////////////////////////////////////////////////////

// cross-slice /////////////////////////////////////////////////////////////////
const turnRocket = handleAction(
	tick,
	(state: GameState): GameState => {
		const {
			controls,
			rocket,
		} = state

		const { direction } = controls

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
	(state: GameState): GameState => {
		const {
			controls,
			rocket,
		} = state

		const { thrust } = controls

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
	(state: GameState) => {
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

// store ///////////////////////////////////////////////////////////////////////
export default combineInSeries(
	perSlice,
	turnRocket,
	accelerateRocket,
	wrapAsteroids,
	// handleAction(tick, moveRocket),
)
////////////////////////////////////////////////////////////////////////////////

// helpers /////////////////////////////////////////////////////////////////////
function random (max = 1, min = 0) {
	return Math.random() * max + min
}

// function randomFloor (max = 1, min = 0) {
// 	return Math.floor(random(max, min))
// }

function setPropertyToPayload<T extends Mapable> (name: keyof T) {
	return function (state: T, action: Action): T {
		return {
			...state,
			[name]: action.payload
		}
	}
}

function updateProps (state: Mapable, updates: Mapable) {
	return {
		...state,
		...updates,
	}
}
////////////////////////////////////////////////////////////////////////////////
