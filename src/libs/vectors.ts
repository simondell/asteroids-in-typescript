export interface Vector2 {
	x: number
	y: number
}

export function add ( v1: Vector2, v2: Vector2 ) {
	return {
		x: v1.x + v2.x,
		y: v1.y + v2.y,
	}
}

export function degreesToRadians (angle: number): number {
	return angle * Math.PI / 180
}

export function equal (v1: Vector2, v2: Vector2) {
	return v1.x == v2.x && v1.y == v2.y
}

export function magnitude ({ x, y }: Vector2 ): number {
	return Math.sqrt( (x * x) + (y * y) )
}

export function magnitudeSquared ({ x, y }: Vector2): number {
	return (x * x) + (y * y)
}

export function rotateByDegrees (degrees: number, vector: Vector2): Vector2 {
	return rotateByRadians( degreesToRadians( degrees ), vector)
}

export function rotateByRadians (radians: number, vector: Vector2): Vector2 {
	var cosRY = Math.cos( radians )
	var sinRY = Math.sin( radians )

	const x = (vector.x * cosRY) - (vector.y * sinRY)
	const y = (vector.x * sinRY) + (vector.y * cosRY)
	return { x, y }
}