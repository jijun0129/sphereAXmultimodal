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

export default pinia;
