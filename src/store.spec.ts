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

const mockAction = { type: 'TEST/MOCK_ACTION' }

test('retured reducer applies source reducers in series', () => {
	const hopefullyInSeries = combineInSeries( generateOne, addOne )

	expect(hopefullyInSeries(42, mockAction)).toEqual(2)
})

test('returned reducer permits modifying state from a given start state', () => {
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

	expect(hopefullyInSeries(42, mockAction)).toEqual(51)
})

test('returned reducer operates on arbitrary reducers', () => {
	const hopefullyInSeries = combineInSeries( addOne, subtractOne, addOne, subtractOne )

	expect(hopefullyInSeries(42, mockAction)).toEqual(42)
})


