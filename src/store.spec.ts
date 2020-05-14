import {
	Action,
	combineInSeries,
} from './store'

function generateOne (state: number, action: Action ) {
	return 1
}

function addOne (state: number, action: Action ) {
	return state + 1
}

function subtractOne (state: number, action: Action ) {
	return state - 1
}

function addOrSubtractOne (state: number, action: Action ) {
	switch (action.type) {
		case 'TEST/ADD':
			return state + 1
		case 'TEST/SUBTRACT':
			return state - 1
		default:
			return state
	}
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


