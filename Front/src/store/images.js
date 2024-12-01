import { defineStore } from 'pinia';

export const useImagesStore = defineStore('Images', () => {
	const images = ref([
		{
			id: 1,
			src: 'assets/dummy/1.jpg',
			bookmark: true,
			inputText: '123',
			date: '2024/11/05',
		},
		{
			id: 2,
			src: 'assets/dummy/1.jpg',
			bookmark: false,
			inputText: '123',
			date: '2024/11/05',
		},
		{
			id: 3,
			src: 'assets/dummy/1.jpg',
			bookmark: true,
			inputText: '123',
			date: '2024/11/05',
		},
		{
			id: 4,
			src: 'assets/dummy/1.jpg',
			bookmark: true,
			inputText:
				'100자 테스트 12345678910 가나다라마바사아자차카타파하 qwertyasdfghzxcvbn 12345678910 가나다라마바사아자차카타파하 qwertyasdfghzxcvbn',
			date: '2024/11/05',
		},
		{
			id: 5,
			src: 'assets/dummy/2.jpg',
			bookmark: true,
			inputText: '사진에서 동물을 찾아서 표시해줘',
			date: '2024/11/05',
		},
	]);

	const setImages = image => {
		images.value = image;
	};

	return { images, setImages };
});
