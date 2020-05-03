const canvas = document.createElement( 'canvas' )
const context = canvas.getContext( '2d' )

canvas.width = 800
canvas.height = 600

document.body.appendChild( canvas )

context.strokeStyle = "#ffffff"
context.lineWidth = 2
context.fillStyle = 'rgb(15, 8, 50)'
context.fillRect( 0, 0, 800, 600 )

interface Vector2 {
	x: number
	y: number
}

interface Rocket {
	angle: number
	position: Vector2
}

function renderRocket (context: CanvasRenderingContext2D, rocket: Rocket): void {
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


// store ///////////////////////////////////////////////////////////////////////
interface Action {
	error?: Error
	payload?: any
	type: string
}

const defaultRocket = {
	angle: 60,
	position: {
		x: canvas.width / 2,
		y: canvas.height / 2,
	}
}

// interface Reducer<T> {
// 	state: any
// 	action: Action
// }

function rocket (
	state = defaultRocket,
	action?: Action
) {
	return state
}

// interface Selector<T> {
// 	(s: Store): T
// }

function getRocket (state: Store): Rocket {
	return state.rocket
}

const [store, dispatch] = createStore({ rocket })

interface ReducerMap {
	[key: string]: Function
}

interface Store {
	[key: string]: any
}

interface Dispatch {
	(a: Action): void
}

// naive `composeReducers`/`useReducer`

function createStore (reducerMap: {[key: string]: Function}): [Store, Dispatch] {
	const createAction: Action = { type: 'CREATE' }
	const sliceNames = Object.keys(reducerMap)
	const store = sliceNames.reduce(getDefaultState, {} as Store)

	return [store, dispatch]

	function getDefaultState (store: Object, sliceName: string): Object {
		return {
			...store,
			[sliceName]: reducerMap[sliceName](undefined, createAction)
		}
	}

	function dispatch(action: Action): void {
		sliceNames.forEach((sliceName: string) => {
			store[sliceName] = reducerMap[sliceName](store[sliceName], action)
		})
	}
}
////////////////////////////////////////////////////////////////////////////////

// controls ////////////////////////////////////////////////////////////////////
enum CONTROLS {
	LEFT = 37,
	// POWER = 81,
	RIGHT = 39,
	// SHOOT = 32,
	// UP = 38,
}

function onKeyDown (event: KeyboardEvent): void {
	switch(event.keyCode) {
		case CONTROLS.LEFT:
			dispatch({ type: 'ROTATE/LEFT' })
			break;
	}
}

document.addEventListener('keydown', onKeyDown)
////////////////////////////////////////////////////////////////////////////////

// game loop ///////////////////////////////////////////////////////////////////
function draw (): void {
	renderRocket( context, getRocket(store) )
}

const loop = requestAnimationFrame(draw)
////////////////////////////////////////////////////////////////////////////////
