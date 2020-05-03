const canvas = document.createElement( 'canvas' )
const context = canvas.getContext( '2d' )

canvas.width = 800
canvas.height = 600

document.body.appendChild( canvas )

context.strokeStyle = "#ffffff"
context.lineWidth = 2
context.fillStyle = 'rgb(15, 8, 50)'
context.fillRect( 0, 0, 800, 600 )
