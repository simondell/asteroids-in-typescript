function component():HTMLElement {
  const element = document.createElement('div')

  element.innerHTML = ['Hello', 'webpack'].join(', ')

  return element
}

function different():HTMLElement {
	const element = document.createElement('div')
	element.innerHTML = 'It seems to work'
	return element
}


document.body.appendChild(component())