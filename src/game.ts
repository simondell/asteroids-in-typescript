import * as Vectors from './libs/vectors.js'

import {
	Action,
	combineInParallel,
	createAction
} from './store.js'

// helpers /////////////////////////////////////////////////////////////////////
function random(max = 1, min = 0) {
	return Math.random() * max + min
}
////////////////////////////////////////////////////////////////////////////////

export enum GameActions {
	Initialise = 'GAME/INITIALISE',
	Tick = 'GAME/TICK',
}

export const tick = createAction(GameActions.Tick)
export const initialise = createAction(GameActions.Initialise)

// asteroids /////////////////////////////////////////////////////////////////////
enum AsteroidActions {
	Add = 'ASTEROID/ADD',
}

export const addAsteroid = createAction(AsteroidActions.Add)

export interface Asteroid {
	// colour:
	// enabled: boolean
	points: Vectors.Vector2[]
	position: Vectors.Vector2
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

	const radius = random(80, 40)
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
		velocity,
	}
}

function asteroid (state: Asteroid = randomAsteroid(), action: Action) {
	switch (action.type) {
		case GameActions.Tick: {
			const position = Vectors.add(state.position, state.velocity)
			return {
				...state,
				position
			}

			// this.pos.plusEq(this.vel);

			// if(this.pos.x+this.radius < 0) this.pos.x = canvas.width+this.radius;
			// else if (this.pos.x-this.radius > canvas.width) this.pos.x = -this.radius;

			// if(this.pos.y+this.radius < 0) this.pos.y = canvas.height+this.radius;
			// else if (this.pos.y-this.radius > canvas.height) this.pos.y = -this.radius;
		}

		default:
			return state
	}
}

export function asteroids (state: Asteroid[] = [], action: Action) {
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
	SET_DIRECTION = 'CONTROLS/SET_DIRECTION'
}

export const setDirection = createAction(ControlsActions.SET_DIRECTION)

export interface Controls {
	direction: Directions
}

const defaultControls = {
	direction: Directions.NEUTRAL,
	// thrust: false,
	// shoot: false,
}

export function controls (
	state = defaultControls,
	action: Action
){
	switch(action.type) {
		case ControlsActions.SET_DIRECTION: {
			const { payload: direction } = action
			return {
				...state,
				direction
			}
		}
	}
	return state
}
////////////////////////////////////////////////////////////////////////////////

// rocket /////////////////////////////////////////////////////////////////////
enum rocketActions {
	ROTATE = 'ROCKET/ROTATE',
}

export const turnRocket = createAction(rocketActions.ROTATE)

export interface Rocket {
	angle: number
	position: Vectors.Vector2
}

const root = getComputedStyle(document.documentElement)
const canvasHeight = root.getPropertyValue('--game-height')
const canvasWidth = root.getPropertyValue('--game-width')

const defaultRocket = {
	angle: -90,
	position: {
		x: parseInt(canvasWidth, 10) / 2,
		y: parseInt(canvasHeight, 10) / 2,
	}
}

export function rocket (
	state = defaultRocket,
	action: Action
){
	switch(action.type) {
		case rocketActions.ROTATE: {
			const { payload: direction } = action
			const angularVelocity = direction === Directions.LEFT
				? - 2
				: + 2

			return {
				...state,
				angle: state.angle + angularVelocity
			}
		}

		default:
			return state
	}
}
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

// const setSpeed = createAction<SettingsActions.Speed, Speeds>(SettingsActions.Speed)
export const setSpeed = createAction(SettingsActions.Speed)
export const stopAnimation = createAction(SettingsActions.Stop)

export interface Settings {
	speed: Speeds
}

const devDefaults: Settings = {
	speed: Speeds.Slow,
}

export function settings (
	state = devDefaults,
	action: Action
): Settings {
	switch( action.type ) {
		case SettingsActions.Stop:
			return {
				speed: Speeds.Still
			}
		case SettingsActions.Speed:
			return {
				speed: action.payload
			}
		default:
			return state
	}
}
////////////////////////////////////////////////////////////////////////////////

export default combineInParallel({
	asteroids,
	controls,
	rocket,
	settings,
})
