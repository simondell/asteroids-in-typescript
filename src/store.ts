export interface Action {
	error?: Error
	payload?: any
	type: string
}

export interface Dispatch {
	( a: Action ): void
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


// naive `composeReducers`/`useReducer`
export function createStore ( reducerMap: ReducerMap ): [Store, Dispatch] {
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
