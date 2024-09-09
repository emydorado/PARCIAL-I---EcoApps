let socket = io('http://localhost:5050', { path: '/real-time' });

document.getElementById('users').addEventListener('click', () => {
	socket.on('usersList', (users) => {
		const usersList = document.getElementById('usersList');
		usersList.innerHTML = users.map((user) => `<li>${user.username}</li>`).join('');
		console.log(username);
	});
});
