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
    // bulletSound.play()
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQSx1QkFBdUI7QUFFdkIsWUFBWTtBQUNaLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDWCxJQUFJLElBQUksR0FBRyxFQUFFO0FBQ2IsSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUNkLElBQUksS0FBSyxHQUFHLEVBQUU7QUFDZCxJQUFJLEtBQUssR0FBRyxFQUFFO0FBRWQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUU7QUFDeEMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUM7QUFFckIsSUFBSSxNQUFNO0FBQ1YsSUFBSSxDQUFDLENBQUMsQ0FBQyw2QkFBNkI7QUFFcEMs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U0FBUyxXQUFXO0lBQ25CLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFFLFFBQVEsQ0FBRTtJQUMzQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBRSxJQUFJLENBQUU7SUFDN0IsTUFBTSxDQUFDLEtBQUssR0FBRyxHQUFHO0lBQ2xCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FBRztJQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBRSxNQUFNLENBQUU7SUFFbkMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxTQUFTO0lBQ3pCLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQztBQUNoQixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC50c1wiKTtcbiIsIi8vIGltcG9ydCAnLi9pbmRleC5jc3MnXG5cbi8vIGNvbnN0YW50c1xudmFyIFVQID0gMzhcbnZhciBMRUZUID0gMzdcbnZhciBSSUdIVCA9IDM5XG52YXIgUE9XRVIgPSA4MVxudmFyIFNIT09UID0gMzJcblxudmFyIGNvbnRyb2xzID0gW1VQLCBMRUZULCBSSUdIVCwgUE9XRVIgXVxudmFyIGFjdGlvbnMgPSBbU0hPT1RdXG5cbnZhciBjYW52YXNcbnZhciBjOyAvLyBjIGlzIHRoZSBjYW52YXMgMkQgY29udGV4dFxuXG4vLyBmbGFncyBhbmQgXCJnbG9iYWxcIiB2YWx1ZXNcbnZhciBoYWxmV2lkdGhcbnZhciBoYWxmSGVpZ2h0XG52YXIgdGhydXN0aW5nID0gZmFsc2VcbnZhciByb3RhdGVMZWZ0ID0gZmFsc2VcbnZhciByb3RhdGVSaWdodCA9IGZhbHNlXG52YXIgcG93ZXIgPSBmYWxzZVxuXG4vLyBnYW1lIG9iamVjdHNcbnZhciBidWxsZXRzXG52YXIgc2hpcFxudmFyIGFzdGVyb2lkcyA9IFtdXG52YXJcdHNwYXJlQXN0ZXJvaWRzID0gW11cblxuZnVuY3Rpb24gc2V0dXAgKCkge1xuXHRmcmFtZVJhdGUgPSA2MFxuXG5cdHNldHVwQ2FudmFzKClcblx0aGFsZldpZHRoID0gY2FudmFzLndpZHRoLzJcblx0aGFsZkhlaWdodCA9IGNhbnZhcy5oZWlnaHQvMlxuXHRidWxsZXRzID0gW11cblx0c2hpcCA9IG5ldyBTaGlwTW92aW5nKGhhbGZXaWR0aCwgaGFsZkhlaWdodClcblxuXHRmb3IodmFyIGkgPSAwOyBpPDU7IGkrKykge1xuXHRcdGFzdGVyb2lkc1tpXSA9IG5ldyBBc3Rlcm9pZChyYW5kb20oMCxjYW52YXMud2lkdGgpLCByYW5kb20oMCwgY2FudmFzLmhlaWdodCksIDUwKVxuXHRcdGFzdGVyb2lkc1tpXS52ZWwucmVzZXQoMiwwKVxuXHRcdGFzdGVyb2lkc1tpXS52ZWwucm90YXRlKHJhbmRvbSgzNjApKVxuXHR9XG59XG5cbmZ1bmN0aW9uIGRyYXcoKSB7XG5cdGMuY2xlYXJSZWN0KDAsMCxjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG5cblx0aWYodGhydXN0aW5nKSBzaGlwLnRocnVzdCggcG93ZXIgKVxuXHRpZihyb3RhdGVMZWZ0KSBzaGlwLnJvdGF0ZUxlZnQoIHBvd2VyIClcblx0aWYocm90YXRlUmlnaHQpIHNoaXAucm90YXRlUmlnaHQoIHBvd2VyIClcblxuXHQvLyBEUkFXIFNISVBcblx0Ly9cblx0c2hpcC51cGRhdGUoKVxuXHR3aXRoKHNoaXAucG9zKSB7XG5cdFx0aWYoeDwwKSB4ID0gY2FudmFzLndpZHRoXG5cdFx0ZWxzZSBpZih4PmNhbnZhcy53aWR0aCkgeCA9IDBcblx0XHRpZih5PDApIHkgPSBjYW52YXMuaGVpZ2h0XG5cdFx0ZWxzZSBpZiAoeT5jYW52YXMuaGVpZ2h0KSB5ID0gMFxuXHR9XG5cdHNoaXAuZHJhdyhjLCB0aHJ1c3RpbmcpXG5cblx0Ly8gRFJBVyBBU1RFUk9JRFNcblx0Zm9yKHZhciBpID0gMCwgYXN0ZXJvaWQ7ICBpIDwgYXN0ZXJvaWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0YXN0ZXJvaWQgPSBhc3Rlcm9pZHNbaV1cblxuXHRcdGlmKCFhc3Rlcm9pZC5lbmFibGVkKSBjb250aW51ZVxuXG5cdFx0ZGV0ZWN0Q29sbGlzaW9ucyggYXN0ZXJvaWQgKVxuXG5cdFx0YXN0ZXJvaWQudXBkYXRlKGNhbnZhcylcblx0XHRhc3Rlcm9pZC5kcmF3KGMpXG5cdH1cblxuXHQvLyBEUkFXIEJVTExFVFNcblx0Zm9yKCB2YXIgaT0wOyBpPGJ1bGxldHMubGVuZ3RoOyBpKysgKXtcblx0XHRidWxsZXQgPSBidWxsZXRzW2ldXG5cdFx0YnVsbGV0LnVwZGF0ZSgpXG5cdFx0YnVsbGV0LmRyYXcoYylcblx0fVxufVxuXG5mdW5jdGlvbiBkZXRlY3RDb2xsaXNpb25zICggYXN0ZXJvaWQgKSB7XG5cdGZvciggdmFyIGkgPSAwLCBidWxsZXQ7IGkgPCBidWxsZXRzLmxlbmd0aDsgaSsrICkge1xuXHRcdGJ1bGxldCA9IGJ1bGxldHNbaV1cblxuXHRcdGlmKCBhc3Rlcm9pZC5oaXRUZXN0KCBidWxsZXQucG9zLngsIGJ1bGxldC5wb3MueSkgKSB7XG5cdFx0XHRpZihhc3Rlcm9pZC5yYWRpdXM8MTUpIHtcblx0XHRcdFx0YXN0ZXJvaWQuZW5hYmxlZCA9IGZhbHNlXG5cdFx0XHRcdHNwYXJlQXN0ZXJvaWRzLnB1c2goYXN0ZXJvaWQpXG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YXN0ZXJvaWQucmFkaXVzID0gYXN0ZXJvaWQucmFkaXVzLzJcblxuXHRcdFx0XHR2YXIgbmV3YXN0ZXJvaWQgPSBtYWtlTmV3QXN0ZXJvaWQoYXN0ZXJvaWQucG9zLngsIGFzdGVyb2lkLnBvcy55LCBhc3Rlcm9pZC5yYWRpdXMpXG5cdFx0XHRcdG5ld2FzdGVyb2lkLnZlbC5jb3B5RnJvbShhc3Rlcm9pZC52ZWwpXG5cblx0XHRcdFx0Ly8gY2hhbmdlIHZlbHMgc28gdGhhdCB0aGV5IHNlZW0gdG8gcmVib3VuZCBvZmYgZWFjaCBvdGhlci5cblx0XHRcdFx0bmV3YXN0ZXJvaWQudmVsLnJvdGF0ZSgtMzApXG5cdFx0XHRcdGFzdGVyb2lkLnZlbC5yb3RhdGUoMzApXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIG1ha2VOZXdBc3Rlcm9pZCh4LHkscmFkaXVzKSB7XG5cdHZhciBuZXdhc3Rlcm9pZFxuXG5cdGlmKCBzcGFyZUFzdGVyb2lkcy5sZW5ndGg+MCApIHtcblx0XHRuZXdhc3Rlcm9pZCA9IHNwYXJlQXN0ZXJvaWRzLnBvcCgpXG5cdFx0bmV3YXN0ZXJvaWQucG9zLnJlc2V0KHgseSlcblx0XHRuZXdhc3Rlcm9pZC5yYWRpdXMgPSByYWRpdXNcblxuXHRcdG5ld2FzdGVyb2lkLmVuYWJsZWQgPSB0cnVlXG5cdH1cblx0ZWxzZSB7XG5cdFx0bmV3YXN0ZXJvaWQgPSBuZXcgQXN0ZXJvaWQoeCx5LHJhZGl1cylcblx0XHRhc3Rlcm9pZHMucHVzaChuZXdhc3Rlcm9pZClcblx0fVxuXG5cdHJldHVybiBuZXdhc3Rlcm9pZFxufVxuXG5mdW5jdGlvbiBtYWtlQnVsbGV0KCkge1xuXHR2YXIgYnVsbGV0dmVsID0gbmV3IFZlY3RvcjIoMTAsMClcblx0dmFyIGJ1bGxldHBvcyA9IHNoaXAucG9zLmNsb25lKClcblx0YnVsbGV0dmVsLnJvdGF0ZShzaGlwLmFuZ2xlKVxuXHR2YXIgb2Zmc2V0ID0gbmV3IFZlY3RvcjIoMTEsMClcblx0b2Zmc2V0LnJvdGF0ZShzaGlwLmFuZ2xlKVxuXHRidWxsZXRwb3MucGx1c0VxKG9mZnNldClcblxuXHR2YXIgYnVsbGV0ID0gbmV3IEJ1bGxldChidWxsZXRwb3MueCwgYnVsbGV0cG9zLnksIGJ1bGxldHZlbC54LCBidWxsZXR2ZWwueSlcblx0YnVsbGV0cy5wdXNoKGJ1bGxldClcblx0Ly8gYnVsbGV0U291bmQucGxheSgpXG59XG5cbmZ1bmN0aW9uIG9uS2V5RG93bihlKSB7XG5cdGlmKCBjb250cm9scy5zb21lKCBmdW5jdGlvbiAoY29udHJvbCkgeyByZXR1cm4gY29udHJvbCA9PSBlLmtleUNvZGU7IH0gKSApIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRwcm9jZXNzQ29udHJvbCggZS5rZXlDb2RlLCB0cnVlIClcblx0fVxufVxuXG5mdW5jdGlvbiBvbktleVVwKGUpIHtcblx0aWYoIGNvbnRyb2xzLnNvbWUoIGhhc0luLCBlLmtleUNvZGUgKSApIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KClcblx0XHRwcm9jZXNzQ29udHJvbCggZS5rZXlDb2RlLCBmYWxzZSApXG5cdH1cblx0ZWxzZSBpZiggYWN0aW9ucy5zb21lKCBoYXNJbiwgZS5rZXlDb2RlICkgKSB7XG5cdFx0ZS5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0cHJvY2Vzc0FjdGlvbiggZS5rZXlDb2RlIClcblx0fVxufVxuXG5mdW5jdGlvbiBoYXNJbiAoIGNvbnRyb2wgKSB7XG5cdHJldHVybiBjb250cm9sID09IHRoaXNcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbnRyb2wgKCBrZXksIGFjdGlvbiApIHtcblx0c3dpdGNoKCBrZXkgKSB7XG5cdFx0Y2FzZSBVUDogdGhydXN0aW5nID0gYWN0aW9uOyBicmVha1xuXHRcdGNhc2UgTEVGVDogIHJvdGF0ZUxlZnQgPSBhY3Rpb247ICBicmVha1xuXHRcdGNhc2UgUklHSFQ6IHJvdGF0ZVJpZ2h0ID0gYWN0aW9uOyAgYnJlYWtcblx0XHRjYXNlIFBPV0VSOiBwb3dlciA9IGFjdGlvbjsgIGJyZWFrXG5cdH1cbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0FjdGlvbiAoIGtleSwgYWN0aW9uICkge1xuXHRzd2l0Y2goIGtleSApIHtcblx0XHRjYXNlIFNIT09UOiBtYWtlQnVsbGV0KCk7IGJyZWFrXG5cdH1cbn1cblxuZnVuY3Rpb24gc2V0dXBDYW52YXMgKCkge1xuXHRjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnY2FudmFzJyApXG5cdGMgPSBjYW52YXMuZ2V0Q29udGV4dCggJzJkJyApXG5cdGNhbnZhcy53aWR0aCA9IDgwMFxuXHRjYW52YXMuaGVpZ2h0ID0gNjAwXG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIGNhbnZhcyApXG5cblx0Yy5zdHJva2VTdHlsZSA9IFwiI2ZmZmZmZlwiXG5cdGMubGluZVdpZHRoID0gMlxufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==