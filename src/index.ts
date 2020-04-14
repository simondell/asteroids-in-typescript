// import './index.css'

// constants
var UP = 38;
var LEFT = 37;
var RIGHT = 39;
var POWER = 81;
var SHOOT = 32;

var controls = [UP, LEFT, RIGHT, POWER ];
var actions = [SHOOT];

var canvas;
var c; // c is the canvas 2D context

// flags and "global" values
var halfWidth;
var halfHeight;
var thrusting = false;
var rotateLeft = false;
var rotateRight = false;
var power = false;

// game objects
var bullets;
var ship;
var asteroids = [];
var	spareAsteroids = [];

function setup() {
	frameRate = 60;

	setupCanvas();
	halfWidth = canvas.width/2;
	halfHeight = canvas.height/2;
	bullets = []
	ship = new ShipMoving(halfWidth, halfHeight);

	for(var i = 0; i<5; i++) {
		asteroids[i] = new Asteroid(random(0,canvas.width), random(0, canvas.height), 50);
		asteroids[i].vel.reset(2,0);
		asteroids[i].vel.rotate(random(360));
	}
}

function draw() {

	c.clearRect(0,0,canvas.width, canvas.height);

	if(thrusting) ship.thrust( power );
	if(rotateLeft) ship.rotateLeft( power );
	if(rotateRight) ship.rotateRight( power );

	// DRAW SHIP
	//
	ship.update();
	with(ship.pos) {
		if(x<0) x = canvas.width;
		else if(x>canvas.width) x = 0;
		if(y<0) y = canvas.height;
		else if (y>canvas.height) y = 0;
	}
	ship.draw(c, thrusting);

	// DRAW ASTEROIDS
	for(var i = 0, asteroid;  i < asteroids.length; i++) {
		asteroid = asteroids[i];
		if(!asteroid.enabled) continue;

		detectCollisions( asteroid );

		asteroid.update(canvas);
		asteroid.draw(c);
	}

	// DRAW BULLETS
	for (var i=0; i<bullets.length;i++) {
		bullet = bullets[i];
		bullet.update();
		bullet.draw(c);
	}
}

function detectCollisions ( asteroid ) {
	for( var i = 0, bullet; i < bullets.length; i++ ) {
		bullet = bullets[i];

		if( asteroid.hitTest( bullet.pos.x, bullet.pos.y) ) {
			if(asteroid.radius<15) {
				asteroid.enabled = false;
				spareAsteroids.push(asteroid);

			} else {
				asteroid.radius = asteroid.radius/2;

				var newasteroid = makeNewAsteroid(asteroid.pos.x, asteroid.pos.y, asteroid.radius);
				newasteroid.vel.copyFrom(asteroid.vel);

				// change vels so that they seem to rebound off each other.
				newasteroid.vel.rotate(-30);
				asteroid.vel.rotate(30);
			}
		}
	}
}

function makeNewAsteroid(x,y,radius) {
	var newasteroid;

	if(spareAsteroids.length>0) {
		newasteroid = spareAsteroids.pop();
		newasteroid.pos.reset(x,y);
		newasteroid.radius = radius;

		newasteroid.enabled = true;
	} else {
		newasteroid = new Asteroid(x,y,radius);
		asteroids.push(newasteroid);
	}

	return newasteroid;
}

function makeBullet() {
	var bulletvel = new Vector2(10,0);
	var bulletpos = ship.pos.clone();
	bulletvel.rotate(ship.angle);
	var offset = new Vector2(11,0);
	offset.rotate(ship.angle);
	bulletpos.plusEq(offset);

	var bullet = new Bullet(bulletpos.x, bulletpos.y, bulletvel.x, bulletvel.y);
	bullets.push(bullet);
	// bulletSound.play();
}

function onKeyDown(e) {
	if( controls.some( function (control) { return control == e.keyCode; } ) ) {
		e.preventDefault();
		processControl( e.keyCode, true );
	}
}

function onKeyUp(e) {
	if( controls.some( hasIn, e.keyCode ) ) {
		e.preventDefault();
		processControl( e.keyCode, false );
	} else if ( actions.some( hasIn, e.keyCode ) ) {
		e.preventDefault();
		processAction( e.keyCode );
	}
}

function hasIn (control) {
	return control == this
}

function processControl ( key, action ) {
	switch( key ) {
		case UP: thrusting = action; break;
		case LEFT:  rotateLeft = action;  break;
		case RIGHT: rotateRight = action;  break;
		case POWER: power = action;  break;
	}
}

function processAction ( key, action ) {
	switch( key ) {
		case SHOOT: makeBullet(); break;
	}
}

function setupCanvas() {
	canvas = document.createElement( 'canvas' );
	c = canvas.getContext( '2d' );
	canvas.width = 800;
	canvas.height = 600;
	document.body.appendChild( canvas );

	c.strokeStyle = "#ffffff";
	c.lineWidth = 2;
}
