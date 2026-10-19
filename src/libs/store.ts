export interface BaseAction {
	type: string
}

export interface Reducer<T, A extends BaseAction = BaseAction> {
	( state: T | undefined, action: A ): T
}

export interface ReducerMap<A extends BaseAction = BaseAction> {
	[ key: string ]: Reducer<any, A>
}

export interface Mapable {
	[ key: string ]: any
}

export type Store = Mapable

// plain function composition, for steps that always run (no action to match against)
export type Step<T> = ( state: T ) => T

export function pipe<T> ( ...steps: Step<T>[] ): Step<T> {
	return function applySteps ( state: T ): T {
		return steps.reduce( ( nextState, step ) => step( nextState ), state )
	}
}

// reducers ////////////////////////////////////////////////////////////////////
export function combineInParallel<A extends BaseAction = BaseAction> (
	reducerMap: ReducerMap<A>
): Reducer<Mapable, A> {
	const sliceNames = Object.keys(reducerMap)

	return function reduceInParallel (state: Mapable = {}, action: A ): Mapable {
		function createSlices (state: Mapable, sliceName: string): Mapable {
			const sliceState = state[sliceName]
			const reducer = reducerMap[sliceName]
			const nextSliceState = reducer(sliceState, action)

			if( nextSliceState === sliceState ) return state

			return {
				...state,
				[sliceName]: nextSliceState
			}
		}

		return sliceNames.reduce(createSlices, state)
	}
}

export function combineInSeries<T, A extends BaseAction = BaseAction> (
	...reducers: Reducer<T, A>[]
): Reducer<T, A> {
	return function reduceSequencially ( state: T | undefined, action: A ): T {
		function serialCombine (state: T | undefined, reducer: Reducer<T, A>) {
			return reducer(state, action)
		}

		return reducers.reduce(serialCombine, state) as T
	}
}
////////////////////////////////////////////////////////////////////////////////

// create the store, get the helpers ///////////////////////////////////////////
export interface ClearNotification {
	(): void
}

export interface Dispatch<A extends BaseAction = BaseAction> {
	( a: A ): void
}

export interface GetState<T> {
	(): T
}

export interface Listener<T> {
	( s: T ): void
}

export interface Notify<T> {
	( f: Listener<T>, b?: boolean ): ClearNotification
}

export function createStore<T, A extends BaseAction = BaseAction> (
	rootReducer: Reducer<T, A>,
	initialAction: A,
): [GetState<T>, Dispatch<A>, Notify<T>] {
	let state: T
	let subscriptions: Listener<T>[] = []

	function dispatch(action: A): void {
		state = rootReducer(state, action)
		subscriptions.forEach(subscription => { subscription(state) })
	}

	function getState (): T {
		return state
	}

	function notify (listener: Listener<T>, shouldInvokeImmediate = true): ClearNotification {
		subscriptions.push(listener)

		if( shouldInvokeImmediate ) {
			listener(state)
		}

		return function clearNotification () {
			subscriptions = subscriptions.filter(subscription => subscription !== listener)
		}
	}

	dispatch(initialAction)
	return [getState, dispatch, notify]
}
////////////////////////////////////////////////////////////////////////////////
