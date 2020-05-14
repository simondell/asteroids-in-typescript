import {
	Action,
	combineInParallel,
	combineInSeries,
	Mapable,
} from './store'

function generateOne (state = 1, action: Action ) {
	return 1
}

function addOne (state = 0, action: Action ) {
	return state + 1
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

describe('combineInSeries', () => {
	test('retured reducer applies source reducers in series', () => {
		const hopefullyInSeries = combineInSeries( generateOne, addOne )

		expect(hopefullyInSeries(42, mockAction)).toEqual(2)
	})

	test('returned reducer calls each reducer with state from the previous one', () => {
		const hopefullyInSeries = combineInSeries( addOne, addOne )

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

describe('combineInParallel', () => {
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
