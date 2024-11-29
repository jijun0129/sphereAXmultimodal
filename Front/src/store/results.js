import { defineStore } from 'pinia';

export const useResultsStore = defineStore('Results', () => {
	const Results = ref([
		{
			id: 1,
			src: 'assets/dummy/1.jpg',
			bookmark: true,
			inputText: '123',
			date: '2024/11/05',
		},
	]);

	const setResults = Result => {
		Results.value = Result;
	};

	return { Results, setResults };
});
