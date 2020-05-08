import {
	Action,
	createAction,
	// Dispatch,
	Store,
} from './store.js'

// controls ////////////////////////////////////////////////////////////////////
export enum Directions {
	NEUTRAL,
	LEFT,
	RIGHT,
}

enum ControlsActions {
	SET_DIRECTION = 'CONTROLS/SET_DIRECTION'
}

export const setDirection = createAction(ControlsActions.SET_DIRECTION)

export interface Controls {
	direction: Directions
}

const defaultControls = {
	direction: Directions.NEUTRAL,
	// thrust: false,
	// shoot: false,
}

export function controls (
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
////////////////////////////////////////////////////////////////////////////////
