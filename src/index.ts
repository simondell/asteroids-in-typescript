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

interface Rocket {
	angle: number
	position: Vector2
}

function renderRocket (context: CanvasRenderingContext2D, rocket: Rocket): void {
	context.save()
	context.translate(
		rocket.position.x,
		rocket.position.y
	)

	const rads = degreesToRadians( rocket.angle )
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
	Rocket: {
		angle: 0,
		position: {
			x: canvas.width / 2,
			y: canvas.height / 2,
		}
	}
}

renderRocket( context, state.Rocket )