import {
	Action,
	createAction,
} from './store.js'

import {
	GameActions
} from './animate.js'

import * as Vectors from './libs/vectors.js'

////////////////////////////////////////////////////////////////////////////////
// One /////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

// actions /////////////////////////////////////////////////////////////////////
enum AsteroidActions {
	Add = 'ASTEROID/ADD',
}

export const addAsteroid = createAction(AsteroidActions.Add)

// reducer etc /////////////////////////////////////////////////////////////////
export interface Asteroid {
	// colour:
	// enabled: boolean
	points: Vectors.Vector2[]
	position: Vectors.Vector2
	velocity: Vectors.Vector2
}

function randomAsteroid (): Asteroid {
	const position = {
		x: random(800),
		y: random(600),
	}

	const velocity = {
		x: random(20, -10),
		y: random(20, -10),
	}

	const radius = random(80, 40)
	const points: Vectors.Vector2[] = []
	for( let angle = 0; angle < 360; angle += random( -10, 64 ) ) {
		const nextPoint = {
			x: radius + random( radius / 2, radius / -2 ),
			y: 0
		}
		points.push( Vectors.rotateByDegrees( angle, nextPoint ) )
	}

	return {
		points,
		position,
		velocity,
	}
}

function asteroid (state: Asteroid = randomAsteroid(), action: Action) {
	switch (action.type) {
		default:
			return state
	}
}

function random(max = 1, min = 0) {
	return Math.random() * max + min
}

export function renderAsteroid (
	context: CanvasRenderingContext2D,
	asteroid: Asteroid
): void {
	context.save();
	context.translate(asteroid.position.x, asteroid.position.y);
	context.strokeStyle = "#ffffff";
	context.lineWidth = 2;
	context.beginPath();

	for(var i = 0; i<asteroid.points.length; i++) {
		var p = asteroid.points[i];
		context.lineTo(p.x, p.y);
	}

	context.closePath();
	context.stroke();
	// context.fillStyle = asteroid.color;
	// context.fill();
	context.restore();
}

////////////////////////////////////////////////////////////////////////////////
// Many ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

export function asteroids (state: Asteroid[] = [], action: Action) {
	switch (action.type) {
		case GameActions.Initialise: {
			const rocks: Asteroid[] = []
			let count = 5
			while( count-- ) {
				const rock = asteroid(undefined, action)
				rocks.push( rock )
			}
			return rocks
		}

		default:
			return state
	}
}

// Asteroid = function (x,y,radius,color)
// {
// 	this.pos = new Vector2(x,y);
// 	this.vel = new Vector2(0,0);
// 	this.color = color || hsl( random(360), 10, random(30, 60) );
// 	this.points;

// 	this.enabled = true;

// 	// temp vector to calculate distance from circle in hitTest
// 	this.diff = new Vector2(0,0);

// 	this.reset = function (radius ) {
// 		this.points = [];
// 		this.radius = radius;

// 		var temp = new Vector2(radius, 0);

// 		for(var angle = 0; angle<360; angle+=random( 5, 97 )) {
// 			temp.reset(radius + random( -radius/2, radius/2 ) ,0);
// 			temp.rotate(angle);
// 			this.points.push(temp.clone());
// 		}


// 	};

// 	this.reset(radius);

// 	this.update = function(canvas) {

// 		this.pos.plusEq(this.vel);

// 		if(this.pos.x+this.radius < 0) this.pos.x = canvas.width+this.radius;
// 		else if (this.pos.x-this.radius > canvas.width) this.pos.x = -this.radius;

// 		if(this.pos.y+this.radius < 0) this.pos.y = canvas.height+this.radius;
// 		else if (this.pos.y-this.radius > canvas.height) this.pos.y = -this.radius;

// 	};

// 	this.draw = function(ctx) {
// 		ctx.save();
// 		ctx.translate(this.pos.x, this.pos.y);
// 		ctx.strokeStyle = "#ffffff";
// 		ctx.lineWidth = 2;
// 		ctx.beginPath();

// 		for(var i = 0; i<this.points.length; i++) {
// 			var p = this.points[i];
// 			ctx.lineTo(p.x, p.y);
// 		}

// 		ctx.closePath();
// 		// ctx.stroke();
// 		ctx.fillStyle = this.color;
// 		ctx.fill();
// 		ctx.restore();
// 	};

// 	this.hitTest = function(x,y) {

// 		this.diff.copyFrom(this.pos);
// 		this.diff.x-=x;
// 		this.diff.y-=y;

// 		//var distancesquared = (this.diff.x * this.diff.x) + (this.diff.y*this.diff.y);
// 		// now check built in vector function
// 		// then use optimised version

// 		return ( this.diff.isMagLessThan(this.radius));

// 	};

// };