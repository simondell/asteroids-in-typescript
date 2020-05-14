import {
	asteroids,
} from './asteroids.js'

import {
	controls,
	Directions,
	setDirection
} from './controls.js'

import {
	rocket
} from './rocket.js'

import {
	Action,
	combineInParallel,
	createAction,
	createStore,
	createStore2,
	Dispatch,
	Store,
} from './store.js'

import {
	Speeds,
	setSpeed,
	stopAnimation,
	Settings,
	settings,
} from './settings.js'

import {
	animate,
	initialise,
} from './animate.js'

// const canvas = document.createElement( 'canvas' )
const canvas = (document.getElementById('screen')) as HTMLCanvasElement
const context = canvas.getContext( '2d' )

const root = getComputedStyle(document.documentElement)
const canvasHeight = root.getPropertyValue('--game-height')
const canvasWidth = root.getPropertyValue('--game-width')

canvas.height = parseInt(canvasHeight, 10)
canvas.width = parseInt(canvasWidth, 10)
// debugger
// interface RenderFunction {
// 	(c: CanvasRenderingContext2D ): void
// }



// store ///////////////////////////////////////////////////////////////////////
// interface GameStore {
// 	controls: Controls
// 	rocket: Rocket
// 	settings: Settings
// }
// const [store, dispatch, notify] = createStore({
// 	asteroids,
// 	controls,
// 	rocket,
// 	settings,
// })
const rootReducer = combineInParallel({
	asteroids,
	controls,
	rocket,
	settings,
})
const [getState, dispatch, notify] = createStore2(rootReducer)
////////////////////////////////////////////////////////////////////////////////

// "hardware" //////////////////////////////////////////////////////////////////
enum KEYS {
	LEFT = 37,
	// POWER = 81,
	RIGHT = 39,
	// SHOOT = 32,
	// UP = 38,
}

function onKeyDown (event: KeyboardEvent): void {
	switch( event.keyCode ) {
		case KEYS.LEFT:
			dispatch( setDirection( Directions.LEFT ) )
			break;
		case KEYS.RIGHT:
			dispatch( setDirection( Directions.RIGHT ) )
			break;
	}
}

function onKeyUp (event: KeyboardEvent): void {
	event.preventDefault()

	switch( event.keyCode ) {
		case KEYS.LEFT:
		case KEYS.RIGHT:
			dispatch( setDirection( Directions.NEUTRAL ) )
			break;
	}
}

document.addEventListener( 'keydown', onKeyDown )
document.addEventListener( 'keyup', onKeyUp )

// dev controls ////////////////////////////////////////////////////////////////
const stop = document.getElementById( 'stop' ) as HTMLButtonElement
stop.addEventListener('click', event => {
	event.preventDefault()
	dispatch( stopAnimation() )
})

const radios = document.querySelector('#speeds')
radios.addEventListener('click', event => {
		// event.preventDefault()

		let radio: HTMLElement
		// if it's a label
		if( 'control' in event.target ) {
			radio = (event.target as HTMLLabelElement).control
		}
		// if it's an input
		else if( 'value' in event.target ) {
			radio = event.target
		}

		const { value } = (event.target as HTMLInputElement)
		const speed = parseInt(value, 10)
		dispatch( setSpeed( speed ) )
})

function updateSpeedView (store: Store) {
	// const { speed } = store.settings
	const { settings: { speed } } = getState()
	const radios = document.querySelectorAll(`[type="radio"]`)

	Array.prototype.forEach.call(radios, (radio: HTMLInputElement) => {
		radio.checked = false

		const isChecked = parseInt(radio.value, 10) === speed
		radio.checked = isChecked
	})
}

notify(updateSpeedView, false)

////////////////////////////////////////////////////////////////////////////////


// game loop ///////////////////////////////////////////////////////////////////
let clearRestartNotifier: Function | null = null
function restartDraw (store: Store): void {
	if(!(store.settings.speed === Speeds.Still)) {
		draw(true)
		if(clearRestartNotifier) {
			clearRestartNotifier()
			clearRestartNotifier = null
		}
	}
}

dispatch( initialise() )

const store = getState()
console.log(`initialised`, store)

function draw (shouldLog?: boolean): void {
	const store = getState()
	shouldLog && console.log(`draw() - store`, store)
	animate( context, store, dispatch )

	switch( store.settings.speed ) {
		case Speeds.Fast:
			requestAnimationFrame(() => draw(false))
			break
		case Speeds.Slow:
			setTimeout(draw, 333)
			break
		default: {
			clearRestartNotifier = notify(restartDraw, false)
			console.log('stop!!!')
			return
		}
	}
}

draw()
////////////////////////////////////////////////////////////////////////////////
