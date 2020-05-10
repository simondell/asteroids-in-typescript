export interface Action {
	payload?: any
	type: string
}

// export interface ActionT<U> {
// 	payload?: any
// 	type: U
// }

export interface Reducer<T> {
	( state: T, action: Action ): T
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

interface Mapable {
	[ key: string ]: any
}

export type Store = Mapable
// export type Store = number | string | Array<any> | Mapable

export function createAction ( type: string ): Function {
	return function ( payload?: any ): Action {
		return {
			type,
			payload
		}
	}
}

function combineInParallel (
	reducerMap: ReducerMap
): Reducer<ReducerMap> {
	return function reduceInParallel ( state: Mapable, action: Action ): ReducerMap {
		const sliceNames = Object.keys(reducerMap)

		function reduceSlices (state: Mapable, sliceName: string): Mapable {
			const sliceState = state[sliceName]
			const reducer = reducerMap[sliceName]
			const nextSliceState = reducer(sliceState, action)

			if( nextSliceState == sliceState ) return state

			return {
				...state,
				[sliceName]: nextSliceState
			}
		}

		return sliceNames.reduce(reduceSlices, state)
	}
}

function combineInSeries (...reducers: Reducer<any>[] ): Reducer<any> {
	return function reduceInSeries ( state: Store, action: Action ): Store {
		function reduceReducers (state: Store, reducer: Reducer<any>) {
			return reducer(state, action)
		}

		return reducers.reduce(reduceReducers, state)
	}
}

// create the store, get the helpers ///////////////////////////////////////////
export interface ClearNotification {
	(): void
}

export interface Dispatch {
	( a: Action ): void
}

export interface GetState {
	(): Store
}

export interface Listener {
	(s: Store): void
}

export interface Notify {
	( f: Function, b?: boolean ): ClearNotification
}

export function createStore2 (
	rootReducer: Reducer<any>
): [GetState, Dispatch, Notify] {
	let state: any
	let subscriptions: Function[] = []

	// interface ActionCreator {
	// 	(a: string): Action
	// }

	// function bindToDispatch (actionCreator: ActionCreator) {
	// 	const action = 
	// 	return dispatch( actionCreator() )
	// }

	function dispatch(action: Action): void {
		state = rootReducer(state, action)
		subscriptions.forEach(subscripton => { subscripton(state) })
	}

	function getState (): Store {
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

	return [getState, dispatch, notify]
}
////////////////////////////////////////////////////////////////////////////////

// naive `composeReducers`/`useReducer`
export function createStore (
	reducerMap: ReducerMap
): [Mapable, Dispatch, Notify] {
	const init: Action = { type: 'STORE/INITIALISE' }
	const sliceNames = Object.keys(reducerMap)

	const store = sliceNames.reduce(getDefaultState, {} as Mapable)
	let subscriptions: Function[] = []

	function getDefaultState (store: Mapable, sliceName: string): Mapable {
		return {
			...store,
			[sliceName]: reducerMap[sliceName](undefined, init)
		}
	}

	function dispatch(action: Action): void {
		sliceNames.forEach((sliceName: string) => {
			const slice = store[sliceName]
			const reducer = reducerMap[sliceName]
			store[sliceName] = reducer(slice, action)
		})

// console.log(`dispatch`, action, store)
		subscriptions.forEach(subscripton => { subscripton(store) })
	}

	function notify (listener: Function, shouldInvokeImmediate = true) {
		const length = subscriptions.push(listener)

		if( shouldInvokeImmediate ) {
			listener(store)
		}

		return function () {
			subscriptions = [
				...subscriptions.slice(0, length - 1),
				...subscriptions.slice(length)
			]
		}
	}

	// function createAction ( type: string ): Function {
	// 	return function ( payload?: any ): void {
	// 		const action = {
	// 			type,
	// 			payload
	// 		}

	// 		dispatch(action)
	// }

	return [store, dispatch, notify]
}
