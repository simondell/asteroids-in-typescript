/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

// import './index.css'
// constants
var UP = 38;
var LEFT = 37;
var RIGHT = 39;
var POWER = 81;
var SHOOT = 32;
var controls = [UP, LEFT, RIGHT, POWER];
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
var spareAsteroids = [];
function setup() {
    frameRate = 60;
    setupCanvas();
    halfWidth = canvas.width / 2;
    halfHeight = canvas.height / 2;
    bullets = [];
    ship = new ShipMoving(halfWidth, halfHeight);
    for (var i = 0; i < 5; i++) {
        asteroids[i] = new Asteroid(random(0, canvas.width), random(0, canvas.height), 50);
        asteroids[i].vel.reset(2, 0);
        asteroids[i].vel.rotate(random(360));
    }
}
function draw() {
    c.clearRect(0, 0, canvas.width, canvas.height);
    if (thrusting)
        ship.thrust(power);
    if (rotateLeft)
        ship.rotateLeft(power);
    if (rotateRight)
        ship.rotateRight(power);
    // DRAW SHIP
    //
    ship.update();
    with (ship.pos) {
        if (x < 0)
            x = canvas.width;
        else if (x > canvas.width)
            x = 0;
        if (y < 0)
            y = canvas.height;
        else if (y > canvas.height)
            y = 0;
    }
    ship.draw(c, thrusting);
    // DRAW ASTEROIDS
    for (var i = 0, asteroid; i < asteroids.length; i++) {
        asteroid = asteroids[i];
        if (!asteroid.enabled)
            continue;
        detectCollisions(asteroid);
        asteroid.update(canvas);
        asteroid.draw(c);
    }
    // DRAW BULLETS
    for (var i = 0; i < bullets.length; i++) {
        bullet = bullets[i];
        bullet.update();
        bullet.draw(c);
    }
}
function detectCollisions(asteroid) {
    for (var i = 0, bullet; i < bullets.length; i++) {
        bullet = bullets[i];
        if (asteroid.hitTest(bullet.pos.x, bullet.pos.y)) {
            if (asteroid.radius < 15) {
                asteroid.enabled = false;
                spareAsteroids.push(asteroid);
            }
            else {
                asteroid.radius = asteroid.radius / 2;
                var newasteroid = makeNewAsteroid(asteroid.pos.x, asteroid.pos.y, asteroid.radius);
                newasteroid.vel.copyFrom(asteroid.vel);
                // change vels so that they seem to rebound off each other.
                newasteroid.vel.rotate(-30);
                asteroid.vel.rotate(30);
            }
        }
    }
}
function makeNewAsteroid(x, y, radius) {
    var newasteroid;
    if (spareAsteroids.length > 0) {
        newasteroid = spareAsteroids.pop();
        newasteroid.pos.reset(x, y);
        newasteroid.radius = radius;
        newasteroid.enabled = true;
    }
    else {
        newasteroid = new Asteroid(x, y, radius);
        asteroids.push(newasteroid);
    }
    return newasteroid;
}
function makeBullet() {
    var bulletvel = new Vector2(10, 0);
    var bulletpos = ship.pos.clone();
    bulletvel.rotate(ship.angle);
    var offset = new Vector2(11, 0);
    offset.rotate(ship.angle);
    bulletpos.plusEq(offset);
    var bullet = new Bullet(bulletpos.x, bulletpos.y, bulletvel.x, bulletvel.y);
    bullets.push(bullet);
    // bulletSound.play();
}
function onKeyDown(e) {
    if (controls.some(function (control) { return control == e.keyCode; })) {
        e.preventDefault();
        processControl(e.keyCode, true);
    }
}
function onKeyUp(e) {
    if (controls.some(hasIn, e.keyCode)) {
        e.preventDefault();
        processControl(e.keyCode, false);
    }
    else if (actions.some(hasIn, e.keyCode)) {
        e.preventDefault();
        processAction(e.keyCode);
    }
}
function hasIn(control) {
    return control == this;
}
function processControl(key, action) {
    switch (key) {
        case UP:
            thrusting = action;
            break;
        case LEFT:
            rotateLeft = action;
            break;
        case RIGHT:
            rotateRight = action;
            break;
        case POWER:
            power = action;
            break;
    }
}
function processAction(key, action) {
    switch (key) {
        case SHOOT:
            makeBullet();
            break;
    }
}
function setupCanvas() {
    canvas = document.createElement('canvas');
    c = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);
    c.strokeStyle = "#ffffff";
    c.lineWidth = 2;
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQSx1QkFBdUI7QUFFdkIsWUFBWTtBQUNaLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNaLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUVmLElBQUksUUFBUSxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFFLENBQUM7QUFDekMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUV0QixJQUFJLE1BQU0sQ0FB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TUFBTTtJQUNwQyxRQUFRLEdBQUcsRUFBRztRQUNiLEtBQUssRUFBRTtZQUFFLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFBQyxNQUFNO1FBQ25DLEtBQUssSUFBSTtZQUFHLFVBQVUsR0FBRyxNQUFNLENBQUM7WUFBRSxNQUFNO1FBQ3hDLEtBQUssS0FBSztZQUFFLFdBQVcsR0FBRyxNQUFNLENBQUM7WUFBRSxNQUFNO1FBQ3pDLEtBQUssS0FBSztZQUFFLEtBQUssR0FBRyxNQUFNLENBQUM7WUFBRSxNQUFNO0tBQ25DO0FBQ0YsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFHLEdBQUcsRUFBRSxNQUFNO0lBQ25DLFFBQVEsR0FBRyxFQUFHO1FBQ2IsS0FBSyxLQUFLO1lBQUUsVUFBVSxFQUFFLENBQUM7WUFBQyxNQUFNO0tBQ2hDO0FBQ0YsQ0FBQztBQUVELFNBQVMsV0FBVztJQUNuQixNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBRSxRQUFRLENBQUUsQ0FBQztJQUM1QyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBRSxJQUFJLENBQUUsQ0FBQztJQUM5QixNQUFNLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUNuQixNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztJQUNwQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxNQUFNLENBQUUsQ0FBQztJQUVwQyxDQUFDLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQztJQUMxQixDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNqQixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIi8vIGltcG9ydCAnLi9pbmRleC5jc3MnXG5cbi8vIGNvbnN0YW50c1xudmFyIFVQID0gMzg7XG52YXIgTEVGVCA9IDM3O1xudmFyIFJJR0hUID0gMzk7XG52YXIgUE9XRVIgPSA4MTtcbnZhciBTSE9PVCA9IDMyO1xuXG52YXIgY29udHJvbHMgPSBbVVAsIExFRlQsIFJJR0hULCBQT1dFUiBdO1xudmFyIGFjdGlvbnMgPSBbU0hPT1RdO1xuXG52YXIgY2FudmFzO1xudmFyIGM7IC8vIGMgaXMgdGhlIGNhbnZhcyAyRCBjb250ZXh0XG5cbi8vIGZsYWdzIGFuZCBcImdsb2JhbFwiIHZhbHVlc1xudmFyIGhhbGZXaWR0aDtcbnZhciBoYWxmSGVpZ2h0O1xudmFyIHRocnVzdGluZyA9IGZhbHNlO1xudmFyIHJvdGF0ZUxlZnQgPSBmYWxzZTtcbnZhciByb3RhdGVSaWdodCA9IGZhbHNlO1xudmFyIHBvd2VyID0gZmFsc2U7XG5cbi8vIGdhbWUgb2JqZWN0c1xudmFyIGJ1bGxldHM7XG52YXIgc2hpcDtcbnZhciBhc3Rlcm9pZHMgPSBbXTtcbnZhclx0c3BhcmVBc3Rlcm9pZHMgPSBbXTtcblxuZnVuY3Rpb24gc2V0dXAoKSB7XG5cdGZyYW1lUmF0ZSA9IDYwO1xuXG5cdHNldHVwQ2FudmFzKCk7XG5cdGhhbGZXaWR0aCA9IGNhbnZhcy53aWR0aC8yO1xuXHRoYWxmSGVpZ2h0ID0gY2FudmFzLmhlaWdodC8yO1xuXHRidWxsZXRzID0gW11cblx0c2hpcCA9IG5ldyBTaGlwTW92aW5nKGhhbGZXaWR0aCwgaGFsZkhlaWdodCk7XG5cblx0Zm9yKHZhciBpID0gMDsgaTw1OyBpKyspIHtcblx0XHRhc3Rlcm9pZHNbaV0gPSBuZXcgQXN0ZXJvaWQocmFuZG9tKDAsY2FudmFzLndpZHRoKSwgcmFuZG9tKDAsIGNhbnZhcy5oZWlnaHQpLCA1MCk7XG5cdFx0YXN0ZXJvaWRzW2ldLnZlbC5yZXNldCgyLDApO1xuXHRcdGFzdGVyb2lkc1tpXS52ZWwucm90YXRlKHJhbmRvbSgzNjApKTtcblx0fVxufVxuXG5mdW5jdGlvbiBkcmF3KCkge1xuXG5cdGMuY2xlYXJSZWN0KDAsMCxjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG5cdGlmKHRocnVzdGluZykgc2hpcC50aHJ1c3QoIHBvd2VyICk7XG5cdGlmKHJvdGF0ZUxlZnQpIHNoaXAucm90YXRlTGVmdCggcG93ZXIgKTtcblx0aWYocm90YXRlUmlnaHQpIHNoaXAucm90YXRlUmlnaHQoIHBvd2VyICk7XG5cblx0Ly8gRFJBVyBTSElQXG5cdC8vXG5cdHNoaXAudXBkYXRlKCk7XG5cdHdpdGgoc2hpcC5wb3MpIHtcblx0XHRpZih4PDApIHggPSBjYW52YXMud2lkdGg7XG5cdFx0ZWxzZSBpZih4PmNhbnZhcy53aWR0aCkgeCA9IDA7XG5cdFx0aWYoeTwwKSB5ID0gY2FudmFzLmhlaWdodDtcblx0XHRlbHNlIGlmICh5PmNhbnZhcy5oZWlnaHQpIHkgPSAwO1xuXHR9XG5cdHNoaXAuZHJhdyhjLCB0aHJ1c3RpbmcpO1xuXG5cdC8vIERSQVcgQVNURVJPSURTXG5cdGZvcih2YXIgaSA9IDAsIGFzdGVyb2lkOyAgaSA8IGFzdGVyb2lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGFzdGVyb2lkID0gYXN0ZXJvaWRzW2ldO1xuXHRcdGlmKCFhc3Rlcm9pZC5lbmFibGVkKSBjb250aW51ZTtcblxuXHRcdGRldGVjdENvbGxpc2lvbnMoIGFzdGVyb2lkICk7XG5cblx0XHRhc3Rlcm9pZC51cGRhdGUoY2FudmFzKTtcblx0XHRhc3Rlcm9pZC5kcmF3KGMpO1xuXHR9XG5cblx0Ly8gRFJBVyBCVUxMRVRTXG5cdGZvciAodmFyIGk9MDsgaTxidWxsZXRzLmxlbmd0aDtpKyspIHtcblx0XHRidWxsZXQgPSBidWxsZXRzW2ldO1xuXHRcdGJ1bGxldC51cGRhdGUoKTtcblx0XHRidWxsZXQuZHJhdyhjKTtcblx0fVxufVxuXG5mdW5jdGlvbiBkZXRlY3RDb2xsaXNpb25zICggYXN0ZXJvaWQgKSB7XG5cdGZvciggdmFyIGkgPSAwLCBidWxsZXQ7IGkgPCBidWxsZXRzLmxlbmd0aDsgaSsrICkge1xuXHRcdGJ1bGxldCA9IGJ1bGxldHNbaV07XG5cblx0XHRpZiggYXN0ZXJvaWQuaGl0VGVzdCggYnVsbGV0LnBvcy54LCBidWxsZXQucG9zLnkpICkge1xuXHRcdFx0aWYoYXN0ZXJvaWQucmFkaXVzPDE1KSB7XG5cdFx0XHRcdGFzdGVyb2lkLmVuYWJsZWQgPSBmYWxzZTtcblx0XHRcdFx0c3BhcmVBc3Rlcm9pZHMucHVzaChhc3Rlcm9pZCk7XG5cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFzdGVyb2lkLnJhZGl1cyA9IGFzdGVyb2lkLnJhZGl1cy8yO1xuXG5cdFx0XHRcdHZhciBuZXdhc3Rlcm9pZCA9IG1ha2VOZXdBc3Rlcm9pZChhc3Rlcm9pZC5wb3MueCwgYXN0ZXJvaWQucG9zLnksIGFzdGVyb2lkLnJhZGl1cyk7XG5cdFx0XHRcdG5ld2FzdGVyb2lkLnZlbC5jb3B5RnJvbShhc3Rlcm9pZC52ZWwpO1xuXG5cdFx0XHRcdC8vIGNoYW5nZSB2ZWxzIHNvIHRoYXQgdGhleSBzZWVtIHRvIHJlYm91bmQgb2ZmIGVhY2ggb3RoZXIuXG5cdFx0XHRcdG5ld2FzdGVyb2lkLnZlbC5yb3RhdGUoLTMwKTtcblx0XHRcdFx0YXN0ZXJvaWQudmVsLnJvdGF0ZSgzMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIG1ha2VOZXdBc3Rlcm9pZCh4LHkscmFkaXVzKSB7XG5cdHZhciBuZXdhc3Rlcm9pZDtcblxuXHRpZihzcGFyZUFzdGVyb2lkcy5sZW5ndGg+MCkge1xuXHRcdG5ld2FzdGVyb2lkID0gc3BhcmVBc3Rlcm9pZHMucG9wKCk7XG5cdFx0bmV3YXN0ZXJvaWQucG9zLnJlc2V0KHgseSk7XG5cdFx0bmV3YXN0ZXJvaWQucmFkaXVzID0gcmFkaXVzO1xuXG5cdFx0bmV3YXN0ZXJvaWQuZW5hYmxlZCA9IHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0bmV3YXN0ZXJvaWQgPSBuZXcgQXN0ZXJvaWQoeCx5LHJhZGl1cyk7XG5cdFx0YXN0ZXJvaWRzLnB1c2gobmV3YXN0ZXJvaWQpO1xuXHR9XG5cblx0cmV0dXJuIG5ld2FzdGVyb2lkO1xufVxuXG5mdW5jdGlvbiBtYWtlQnVsbGV0KCkge1xuXHR2YXIgYnVsbGV0dmVsID0gbmV3IFZlY3RvcjIoMTAsMCk7XG5cdHZhciBidWxsZXRwb3MgPSBzaGlwLnBvcy5jbG9uZSgpO1xuXHRidWxsZXR2ZWwucm90YXRlKHNoaXAuYW5nbGUpO1xuXHR2YXIgb2Zmc2V0ID0gbmV3IFZlY3RvcjIoMTEsMCk7XG5cdG9mZnNldC5yb3RhdGUoc2hpcC5hbmdsZSk7XG5cdGJ1bGxldHBvcy5wbHVzRXEob2Zmc2V0KTtcblxuXHR2YXIgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRwb3MueCwgYnVsbGV0cG9zLnksIGJ1bGxldHZlbC54LCBidWxsZXR2ZWwueSk7XG5cdGJ1bGxldHMucHVzaChidWxsZXQpO1xuXHQvLyBidWxsZXRTb3VuZC5wbGF5KCk7XG59XG5cbmZ1bmN0aW9uIG9uS2V5RG93bihlKSB7XG5cdGlmKCBjb250cm9scy5zb21lKCBmdW5jdGlvbiAoY29udHJvbCkgeyByZXR1cm4gY29udHJvbCA9PSBlLmtleUNvZGU7IH0gKSApIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0cHJvY2Vzc0NvbnRyb2woIGUua2V5Q29kZSwgdHJ1ZSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIG9uS2V5VXAoZSkge1xuXHRpZiggY29udHJvbHMuc29tZSggaGFzSW4sIGUua2V5Q29kZSApICkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRwcm9jZXNzQ29udHJvbCggZS5rZXlDb2RlLCBmYWxzZSApO1xuXHR9IGVsc2UgaWYgKCBhY3Rpb25zLnNvbWUoIGhhc0luLCBlLmtleUNvZGUgKSApIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0cHJvY2Vzc0FjdGlvbiggZS5rZXlDb2RlICk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFzSW4gKGNvbnRyb2wpIHtcblx0cmV0dXJuIGNvbnRyb2wgPT0gdGhpc1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzQ29udHJvbCAoIGtleSwgYWN0aW9uICkge1xuXHRzd2l0Y2goIGtleSApIHtcblx0XHRjYXNlIFVQOiB0aHJ1c3RpbmcgPSBhY3Rpb247IGJyZWFrO1xuXHRcdGNhc2UgTEVGVDogIHJvdGF0ZUxlZnQgPSBhY3Rpb247ICBicmVhaztcblx0XHRjYXNlIFJJR0hUOiByb3RhdGVSaWdodCA9IGFjdGlvbjsgIGJyZWFrO1xuXHRcdGNhc2UgUE9XRVI6IHBvd2VyID0gYWN0aW9uOyAgYnJlYWs7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0FjdGlvbiAoIGtleSwgYWN0aW9uICkge1xuXHRzd2l0Y2goIGtleSApIHtcblx0XHRjYXNlIFNIT09UOiBtYWtlQnVsbGV0KCk7IGJyZWFrO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHNldHVwQ2FudmFzKCkge1xuXHRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApO1xuXHRjID0gY2FudmFzLmdldENvbnRleHQoICcyZCcgKTtcblx0Y2FudmFzLndpZHRoID0gODAwO1xuXHRjYW52YXMuaGVpZ2h0ID0gNjAwO1xuXHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCBjYW52YXMgKTtcblxuXHRjLnN0cm9rZVN0eWxlID0gXCIjZmZmZmZmXCI7XG5cdGMubGluZVdpZHRoID0gMjtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=