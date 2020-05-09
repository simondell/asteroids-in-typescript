import {
	renderAsteroid
} from './asteroids.js'

import {
	Directions
} from './controls.js'

import {
	renderRocket,
	turnRocket,
} from './rocket.js'

import {
	createAction,
	Dispatch,
	Store,
} from './store.js'

export enum GameActions {
	Initialise = 'GAME/INITIALISE',
	Tick = 'GAME/TICK',
}

export const tick = createAction(GameActions.Tick)
export const initialise = createAction(GameActions.Initialise)

// background //////////////////////////////////////////////////////////////////
function renderBackground ( context: CanvasRenderingContext2D ) {
	context.strokeStyle = "#ffffff"
	context.lineWidth = 2
	context.fillStyle = 'rgb(15, 8, 50)'
	context.fillRect( 0, 0, 800, 600 )
}
////////////////////////////////////////////////////////////////////////////////

// animate //////////////////////////////////////////////////////////////////
export function animate (context: CanvasRenderingContext2D, store: Store, dispatch: Dispatch) {
	const { direction } = store.controls
	const {
		asteroids,
		rocket,
	} = store

	if(!(direction === Directions.NEUTRAL)) {
		dispatch( turnRocket(direction) )
	}

	renderBackground( context )

	let rock = asteroids.length
	while( rock-- ) {
		renderAsteroid( context, asteroids[rock] )
	}

	renderRocket( context, rocket )
}
////////////////////////////////////////////////////////////////////////////////
