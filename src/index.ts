const canvas = document.createElement( 'canvas' )
const context = canvas.getContext( '2d' )

canvas.width = 800
canvas.height = 600

document.body.appendChild( canvas )

context.strokeStyle = "#ffffff"
context.lineWidth = 2
context.fillStyle = 'rgb(15, 8, 50)'
context.fillRect( 0, 0, 800, 600 )

interface Vector2 {
	x: number
	y: number
}

interface Ship {
	angle: number
	position: Vector2
}

function renderShip(context: CanvasRenderingContext2D, ship: Ship): void {
	context.save()
	context.translate(
		ship.position.x,
		ship.position.y
	)

	const rads = degreesToRadians( ship.angle )
	context.rotate( rads )

	context.strokeStyle = "#fff"
	context.lineWidth = 2

	context.beginPath()
	context.moveTo( -10, -10 )
	context.lineTo( -10, 10 )
	context.lineTo( 14, 0 )
	context.closePath()
	context.stroke()

	context.restore()
}

function degreesToRadians (angle: number): number {
	return angle * Math.PI / 180
}

const state = {
	ship: {
		angle: 0,
		position: {
			x: canvas.width / 2,
			y: canvas.height / 2,
		}
	}
}

renderShip( context, state.ship )