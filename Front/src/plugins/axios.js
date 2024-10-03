import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: '', // 실제 주소로 수정해 주세요
	timeout: 5000,
	headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
