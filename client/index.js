let socket = io('http://localhost:5050', { path: '/real-time' });

document.getElementById('loginBtn').addEventListener('click', login);

let loggedInUser = '';

function login() {
	const username = document.getElementById('username').value;
	fetch('http://localhost:5050/user', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ username }),
	})
		.then((res) => res.json())
		.then((data) => {
			loggedInUser = username;
			document.getElementById('login').style.display = 'none';
			document.getElementById('assignation').style.display = 'block';
			socket.emit('setUsername', username);
		})
		.catch((err) => alert('Nombre ya en uso'));
}

socket.on('usersList', (users) => {
	const usersList = document.getElementById('usersList');
	const currentUser = users.find((user) => user.username === loggedInUser);
	if (currentUser) {
		usersList.innerHTML = `
			<li>${currentUser.username}</li>
			<li>Rol: ${currentUser.role}</li>`;
		localStorage.setItem('rol', currentUser.role);
	} else {
		usersList.innerHTML = '';
	}
});

socket.on('gameReady', (isReady) => {
	const startButton = document.getElementById('startGameBtn');
	if (isReady) {
		const rol = localStorage.getItem('rol');
		startButton.disabled = false; // Habilitar el botón de inicio del juego
		startButton.innerText = `Gritar ${rol}`;
	} else {
		startButton.disabled = true; // Deshabilitar el botón hasta que estén todos los roles
		startButton.innerText = 'Esperando jugadores...';
	}
});

document.getElementById('startGameBtn').addEventListener('click', () => {
	const rol = localStorage.getItem('rol');
	if (rol === 'Marco') {
		socket.emit('gritarMarco');
		document.getElementById('startGameBtn').disabled = true; // Desactivar botón después de gritar
	}
});

socket.on('marcoHaGritado', () => {
	const rol = localStorage.getItem('rol');
	if (rol === 'Polo' || rol === 'Polo especial') {
		const alerta = document.getElementById('marcoAlert');
		const alertaMarco = document.createElement('p');
		alertaMarco.textContent = '¡Marco ha gritado!';
		alerta.appendChild(alertaMarco);

		const poloBtn = document.getElementById('gritarPoloBtn');
		poloBtn.disabled = false;
	}
});

document.getElementById('startGameBtn').addEventListener('click', () => {
	const rol = localStorage.getItem('rol');
	if (rol === 'Polo' || rol === 'Polo especial') {
		socket.emit('gritarPolo');
		document.getElementById('startGameBtn').disabled = true; // Desactivar botón después de gritar
	}
});

socket.on('poloHaGritado', (polo) => {
	const rol = localStorage.getItem('rol');
	if (rol === 'Marco') {
		const polosList = document.getElementById('polosList');
		const poloItem = document.createElement('li');
		poloItem.textContent = polo.username;
		polosList.appendChild(poloItem);
	}
});
