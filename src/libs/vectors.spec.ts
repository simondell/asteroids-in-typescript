import {
	add
} from './vectors'

test('should add x and y coords of two Vector2s', () => {
	const v1 = { x: 23, y: 5 }
	const v2 = { x: -19, y: -3 }

	const sum = add(v1, v2)

	expect(sum).toEqual({ x: 4, y: 2 })
})