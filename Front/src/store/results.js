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

			// 직접 Results에 데이터를 할당
			Results.value = results.map(result => ({
				id: 1,
				url: result.url, // URL이 각 result 객체에 포함되어 있다고 가정
				resultImage: null,
				bookmark: false,
				inputText: '123',
				bookmarkId: null,
				date: '2024//12/01',
			}));
		};
		const setBookmark = (index, bookmark, bookmarkId) => {
			Results.value[index].bookmark = bookmark;
			Results.value[index].bookmarkId = bookmarkId;
		};

		return {
			searchId,
			Results,
			setSearchId,
			setResults,
			setBookmark,
		};
	},
	{
		persist: true, // 이 옵션으로 자동 저장 활성화
	},
);
