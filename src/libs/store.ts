export interface Action {
	payload?: any
	type: string
}

// export interface ActionT<U> {
// 	payload?: any
// 	type: U
// }

export interface Reducer<T> {
	( state: T | undefined, action: Action ): T
}

// export interface Reducer<T, U> {
// 	( state: T, action: ActionT<U> ): T
// }

export interface ReducerMap {
	[ key: string ]: Reducer<any>
}

// export interface Selector<T> {
// 	( s: Store ): T
// }

export interface Mapable {
	[ key: string ]: any
}

export type Store = Mapable
// export type Store = number | string | Array<any> | Mapable

// actions /////////////////////////////////////////////////////////////////////
interface ActionCreator {
	(payload?: any): Action
}

export function createActionCreator ( type: string ): ActionCreator {
	return function ( payload?: any ): Action {
		return {
			type,
			payload
		}
	}
}

type ActionKey = string | ActionCreator

export function handleAction (
	actionKey: ActionKey,
	reducer: Reducer<any>,
	defaultValue?: any,
): Reducer<any> {
	const typeMatch = typeof actionKey === 'function'
		? actionKey().type
		: actionKey

	return function (state = defaultValue, action: Action) {
		if(action.type === typeMatch) {
			return reducer(state, action)
		}

		return state
	}
}

type ActionHandlerSpec = [ActionKey, Reducer<any>]

export function handleActions (
	specs: ActionHandlerSpec[],
	defaultValue: any,
): Reducer<any> {
	const reducers = specs.map(
		([action, reducer]) => handleAction(action, reducer, defaultValue)
	)
	return combineInSeries(...reducers)
}
////////////////////////////////////////////////////////////////////////////////

// reducers ////////////////////////////////////////////////////////////////////
export function combineInParallel ( reducerMap: ReducerMap ): Reducer<ReducerMap> {
	const sliceNames = Object.keys(reducerMap)

	return function reduceInParallel (state: Mapable = {}, action: Action ): Mapable {
		function createSlices (state: Mapable, sliceName: string): Mapable {
			const sliceState = state[sliceName]
			const reducer = reducerMap[sliceName]
			const nextSliceState = reducer(sliceState, action)

			if( nextSliceState == sliceState ) return state

			return {
				...state,
				[sliceName]: nextSliceState
			}
		}

		return sliceNames.reduce(createSlices, state)
	}
}

export function combineInSeries (...reducers: Reducer<any>[]): Reducer<any> {
	return function reduceSequencially ( state: any, action: Action ): Store {
		function serialCombine (state: Store, reducer: Reducer<any>) {
			return reducer(state, action)
		}

		return reducers.reduce(serialCombine, state)
	}
}

// create the store, get the helpers ///////////////////////////////////////////
export interface ClearNotification {
	(): void
}

export interface Dispatch {
	( a: Action ): void
}

export interface GetState<T> {
	(): T
}

export interface Listener {
	(s: Store): void
}

export interface Notify {
	( f: Function, b?: boolean ): ClearNotification
}

export function createStore2<T> (
	rootReducer: Reducer<any>
): [GetState<T>, Dispatch, Notify] {
	let state: T
	let subscriptions: Function[] = []

	// function bindToDispatch (actionCreator: ActionCreator) {
	// 	const action = 
	// 	return dispatch( actionCreator() )
	// }

	function dispatch(action: Action): void {
// console.groupCollapsed(`dispatch -> ${action.type}`)
// console.log(`old state`, state)
// console.log(`action`, action)
		state = rootReducer(state, action)
// console.log(`new state`, state)
// console.groupEnd()
		subscriptions.forEach(subscripton => { subscripton(state) })
	}

	function getState (): T {
		return state
	}

	function notify (listener: Listener, shouldInvokeImmediate = true) {
		const length = subscriptions.push(listener)

		if( shouldInvokeImmediate ) {
			listener(state)
		}

		return function () {
			subscriptions = [
				...subscriptions.slice(0, length - 1),
				...subscriptions.slice(length)
			]
		}
	}

	const init: Action = { type: 'STORE/INITIALISE' }
	dispatch(init)
	return [getState, dispatch, notify]
}
////////////////////////////////////////////////////////////////////////////////