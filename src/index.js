function component() {
  const element = document.createElement('div')

  element.innerHTML = ['Hello', 'webpack', ' '].concat()

  return element
}

function different() {
	const element = document.createElement('div')
	element.innerHTML = 'It seems to work'
	return element
}


document.body.appendChild(different())