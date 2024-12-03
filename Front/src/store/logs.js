import { defineStore } from 'pinia';

export const useLogsStore = defineStore(
	'logs',
	() => {
		const logs = ref([]);
		const currentPage = ref(1);
		const totalPages = ref(0);

		const setLogs = history => {
			logs.value = history;
		};

		const setCurrentPage = current => {
			currentPage.value = current;
		};

		const setTotalPages = total => {
			totalPages.value = total;
			if (total > 10) {
				totalPages.value = 10;
			}
		};

		return {
			logs,
			currentPage,
			totalPages,
			setLogs,
			setCurrentPage,
			setTotalPages,
		};
	},
	{
		persist: true, // 이 옵션으로 자동 저장 활성화
	},
);
