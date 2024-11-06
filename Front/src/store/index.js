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
		{ text: '123', date: '2024/09/26' },
		{ text: '456', date: '2024/10/14' },
		{
			text: '1234567654321qwertyuytrewqasdfghjkhgfdsazxcvbnmnbvcxz',
			date: '2024/11/05',
		},
	]);

	return { logs };
});

export const useImagesStore = defineStore('Images', () => {
	const images = ref([
		{ src: 'assets/dummy/1.jpg', bookmark: true },
		{ src: 'assets/dummy/1.jpg', bookmark: true },
		{ src: 'assets/dummy/1.jpg', bookmark: true },
		{ src: 'assets/dummy/1.jpg', bookmark: true },
		{ src: 'assets/dummy/1.jpg', bookmark: true },
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
