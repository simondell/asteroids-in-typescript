export function greeter (target: string) {
	const slot = document.getElementById('slot')
	slot.textContent = target
	console.log(`Hello, ${target}!`)
}