import {
	Action,
	combineInParallel,
	combineInSeries,
	createStore2,
	handleAction,
	handleActions,
	Mapable,
} from './store'

function identity<T> (state: T | null = null, action: Action ): T | null {
	return state
}

function noopReducer (state: void = undefined, action: Action ): void {
	return
}

function generateOne (state = 1, action: Action ) {
	return 1
}

function addOne (state = 0, action: Action ) {
	return state + 1
}

function addTwo (state = 0, action: Action ) {
	return state + 2
}

function subtractOne (state = 0, action: Action ) {
	return state - 1
}

function addOrSubtractOne (state = 0, action: Action ) {
	switch (action.type) {
		case 'TEST/ADD':
			return state + 1
		case 'TEST/SUBTRACT':
			return state - 1
		default:
			return state
	}
}

function toggleFlag (state = false, action: Action ) {
	if(action.type === 'TEST/TOGGLE') {
		return !state
	}

	return state
}

const mockAction = { type: 'TEST/MOCK_ACTION' }

describe('`combineInSeries()`', () => {
	test('retured reducer applies source reducers in series', () => {
		const hopefullyInSeries = combineInSeries( generateOne, addOne )

		expect(hopefullyInSeries(42, mockAction)).toEqual(2)
	})

	test('returned reducer calls each reducer with state from the previous one', () => {
		const hopefullyInSeries = combineInSeries(addOne, addOne)

		expect(hopefullyInSeries(42, mockAction)).toEqual(44)
	})

	test('returned reducer works for arbitrary number of reducers', () => {
		const hopefullyInSeries = combineInSeries(
			addOne,
			addOne,
			addOne,
			addOne,
			addOne,
			addOne,
			addOne,
			addOne,
			addOne,
		)

		expect(hopefullyInSeries(33, mockAction)).toEqual(42)
	})

	test('returned reducer operates on arbitrary reducers', () => {
		const hopefullyInSeries = combineInSeries(
			addOne,
			subtractOne,
			addOne,
			subtractOne,
			generateOne,
		)

		expect(hopefullyInSeries(42, mockAction)).toEqual(1)
	})

	test('returned reducer calls each supplied reducer with the previous state and the action', () => {
		const hopefullyInSeries = combineInSeries(
			generateOne,
			addOne,
			subtractOne,
			addOrSubtractOne,
			addOrSubtractOne,
		)
		const add = { type: 'TEST/ADD' }

		expect(hopefullyInSeries(42, add)).toEqual(3)
	})
})

describe('`combineInParallel()`', () => {
	describe('returned reducer calls all the slice reducers', () => {
		const reducer1Spy = jest.fn()
		const reducer2Spy = jest.fn()
		const action = { type: 'TEST/PARALLEL' }

		beforeAll(() => {
			const hopefullyInParallel = combineInParallel({
				slice1: reducer1Spy,
				slice2: reducer2Spy,
			})

			hopefullyInParallel(undefined, action)
		})

		test('once', () => {
			expect(reducer1Spy).toHaveBeenCalledTimes(1)
			expect(reducer2Spy).toHaveBeenCalledTimes(1)
		})

		test('with their state and action', () => {
			expect(reducer1Spy).toHaveBeenCalledWith(undefined, action)
			expect(reducer2Spy).toHaveBeenCalledWith(undefined, action)
		})
	})

	test('returned reducer returns updated state', () => {
		const hopefullyInParallel = combineInParallel({
			someFlag: toggleFlag,
			someOtherFlag: toggleFlag,
			someCounter: addOrSubtractOne,
		})

		const initialState: Mapable = {
			someFlag: true,
			someOtherFlag: true,
			someCounter: 41,
		}

		let nextState

		nextState = hopefullyInParallel(initialState, { type: 'TEST/TOGGLE' })
		expect(nextState).toEqual({
			someFlag: false,
			someOtherFlag: false,
			someCounter: 41,
		})

		nextState = hopefullyInParallel(nextState, { type: 'TEST/ADD' })
		expect(nextState).toEqual({
			someFlag: false,
			someOtherFlag: false,
			someCounter: 42,
		})
	})
})

describe('`createStore2()`', () => {
	test('applies the reducer to generate initial state', () => {
		const [getState] = createStore2(addOrSubtractOne) 
		expect(getState()).toEqual(0)
	})

	test('maintains state', () => {
		const [getState, dispatch] = createStore2(addOrSubtractOne) 
		const add = { type: 'TEST/ADD' }

		dispatch(add)
		dispatch(add)

		expect(getState()).toEqual(2)
	})
})

describe('`handleAction()` creates reducers...', () => {
	test('which use their default value when called with `undefined`', () => {
		const type = 'TEST/HANDLE_ACTION'

		const reducer = handleAction(type, identity, 23)

		expect(reducer(undefined, { type })).toEqual(23)
	})

	test('which use the current state, or the default value, when passed an action they don\'t handle', () => {
		const typeHandled = 'TEST/HANDLE_ACTION'
		const typeUnhandled = 'TEST/UNHANDLED_ACTION'

		const reducer = handleAction(typeHandled, identity, 23)

		expect(reducer(undefined, { type: typeUnhandled })).toEqual(23)
		expect(reducer(42, { type: typeUnhandled })).toEqual(42)
	})

	test('which applies the specified reducer when called with the recognised action', () => {
		const type = 'TEST/HANDLE_ACTION'

		const reducer = handleAction(type, addOne, 23)

		expect(reducer(41, { type })).toEqual(42)
	})

	test('when passed an actionCreator, which behave as when passed a type string', () => {
		const actionCreator = () => ({ type: 'TEST/HANDLE_ACTION' })

		const reducer = handleAction(actionCreator, addOne, 41)

		expect(reducer(undefined, actionCreator())).toEqual(42)
	})
})

describe('`handleActions()` creates reducers... ', () => {
	test('... from a map of types to reducers', () => {
		const typeOne = 'TEST/HANDLE_ACTIONS_ONE'
		const typeTwo = 'TEST/HANDLE_ACTIONS_TWO'

		const reducer = handleActions([
			[typeOne, addOne],
			[typeTwo, addTwo],
		], 23)

		expect(reducer(undefined, { type: 'TEST/UNHANDLED' })).toEqual(23)
		expect(reducer(undefined, { type: typeOne })).toEqual(24)
		expect(reducer(undefined, { type: typeTwo })).toEqual(25)
	})
})
