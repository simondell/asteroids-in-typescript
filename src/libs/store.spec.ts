import {
	BaseAction,
	combineInParallel,
	combineInSeries,
	createStore,
	Mapable,
	pipe,
} from './store'

function generateOne (state = 1, action: BaseAction) {
	return 1
}

function addOne (state = 0, action: BaseAction) {
	return state + 1
}

function subtractOne (state = 0, action: BaseAction) {
	return state - 1
}

function addOrSubtractOne (state = 0, action: BaseAction) {
	switch (action.type) {
		case 'TEST/ADD':
			return state + 1
		case 'TEST/SUBTRACT':
			return state - 1
		default:
			return state
	}
}

function toggleFlag (state = false, action: BaseAction) {
	if(action.type === 'TEST/TOGGLE') {
		return !state
	}

	return state
}

const mockAction = { type: 'TEST/MOCK_ACTION' }
const initAction = { type: 'TEST/INIT' }

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

describe('`createStore()`', () => {
	test('applies the reducer to generate initial state', () => {
		const [getState] = createStore(addOrSubtractOne, initAction)
		expect(getState()).toEqual(0)
	})

	test('maintains state', () => {
		const [getState, dispatch] = createStore(addOrSubtractOne, initAction)
		const add = { type: 'TEST/ADD' }

		dispatch(add)
		dispatch(add)

		expect(getState()).toEqual(2)
	})

	describe('notify/unsubscribe', () => {
		test('unsubscribing an earlier listener does not break unsubscribing a later one', () => {
			const [, dispatch, notify] = createStore(addOrSubtractOne, initAction)

			const clearFirst = notify(() => {}, false)
			const seenBySecond: number[] = []
			const clearSecond = notify(state => { seenBySecond.push(state) }, false)

			clearFirst()
			clearSecond()

			dispatch({ type: 'TEST/ADD' })

			expect(seenBySecond).toEqual([])
		})

		test('a listener that is still subscribed keeps receiving updates', () => {
			const [, dispatch, notify] = createStore(addOrSubtractOne, initAction)

			const seen: number[] = []
			notify(state => { seen.push(state) }, false)

			dispatch({ type: 'TEST/ADD' })
			dispatch({ type: 'TEST/ADD' })

			expect(seen).toEqual([1, 2])
		})
	})
})

describe('`pipe()`', () => {
	const addOneStep = (state: number) => state + 1
	const double = (state: number) => state * 2

	test('applies steps left to right', () => {
		const transform = pipe(addOneStep, double)

		expect(transform(5)).toEqual(12)
	})

	test('works for a single step', () => {
		const transform = pipe(addOneStep)

		expect(transform(5)).toEqual(6)
	})

	test('returns state unchanged when given no steps', () => {
		const transform = pipe<number>()

		expect(transform(5)).toEqual(5)
	})
})
