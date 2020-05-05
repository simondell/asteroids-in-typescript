import {
	Action,
	createAction,
	createStore,
	Dispatch,
	Store,
} from './store.js'

// const canvas = document.createElement( 'canvas' )
const canvas = (document.getElementById('screen')) as HTMLCanvasElement
const context = canvas.getContext( '2d' )

canvas.width = 800
canvas.height = 600

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
	ROTATE = 'ROCKET/ROTATE',
}

const turnRocket = createAction(rocketActions.ROTATE)

function rocket (
	state = defaultRocket,
	action: Action
){
console.log(`rocket action`, action)
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

function getRocket (store: Store): Rocket {
	return store.rocket
}
////////////////////////////////////////////////////////////////////////////////

// controls ////////////////////////////////////////////////////////////////////
enum Directions {
	NEUTRAL,
	LEFT,
	RIGHT,
}

interface Controls {
	direction: Directions
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

function getDirection (store: Store) {
	return store.controls.direction
}
////////////////////////////////////////////////////////////////////////////////

// settings ////////////////////////////////////////////////////////////////////
enum Speeds {
	Still,
	Slow,
	Fast,
}

interface Settings {
	speed: Speeds
}

enum SettingsActions {
	Speed = 'DEV/SPEED',
	Stop = 'DEV/STOP'
}

const setSpeed = createAction(SettingsActions.Speed)
const stopAnimation = createAction(SettingsActions.Stop)

const devDefaults = {
	speed: Speeds.Fast,
}

function settings (
	state = devDefaults,
	action: Action
): Settings {
	switch( action.type ) {
		case SettingsActions.Stop:
			return {
				speed: Speeds.Still
			}
		default:
			return state
	}
}

function getSpeed (store: Store) {
	return store.settings.speed
}
////////////////////////////////////////////////////////////////////////////////

// store ///////////////////////////////////////////////////////////////////////
const [store, dispatch] = createStore({
	controls,
	rocket,
	settings,
})
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
console.log('event.keyCode', event.keyCode)
	const direction = getDirection(store)
	switch( event.keyCode ) {
		case KEYS.LEFT:
			if(direction === Directions.NEUTRAL) {
				dispatch( setDirection( Directions.LEFT ) )
			}
			break;
		case KEYS.RIGHT:
			if(direction === Directions.NEUTRAL) {
				dispatch( setDirection( Directions.RIGHT ) )
			}
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

// dev controls ///////////////////////////////////////////////////////////
const stop = document.getElementById( 'stop' ) as HTMLButtonElement
stop.addEventListener('click', event => {
	event.preventDefault()
	dispatch(stopAnimation())
})

const speeds = document.getElementById('speeds') as HTMLFieldSetElement
speeds.addEventListener('click', event => {
	const speed = (speeds.querySelector('[type="radio"]:checked') as HTMLInputElement).value
	dispatch(setSpeed(speed))
})
////////////////////////////////////////////////////////////////////////////////


// game loop ///////////////////////////////////////////////////////////////////
function draw (): void {
	const direction = getDirection(store)
	const rocket = getRocket(store)

	if(!(direction === Directions.NEUTRAL)) {
		dispatch( turnRocket(direction) )
	}

	renderBackground( context)
	renderRocket( context, rocket )

	const speed = getSpeed(store)

	switch( speed ) {
		case Speeds.Fast:
			requestAnimationFrame(draw)
			break
		case Speeds.Slow:
			setTimeout(draw, 700)
			break
		default:
			return
	}
}

draw()
////////////////////////////////////////////////////////////////////////////////
