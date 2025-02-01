import {
	Directions,
	Speeds,
} from '../game'

export default (
	{
		asteroids: [
		],
		bullets: [],
		controls: {
			direction: Directions.NEUTRAL,
			thrust: false,
		},
		rocket: {
			acceleration: { x: 0.15, y: 0 },
			angle: 0,
			position: { x: 400, y: 300 },
			velocity: { x: 0, y: 0 }
		},
		score: 0,
		settings: {
			gameHeight: 0,
			gameWidth: 0,
			speed: Speeds.Still,
		}
	}
)
