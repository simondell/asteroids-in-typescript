import {
	Directions
} from './controls.js'

import {
	Action,
	createAction,
	Store,
} from './store.js'

import {
	degreesToRadians,
	Vector2,
} from './libs/vectors.js'

// actions /////////////////////////////////////////////////////////////////////
enum rocketActions {
	ROTATE = 'ROCKET/ROTATE',
}

export const turnRocket = createAction(rocketActions.ROTATE)

// reducer etc /////////////////////////////////////////////////////////////////
export interface Rocket {
	angle: number
	position: Vector2
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

// render //////////////////////////////////////////////////////////////////////
export function renderRocket (
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
