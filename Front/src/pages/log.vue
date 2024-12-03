<template>
	<the-header></the-header>
	<div
		class="flex flex-col h-screen justify-between m-10 mx-auto"
		style="width: 80%"
	>
		<h2 class="text-2xl font-bold">검색기록</h2>
		<log-data
			date="날짜"
			text="입력 텍스트"
			class="text-base mt-16 pb-3 font-bold log-data"
		></log-data>
		<log-data
			v-for="(log, index) in logs.logs"
			:key="index"
			:date="log.date"
			:text="log.text"
			@click="onLogClick(log)"
			class="text-base pt-3 pb-3 cursor-pointer log-data"
		>
		</log-data>
		<div class="flex justify-center mt-auto mb-48 text-lg">
			<button
				v-for="(_, index) in logs.totalPages"
				@click="handlePage(index)"
				:class="{ 'font-bold': logs.currentPage === index + 1 }"
				class="m-2"
			>
				{{ index + 1 }}
			</button>
		</div>
	</div>

	<the-footer></the-footer>
	<log-modal
		v-if="showLogModal"
		:log="selectedLog"
		@close="showLogModal = false"
	></log-modal>
</template>
<script setup>
import { onBeforeUnmount } from 'vue';
import LogData from '../components/LogData.vue';
import LogModal from '../components/LogModal.vue';
import useAxios from '../composables/useAxios.js';
import { useLogsStore } from '../store/logs.js';
import { useUserStore } from '../store/user.js';

const logs = useLogsStore();
const { token } = useUserStore();
const showLogModal = ref(false);
const selectedLog = ref(null);
const { axios } = useAxios();
const limit = 10;

onMounted(() => {
	axios
		.get(`/history`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			params: {
				page: logs.currentPage,
				limit,
			},
		})
		.then(response => {
			logs.setCurrentPage(response.data.currentPage);
			logs.setTotalPages(response.data.totalPages);
			logs.setLogs(response.data.history);
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		});
});

onBeforeUnmount(() => {
	logs.setCurrentPage(1);
});

const handlePage = async index => {
	axios
		.get(`/history`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			params: {
				page: index + 1,
				limit,
			},
		})
		.then(response => {
			logs.setCurrentPage(response.data.currentPage);
			logs.setTotalPages(response.data.totalPages);
			logs.setLogs(response.data.history);
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		});
};

const onLogClick = async log => {
	await axios
		.get(`/history/${log.id}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})
		.then(response => {
			console.log(response.data);
			selectedLog.value = {
				...log,
				date: response.data.date,
				url: response.data.originalImage.url,
				images: response.data.results,
			};
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		});

	showLogModal.value = true;
};
</script>
<style scoped>
.log-data {
	border-bottom: 1px solid #ccc;
}
</style>
