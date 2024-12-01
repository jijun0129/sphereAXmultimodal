import { defineStore } from 'pinia';

export const useTextStore = defineStore(
	'text',
	() => {
		const text = ref('');
		const setText = t => {
			text.value = t;
		};

		return { text, setText };
	},
	{
		persist: true, // 이 옵션으로 자동 저장 활성화
	},
);
