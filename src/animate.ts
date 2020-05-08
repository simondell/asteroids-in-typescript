import {
	Directions
} from './controls.js'

import {
	renderRocket,
	turnRocket,
} from './rocket.js'

import {
	Dispatch,
	Store,
} from './store.js'

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
	const { rocket } = store

	if(!(direction === Directions.NEUTRAL)) {
		dispatch( turnRocket(direction) )
	}

	renderBackground( context )
	renderRocket( context, rocket )
}
////////////////////////////////////////////////////////////////////////////////
