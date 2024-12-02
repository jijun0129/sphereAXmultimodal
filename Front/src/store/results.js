import { defineStore } from 'pinia';

export const useResultsStore = defineStore(
	'Results',
	() => {
		const searchId = ref('');
		const Results = ref([]);
		const setSearchId = id => {
			searchId.value = id;
		};
		const setResults = (search, results) => {
			searchId.value = search;

			Results.value = results.map(result => ({
				url: result.url,
				bookmark: false,
				bookmarkId: null,
			}));
		};
		const setBookmark = (index, bookmark, bookmarkId) => {
			Results.value[index].bookmark = bookmark;
			Results.value[index].bookmarkId = bookmarkId;
		};
		const resetResult = () => {
			Results.value = [];
		};

		return {
			searchId,
			Results,
			setSearchId,
			setResults,
			setBookmark,
			resetResult,
		};
	},
	{
		persist: true, // 이 옵션으로 자동 저장 활성화
	},
);
