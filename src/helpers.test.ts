import { removeAt } from './game'

describe(
	'removeAt',
	() =>
	{
		test.each([
			[[1,2,3,4,5,6], 3, [1,2,3,5,6]],
			[[true, false], 0, [false]],
			[[{ foo: 'foo'}, { foo: 'bar' }, { foo: 'qux' }], 0, [{ foo: 'bar' }, { foo: 'qux' }]]
		])(
			'returns an array with the specified item removed',
			(source, index, expected) =>
			{
				const before = [1,2,3,4,5,6]

				expect( removeAt( index, source ) ).toEqual( expected )
			}
		)
	}
)