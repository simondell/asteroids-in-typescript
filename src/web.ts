import * as Vectors from './libs/vectors.js'

import {
	Action,
	createStore,
	Dispatch,
	Store,
} from './libs/store.js'

import gameLogic, {
	Asteroid,
	Directions,
	engageThrust,
	GameState,
	initialise,
	Rocket,
	setDirection,
	setSpeed,
	stopAnimation,
	tick,
	Speeds,
} from './game.js'

// const canvas = document.createElement( 'canvas' )
const canvas = (document.getElementById('screen')) as HTMLCanvasElement
const context = canvas.getContext( '2d' )

const canvasStyles = window.getComputedStyle(canvas)
const canvasHeight = parseInt(canvasStyles.getPropertyValue('height'), 10)
const canvasWidth = parseInt(canvasStyles.getPropertyValue('width'), 10)
canvas.height = canvasHeight
canvas.width = canvasWidth

// interface RenderFunction {
// 	(c: CanvasRenderingContext2D ): void
// }

// store ///////////////////////////////////////////////////////////////////////
const [getState, dispatch, notify] = createStore<GameState>(gameLogic)
dispatch( initialise({
	settings: {
		gameHeight: canvasHeight,
		gameWidth: canvasWidth,
		speed: Speeds.Fast,
	}
}) )
////////////////////////////////////////////////////////////////////////////////

// "hardware" //////////////////////////////////////////////////////////////////
enum KEYS {
	LEFT = 37,
	// POWER = 81,
	RIGHT = 39,
	// SHOOT = 32,
	UP = 38,
}

function onKeyDown (event: KeyboardEvent): void {
	const { controls: { direction } } = getState()

	switch( event.keyCode ) {
		case KEYS.LEFT:
			if(direction != Directions.LEFT) {
				dispatch( setDirection( Directions.LEFT ) )
			}
			break;
		case KEYS.RIGHT:
			if(direction != Directions.RIGHT	) {
				dispatch( setDirection( Directions.RIGHT ) )
			}
			break;
		case KEYS.UP:
			dispatch( engageThrust( true ) )
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
		case KEYS.UP:
			dispatch( engageThrust( false ) )
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
		event.preventDefault()

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
	const { settings: { speed } } = store
	const radios = document.querySelectorAll(`[type="radio"]`)

	Array.prototype.forEach.call(radios, (radio: HTMLInputElement) => {
		radio.checked = false

		const isChecked = parseInt(radio.value, 10) === speed
		radio.checked = isChecked
	})
}

notify(updateSpeedView, false)

const ticker = document.getElementById( 'ticker' ) as HTMLButtonElement
ticker.addEventListener('click', event => {
	event.preventDefault()
	draw(context, getState(), dispatch)
})
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
	context.fillRect( 0, 0, canvasWidth, canvasHeight )
}
////////////////////////////////////////////////////////////////////////////////

// rocket //////////////////////////////////////////////////////////////////////
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
	// TODO should be based on rocket.width: number, rocket.length: number
	context.moveTo( -10, -10 )
	context.lineTo( -10, 10 )
	context.lineTo( 15, 0 )
	context.closePath()
	context.stroke()

	context.restore()
}
////////////////////////////////////////////////////////////////////////////////

// game loop ///////////////////////////////////////////////////////////////////
let clearRestartNotifier: Function | null = null
function restartgameLoop (store: Store): void {
	if(clearRestartNotifier) {
		clearRestartNotifier()
		clearRestartNotifier = null
	}
	gameLoop()
}

function draw (
	context: CanvasRenderingContext2D,
	store: GameState,
	dispatch: Dispatch
){
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

	dispatch( tick() )
}

function gameLoop (): void {
	const store = getState()

	draw(context, store, dispatch)

	switch( store.settings.speed ) {
		case Speeds.Fast:
			requestAnimationFrame(gameLoop)
			break
		case Speeds.Slow:
			setTimeout(gameLoop, 333)
			break
		default: {
			clearRestartNotifier = notify(restartgameLoop, false)
			console.log('stop!!!')
			return
		}
	}
}

gameLoop()
////////////////////////////////////////////////////////////////////////////////
