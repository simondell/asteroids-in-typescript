ShipMoving = function(x,y) {


	this.pos = new Vector2(x,y);
	this.angle = 0;
	this.vel = new Vector2(0,0);
	var temp = new Vector2(0,0);

	this.thrustPower = 0.15;
	this.rotateSpeed = 2;

	this.update = function() {
		this.pos.plusEq(this.vel);

	};

	this.thrust = function( extraPower ) {

		temp.reset((extraPower)? this.thrustPower * 3: this.thrustPower, 0);

		temp.rotate(this.angle);
		this.vel.plusEq(temp);

	};

	this.rotateLeft = function( extraPower ) {
		this.angle -= (extraPower)? this.rotateSpeed * 3: this.rotateSpeed;
	};
	this.rotateRight = function( extraPower ) {
		this.angle += (extraPower)? this.rotateSpeed * 3: this.rotateSpeed;
	};


	// c = canvas context
	this.draw = function(c, thrusting) {

		c.save();
		c.translate(this.pos.x, this.pos.y);
		c.rotate(this.angle * Vector2Const.TO_RADIANS);

		c.strokeStyle = "#fff";
		c.lineWidth = 2;

		c.beginPath();
		c.moveTo(-10, -10);
		c.lineTo(-10, 10);
		c.lineTo(14, 0);
		c.closePath();
		c.stroke();


		c.restore();

	};


};