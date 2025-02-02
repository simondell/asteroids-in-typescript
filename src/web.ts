import * as Vectors from './libs/vectors.js'

import {
	Action,
	createStore,
	Dispatch,
} from './libs/store.js'

import gameLogic, {
	Asteroid,
	Bullet,
	Directions,
	engageThrust,
	GameState,
	initialise,
	Rocket,
	setDirection,
	setSpeed,
	shoot,
	stopAnimation,
	tick,
	Speeds,
} from './game.js'

// const canvas = document.createElement( 'canvas' )
const canvas = (document.getElementById('screen')) as HTMLCanvasElement
// if (!canvas) throw new Error('Could not find canvas element')

const context = canvas.getContext( '2d' )
// if (!context) throw new Error('Could not get 2d context from canvas')

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
	SPACE = 32,
	UP = 38,
}

function onKeyDown (event: KeyboardEvent): void {
	const { controls: { direction } } = getState()

	switch( event.keyCode ) {
		case KEYS.LEFT:
			if(direction != Directions.LEFT) {
				dispatch( setDirection( Directions.LEFT ) )
			}
			break

		case KEYS.RIGHT:
			if(direction != Directions.RIGHT	) {
				dispatch( setDirection( Directions.RIGHT ) )
			}
			break

		case KEYS.SPACE:
			dispatch( shoot() )
			break

		case KEYS.UP:
			dispatch( engageThrust( true ) )
			break
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
if (!radios) {
  throw new Error('Could not find speeds radio group')
}

radios.addEventListener('click', (event) => {
		event.preventDefault()

		// let radio: HTMLElement
		// // if it's a label
		// if( 'control' in event.target ) {
		// 	radio = (event.target as HTMLLabelElement).control
		// }
		// // if it's an input
		// else if( 'value' in event.target ) {
		// 	radio = event.target
		// }

		const { value } = (event.target as HTMLInputElement)
		const speed = parseInt(value, 10)
		dispatch( setSpeed( speed ) )
})

function updateSpeedView (state: GameState) {
	const { settings: { speed } } = state
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

	if(!context) throw new Error('Cannot draw next frame without 2d Canvas rendering context')

	draw(context, getState(), dispatch)
})
////////////////////////////////////////////////////////////////////////////////

// colours /////////////////////////////////////////////////////////////////////
const backgroundColor = 'rgb(15, 8, 50)'
const foregroundColor = '#fff'
////////////////////////////////////////////////////////////////////////////////

// asteroid ////////////////////////////////////////////////////////////////////
export function renderAsteroid (
	context: CanvasRenderingContext2D,
	asteroid: Asteroid
): void {
	context.save();
	context.translate(asteroid.position.x, asteroid.position.y);
	context.strokeStyle = foregroundColor;
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
	// context.strokeStyle = "#ff0000"
	context.lineWidth = 2
	context.fillStyle = backgroundColor
	context.fillRect( 0, 0, canvasWidth, canvasHeight )
}
////////////////////////////////////////////////////////////////////////////////

// rocket //////////////////////////////////////////////////////////////////////
export function renderRocket (
	context: CanvasRenderingContext2D,
	rocket: Rocket
): void {
	if( !rocket ) return

	context.save()
	context.translate(
		rocket.position.x,
		rocket.position.y
	)

	const rads = Vectors.degreesToRadians( rocket.angle )
	context.rotate( rads )

	context.strokeStyle = foregroundColor;
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

// bullets /////////////////////////////////////////////////////////////////////
export function renderBullet (
	context: CanvasRenderingContext2D,
	bullet: Bullet
): void {
	const radius = 2
	const { x, y } = bullet.position
	context.lineWidth = radius
	context.strokeStyle = foregroundColor;
	context.beginPath()
	context.arc(x, y, radius, 0, Math.PI * 2, true)
	context.stroke()
}
////////////////////////////////////////////////////////////////////////////////

// score ///////////////////////////////////////////////////////////////////////
export function renderScore (
	context: CanvasRenderingContext2D,
	score: number = 0
)
{
	context.strokeStyle = foregroundColor;
	context.font = '48px hyperspaceregular'
	context.strokeText(`${score}`, 50, 40)
}
////////////////////////////////////////////////////////////////////////////////

// draw ///////////////////////////////////////////////////////////////////
function draw (
	context: CanvasRenderingContext2D,
	store: GameState,
	dispatch: Dispatch
){
	const { direction } = store.controls
	const {
		asteroids,
		bullets,
		rocket,
		score,
	} = store

	renderBackground( context )

	let rock = asteroids.length
	while( rock-- ) {
		renderAsteroid( context, asteroids[rock] )
	}

	let shot = bullets.length
	while( shot-- ) {
		renderBullet( context, bullets[shot] )
	}

	renderRocket( context, rocket )

	renderScore( context, score )

	dispatch( tick() )
}
////////////////////////////////////////////////////////////////////////////////

// game loop ///////////////////////////////////////////////////////////////////
let clearRestartNotifier: Function | null = null
function restartgameLoop (): void {
	if(clearRestartNotifier) {
		clearRestartNotifier()
		clearRestartNotifier = null
	}
	gameLoop()
}

function gameLoop (): void {
	const store = getState()

	if(!context) throw new Error('Could not get 2d context from canvas')

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
