const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
	path: '/real-time',
	cors: {
		origin: '*',
	},
});

const db = {
	players: [],
};

const roles = ['Marco', 'Polo', 'Polo especial'];

// Función asignar roles
function getRole(connectedUsers) {
	const marcoExists = connectedUsers.some((user) => user.role === 'Marco');
	const poloEspecialExists = connectedUsers.some((user) => user.role === 'Polo especial');

	if (marcoExists && poloEspecialExists) {
		return 'Polo';
	} else if (marcoExists) {
		return 'Polo especial';
	} else if (poloEspecialExists) {
		return 'Marco';
	} else {
		const randomIndex = Math.floor(Math.random() * 2);
		return randomIndex === 0 ? 'Marco' : 'Polo especial';
	}
}

// Función verificar roles
function allRolesAssigned() {
	const roleCounts = { Marco: 0, Polo: 0, 'Polo especial': 0 };
	connectedUsers.forEach((user) => {
		if (roles.includes(user.role)) {
			roleCounts[user.role]++;
		}
	});
	return roles.every((role) => roleCounts[role] >= 1);
}

let connectedUsers = [];

app.get('/users', (request, response) => {
	response.send(db);
});

app.post('/user', (request, response) => {
	const { username } = request.body; // Solo extraer el username
	if (!username) {
		return response.status(400).send({ error: 'Username is required' });
	}
	db.players.push({ username });
	response.status(201).send({ username }); // Enviar solo el username como respuesta
});

io.on('connection', (socket) => {
	console.log('Nuevo cliente conectado');

	socket.on('setUsername', (username) => {
		console.log(`Username received: ${username}`);
		const userRole = getRole(connectedUsers);
		connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
		connectedUsers.push({ username, id: socket.id, role: userRole });

		io.emit(
			'usersList',
			connectedUsers.map((user) => ({ username: user.username, role: user.role }))
		);
		if (allRolesAssigned()) {
			io.emit('gameReady', true);
		} else {
			io.emit('gameReady', false);
		}
	});

	socket.on('disconnect', () => {
		connectedUsers = connectedUsers.filter((user) => user.id !== socket.id); // Eliminar usuario desconectado
		'usersList', connectedUsers.map((user) => ({ username: user.username }));
		console.log('Cliente desconectado');
	});

	socket.on('gritarMarco', () => {
		const marcoUser = connectedUsers.find((user) => user.id === socket.id && user.role === 'Marco');
		if (marcoUser) {
			console.log(`${marcoUser.username} ha gritado "Marco"`);
			io.emit('marcoHaGritado');
		}
	});

	socket.on('gritarPolo', () => {
		const poloUser = connectedUsers.find(
			(user) => user.id === socket.id && (user.role === 'Polo' || user.role === 'Polo especial')
		);
		if (poloUser) {
			console.log(`${poloUser.username} ha gritado "Polo"`);
			io.emit('poloHaGritado', { username: poloUser.username });
		}
	});
});

httpServer.listen(5050, () => {
	console.log(`Server is running on http://localhost:${5050}`);
});
