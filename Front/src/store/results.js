import { defineStore } from 'pinia';

export const useResultsStore = defineStore('Results', () => {
	const searchId = ref('');
	const Results = ref([
		{
			id: 1,
			url: 'assets/dummy/1.jpg',
			bookmark: true,
			inputText: '123',
			date: '2024/11/05',
		},
	]);

	const setSearchId = id => {
		searchId.value = id;
	};
	const setResults = Result => {
		searchId.value = Result.searchId;
		Results.value = Result.results;
	};

	return { searchId, Results, setSearchId, setResults };
});
