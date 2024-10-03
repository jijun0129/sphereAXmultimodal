import { io } from 'socket.io-client';

const socket = io('', {
	// 실제 주소로 수정해 주세요
	autoConnect: false,
});

export default socket;
