import { createPinia, defineStore } from 'pinia';
const pinia = createPinia();

export const useTextStore = defineStore('text', () => {
	const text = ref('');
	const setText = t => {
		text.value = t;
	};

	return { text, setText };
});

export default pinia;
