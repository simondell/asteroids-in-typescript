export interface Action {
	payload?: any
	type: string
}

export interface ActionT {
	payload?: any
	type: Enumerator
}

export interface Dispatch {
	( a: Action ): void
}

export interface Notify {
	( f: Function, b?: boolean ): ClearNotification
}

export interface ClearNotification {
	(): void
}

export interface Reducer<T> {
	( state: T, action: Action ): T
}

export interface ReducerMap {
	[ key: string ]: Reducer<any>
}

export interface Selector<T> {
	( s: Store ): T
}

export interface Store {
	[ key: string ]: any
}

export function createAction ( type: string ): Function {
	return function ( payload?: any ): Action {
		return {
			type,
			payload
		}
	}
}

// naive `composeReducers`/`useReducer`
export function createStore (
	reducerMap: ReducerMap
): [Store, Dispatch, Notify] {
	const init: Action = { type: 'STORE/INITIALISE' }
	const sliceNames = Object.keys(reducerMap)

	const store = sliceNames.reduce(getDefaultState, {} as Store)
	let subscriptions: Function[] = []

	function getDefaultState (store: Object, sliceName: string): Object {
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
