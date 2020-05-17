import {
	add,
	equal
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