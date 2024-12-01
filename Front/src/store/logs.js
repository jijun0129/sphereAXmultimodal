import { defineStore } from 'pinia';

export const useLogsStore = defineStore('logs', () => {
	const logs = ref([]);

	const setLogs = history => {
		logs.value = history;
	};

	return { logs, setLogs };
});
