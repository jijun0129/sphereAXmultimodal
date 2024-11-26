import { defineStore } from 'pinia';

export const useLogsStore = defineStore('logs', () => {
	const logs = ref([
		{
			id: 1,
			text: '123',
			date: '2024/09/26',
			inputImage: { src: 'assets/dummy/1.jpg', bookmark: true },
			images: [
				{ src: 'assets/dummy/1.jpg', bookmark: true },
				{ src: 'assets/dummy/1.jpg', bookmark: true },
				{ src: 'assets/dummy/1.jpg', bookmark: true },
			],
		},
		{
			id: 2,
			text: '456',
			date: '2024/10/14',
			inputImage: { src: 'assets/dummy/1.jpg', bookmark: true },
			images: [
				{ src: 'assets/dummy/1.jpg', bookmark: true },
				{ src: 'assets/dummy/1.jpg', bookmark: true },
				{ src: 'assets/dummy/1.jpg', bookmark: true },
				{ src: 'assets/dummy/1.jpg', bookmark: true },
			],
		},
		{
			id: 3,
			text: '사진에서 동물을 찾아서 표시해줘',
			date: '2024/11/05',
			inputImage: { src: 'assets/dummy/2.jpg', bookmark: true },
			images: [
				{ src: 'assets/dummy/2.jpg', bookmark: true },
				{ src: 'assets/dummy/2.jpg', bookmark: true },
			],
		},
		{
			id: 4,
			text: '100자 테스트 12345678910 가나다라마바사아자차카타파하 qwertyasdfghzxcvbn 12345678910 가나다라마바사아자차카타파하 qwertyasdfghzxcvbn',
			date: '2024/11/08',
			inputImage: { src: 'assets/dummy/2.jpg', bookmark: true },
			images: [
				{ src: 'assets/dummy/2.jpg', bookmark: true },
				{ src: 'assets/dummy/2.jpg', bookmark: true },
			],
		},
	]);

	return { logs };
});
