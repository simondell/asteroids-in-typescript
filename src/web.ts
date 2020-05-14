import * as Vectors from './libs/vectors.js'

import {
	Action,
	createStore2,
	Dispatch,
	Store,
} from './store.js'

import gameLogic, {
	Asteroid,
	Directions,
	initialise,
	Rocket,
	setDirection,
	setSpeed,
	stopAnimation,
	turnRocket,
	tick,
	Speeds,
} from './game.js'

// const canvas = document.createElement( 'canvas' )
const canvas = (document.getElementById('screen')) as HTMLCanvasElement
const context = canvas.getContext( '2d' )

const root = getComputedStyle(document.documentElement)
const canvasHeight = root.getPropertyValue('--game-height')
const canvasWidth = root.getPropertyValue('--game-width')

canvas.height = parseInt(canvasHeight, 10)
canvas.width = parseInt(canvasWidth, 10)

// interface RenderFunction {
// 	(c: CanvasRenderingContext2D ): void
// }

// store ///////////////////////////////////////////////////////////////////////
// interface GameStore {
// 	controls: Controls
// 	rocket: Rocket
// 	settings: Settings
// }
const [getState, dispatch, notify] = createStore2(gameLogic)
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



// background //////////////////////////////////////////////////////////////////
export function renderAsteroid (
	context: CanvasRenderingContext2D,
	asteroid: Asteroid
): void {
	context.save();
	context.translate(asteroid.position.x, asteroid.position.y);
	context.strokeStyle = "#ffffff";
	context.lineWidth = 2;
	context.beginPath();

	for(var i = 0; i<asteroid.points.length; i++) {
		var p = asteroid.points[i];
		context.lineTo(p.x, p.y);
	}

	context.closePath();
	context.stroke();
	// context.fillStyle = asteroid.color;
	// context.fill();
	context.restore();
}
////////////////////////////////////////////////////////////////////////////////

// background //////////////////////////////////////////////////////////////////
function renderBackground ( context: CanvasRenderingContext2D ) {
	context.strokeStyle = "#ffffff"
	context.lineWidth = 2
	context.fillStyle = 'rgb(15, 8, 50)'
	context.fillRect( 0, 0, 800, 600 )
}
////////////////////////////////////////////////////////////////////////////////

// rocket //////////////////////////////////////////////////////////////////
export function renderRocket (
	context: CanvasRenderingContext2D,
	rocket: Rocket
): void {
	context.save()
	context.translate(
		rocket.position.x,
		rocket.position.y
	)

	const rads = Vectors.degreesToRadians( rocket.angle )
	context.rotate( rads )

	context.strokeStyle = "#fff"
	context.lineWidth = 2

	context.beginPath()
	context.moveTo( -10, -10 )
	context.lineTo( -10, 10 )
	context.lineTo( 23, 0 )
	context.closePath()
	context.stroke()

	context.restore()
}
////////////////////////////////////////////////////////////////////////////////

// animate //////////////////////////////////////////////////////////////////
export function animate (context: CanvasRenderingContext2D, store: Store, dispatch: Dispatch) {
	const { direction } = store.controls
	const {
		asteroids,
		rocket,
	} = store

	renderBackground( context )

	let rock = asteroids.length
	while( rock-- ) {
		renderAsteroid( context, asteroids[rock] )
	}

	renderRocket( context, rocket )

	if(!(direction === Directions.NEUTRAL)) {
		dispatch( turnRocket(direction) )
	}

	dispatch( tick() )
}
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
