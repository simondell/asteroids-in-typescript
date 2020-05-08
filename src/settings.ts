import {
	Action,
	createAction
} from './store.js'

// settings ////////////////////////////////////////////////////////////////////
export enum Speeds {
	Still, // 0
	Slow,  // 1
	Fast,  // 2
}

enum SettingsActions {
	Speed = 'DEV/SPEED',
	Stop = 'DEV/STOP'
}

// const setSpeed = createAction<SettingsActions.Speed, Speeds>(SettingsActions.Speed)
export const setSpeed = createAction(SettingsActions.Speed)
export const stopAnimation = createAction(SettingsActions.Stop)

export interface Settings {
	speed: Speeds
}

const devDefaults: Settings = {
	speed: Speeds.Fast,
}

export function settings (
	state = devDefaults,
	action: Action
): Settings {
	switch( action.type ) {
		case SettingsActions.Stop:
			return {
				speed: Speeds.Still
			}
		case SettingsActions.Speed:
			return {
				speed: action.payload
			}
		default:
			return state
	}
}
////////////////////////////////////////////////////////////////////////////////