import { createPinia, defineStore } from 'pinia';
const pinia = createPinia();

export const useTextStore = defineStore('text', () => {
	const text = ref('');
	const setText = t => {
		text.value = t;
	};

	return { text, setText };
});

export const useBookmarkStore = defineStore('bookmark', () => {
	const bookmark = ref([false, false, false, true, false]);
	const toggleBookmark = index => {
		bookmark.value[index] = !bookmarked.value[index];
	};

	return { bookmark, toggleBookmark };
});

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
			text: '100자 테스트 321qwertyuytrewqasdfghjkhgfdsazxcvbnmnbvcxz123435465742434567234567324567234567231456723456',
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
				'100자 테스트 321qwertyuytrewqasdfghjkhgfdsazxcvbnmnbvcxz123435465742434567234567324567234567231456723456',
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

	return { images };
});

export const useUsersStore = defineStore('Users', () => {
	const users = ref([{ id: 'asd123', password: 'asd123' }]);

	const setUser = (id, password) => {
		users.value.push({ id, password });
	};
	const isValidUser = (id, password) => {};
	return { users, setUser, isValidUser };
});

export default pinia;
