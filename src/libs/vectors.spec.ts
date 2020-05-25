import {
	add,
	equal,
	magnitude,
	subtract,
} from './vectors'

test('add x and y coords of two Vector2s', () => {
	const v1 = { x: 23, y: 5 }
	const v2 = { x: -19, y: -3 }

	const sum = add(v1, v2)

	expect(sum).toEqual({ x: 4, y: 2 })
})

test('assert two Vector2s equal', () => {
	const v1 = { x: 23, y: 5 }
	const v2 = { x: -19, y: -3 }
	const v3 = { x: -19, y: -3 }

	expect(equal(v1, v2)).toEqual(false)
	expect(equal(v2, v3)).toEqual(true)
})

test.each([
	[{ x: 23, y: 0 }, 23],
	[{ x: 3, y: -4 }, 5]
])(
	'give the magnitude of %o as %n',
	(example, expected) =>
	{
		expect(magnitude(example)).toEqual(expected)
	}
)

test.each([
	[{ x: 23, y: 0 }, { x: 1, y: 1 }, { x: 22, y: -1 }],
	[{ x: 23, y: 0 }, { x: 42, y: 5 }, { x: -19, y: -5 }]
])(
	'calculate the difference of %o and %o is %o',
	(v1, v2, expected) =>
	{
		expect(subtract(v1, v2)).toEqual(expected)
	}
)

