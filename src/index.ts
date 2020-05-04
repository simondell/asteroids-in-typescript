import {
	Action,
	createAction,
	createStore,
	Dispatch,
	Store,
} from './store.js'

const canvas = document.createElement( 'canvas' )
const context = canvas.getContext( '2d' )

canvas.width = 800
canvas.height = 600

document.body.appendChild( canvas )

// interface RenderFunction {
// 	(c: CanvasRenderingContext2D ): void
// }

// background //////////////////////////////////////////////////////////////////
function renderBackground ( context: CanvasRenderingContext2D ) {
	context.strokeStyle = "#ffffff"
	context.lineWidth = 2
	context.fillStyle = 'rgb(15, 8, 50)'
	context.fillRect( 0, 0, 800, 600 )
}
////////////////////////////////////////////////////////////////////////////////

// rocket //////////////////////////////////////////////////////////////////////
interface Vector2 {
	x: number
	y: number
}

interface Rocket {
	angle: number
	position: Vector2
}

function renderRocket (
	context: CanvasRenderingContext2D,
	rocket: Rocket
): void {
	context.save()
	context.translate(
		rocket.position.x,
		rocket.position.y
	)

	const rads = degreesToRadians( rocket.angle )
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

function degreesToRadians (angle: number): number {
	return angle * Math.PI / 180
}

const defaultRocket = {
	angle: 60,
	position: {
		x: canvas.width / 2,
		y: canvas.height / 2,
	}
}

enum rocketActions {
	ROTATE_LEFT = 'ROCKET/ROTATE_LEFT',
	ROTATE_RIGHT = 'ROCKET/ROTATE_RIGHT',
}

const rotateLeft = { type: rocketActions.ROTATE_LEFT }
const rotateRight = { type: rocketActions.ROTATE_RIGHT }

function rocket (
	state = defaultRocket,
	action: Action
){
	switch(action.type) {
		case rocketActions.ROTATE_LEFT:
			return {
				...state,
				angle: state.angle - 2
			}
		case rocketActions.ROTATE_RIGHT:
			return {
				...state,
				angle: state.angle + 2
			}
		default:
			return state
	}
}

function getRocket (state: Store): Rocket {
	return state.rocket
}
////////////////////////////////////////////////////////////////////////////////

// store ///////////////////////////////////////////////////////////////////////
const [store, dispatch] = createStore({ rocket })
////////////////////////////////////////////////////////////////////////////////

// controls ////////////////////////////////////////////////////////////////////
enum Directions {
	NEUTRAL,
	LEFT,
	RIGHT,
}

enum ControlsActions {
	SET_DIRECTION = 'CONTROLS/SET_DIRECTION'
}
const setDirection = createAction(ControlsActions.SET_DIRECTION)

const defaultControls = {
	direction: Directions.NEUTRAL,
	// thrust: false,
	// shoot: false,
}

function controls (
	state = defaultControls,
	action: Action
){
	switch(action.type) {
		case ControlsActions.SET_DIRECTION:
			return {
				...state,
				direction: action.payload
			}
		default:
			return state
	}
}


enum CONTROLS {
	LEFT = 37,
	// POWER = 81,
	RIGHT = 39,
	// SHOOT = 32,
	// UP = 38,
}

function onKeyDown (event: KeyboardEvent): void {
	event.preventDefault()

	switch( event.keyCode ) {
		case CONTROLS.LEFT:
			dispatch( setDirection( Directions.LEFT ) )
			break;
		case CONTROLS.RIGHT:
			dispatch( setDirection( Directions.RIGHT ) )
			break;
	}
}

function onKeyUp (event: KeyboardEvent): void {
	event.preventDefault()

	switch( event.keyCode ) {
		case CONTROLS.LEFT:
		case CONTROLS.RIGHT:
			dispatch( setDirection( Directions.NEUTRAL ) )
			break;
	}
}

document.addEventListener('keydown', onKeyDown)
document.addEventListener('keydown', onKeyUp)
////////////////////////////////////////////////////////////////////////////////

// game loop ///////////////////////////////////////////////////////////////////
function draw (): void {
	renderBackground( context)
	renderRocket( context, getRocket(store) )

	requestAnimationFrame(draw)
}

draw()
////////////////////////////////////////////////////////////////////////////////
