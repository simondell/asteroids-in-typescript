export interface Action {
	error?: Error
	payload?: any
	type: string
}

export interface ReducerMap {
	[key: string]: Function
}

export interface Store {
	[key: string]: any
}

export interface Dispatch {
	(a: Action): void
}

// TODO: delete these or work out how to better type Reducers and Selectors
// export interface Reducer<T> {
// 	state: any
// 	action: Action
// }

// export interface Selector<T> {
// 	(s: Store): T
// }

// naive `composeReducers`/`useReducer`
export function createStore (reducerMap: {[key: string]: Function}): [Store, Dispatch] {
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
