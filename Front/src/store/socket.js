import { defineStore } from 'pinia';
import { io } from 'socket.io-client';

export const useSocketStore = defineStore('socket', () => {
	const socket = ref(null);
	const server = ref('');

	const initSocket = (initialSocket, initialServer) => {
		socket.value = initialSocket;
		server.value = initialServer;
		setupSocketListeners();
	};

	const setupSocketListeners = () => {
		if (!socket.value) return;

		socket.value.off('disconnect');
		socket.value.off('connect');

		socket.value.on('disconnect', () => {
			sessionStorage.clear();
			console.log('Socket Disconnected');
			socket.value.close();
		});

		socket.value.on('connect', () => {
			console.log('Socket Connected');
		});
	};

	const reconnectSocket = () => {
		if (!socket.value || !socket.value.connected) {
			socket.value = io(server.value);
			setupSocketListeners();
		}
	};

	const emit = (event, ...args) => {
		if (socket.value) {
			socket.value.emit(event, ...args);
		} else {
			console.error('Socket is not initialized');
		}
	};

	const on = (event, callback) => {
		if (socket.value) {
			socket.value.on(event, callback);
		} else {
			console.error('Socket is not initialized');
		}
	};

	const removeListener = (event, callback) => {
		if (socket.value) {
			socket.value.off(event, callback);
		} else {
			console.error('Socket is not initialized');
		}
	};

	return { initSocket, reconnectSocket, emit, on, removeListener };
});
