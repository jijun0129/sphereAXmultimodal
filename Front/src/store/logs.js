import { defineStore } from 'pinia';

export const useLogsStore = defineStore('logs', () => {
	const logs = ref([]);
	const currentPage = ref(1);
	const totalPages = ref(10);

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
});
