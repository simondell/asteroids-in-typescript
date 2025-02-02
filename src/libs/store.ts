export interface Action {
	type: string
	payload?: any
}

export type Reducer<T> = ( state: T | undefined, action: Action ) => T

export interface ReducerMap {
	[ key: string ]: Reducer<any>
}

export interface Mapable {
	[ key: string ]: any
}

// export type Store = Mapable
// export type Store = number | string | Array<any> | Mapable

// actions /////////////////////////////////////////////////////////////////////
type ActionCreator = ( payload?: any ) => Action

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

type InitializedReducer<T> = (state: T, action: Action) => T

export function combineInSeries<T> ( ...reducers: InitializedReducer<T>[] ): InitializedReducer<T> {
	return function reduceSequencially ( state: T, action: Action ): T {
		function serialCombine (state: T, reducer: InitializedReducer<T>) {
			return reducer(state, action)
		}

		return reducers.reduce(serialCombine, state)
	}
}

// create the store, get the helpers ///////////////////////////////////////////
type ClearNotification = () => void
type Listener<T> = ( state: T ) => void
type GetState<T> = () => T
export type Dispatch = ( action: Action ) => void
type Notify<T> = ( listener: Listener<T>, shouldInvokeImmediate?: boolean ) => ClearNotification

type StoreAPI<T> = [ GetState<T>, Dispatch, Notify<T> ]

export function createStore<T>( rootReducer: Reducer<T> ): StoreAPI<T>
{
	let state: T
	let listeners: Listener<T>[] = []

	function dispatch( action: Action ): void {
		state = rootReducer( state, action )
		listeners.forEach( listener => { listener( state ) } )
	}

	function getState (): T {
		return state
	}

	function notify ( listener: Listener<T>, shouldInvokeImmediate = true ){
		const length = listeners.push( listener )

		if( shouldInvokeImmediate ) {
			listener( state )
		}

		return function () {
			listeners = [
				...listeners.slice( 0, length - 1 ),
				...listeners.slice( length )
			]
		}
	}

	const init: Action = { type: 'STORE/INITIALISE' }
	dispatch( init )
	return [ getState, dispatch, notify ]
}
////////////////////////////////////////////////////////////////////////////////