<template>
	<the-header></the-header>
	<div
		class="flex flex-col h-screen justify-center m-10 mx-auto"
		style="width: 80%"
	>
		<h2 class="text-2xl font-bold">검색기록</h2>
		<log-data
			date="날짜"
			text="입력 텍스트"
			class="text-base mt-10 pb-3 font-bold log-data"
		></log-data>
		<log-data
			v-for="log in logs.logs"
			:key="log.id"
			:date="log.date"
			:text="log.text"
			@click="onLogClick(log)"
			class="text-base pt-3 pb-3 cursor-pointer log-data"
		>
		</log-data>
		<div class="flex justify-center mt-auto mb-40 text-lg">
			<button>1</button>
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
import LogData from '../components/LogData.vue';
import LogModal from '../components/LogModal.vue';
import { useLogsStore } from '../store/logs.js';
const logs = useLogsStore();
const showLogModal = ref(false);
const selectedLog = ref(null);

const onLogClick = log => {
	selectedLog.value = log;
	showLogModal.value = true;
};
</script>
<style scoped>
.log-data {
	border-bottom: 1px solid #ccc;
}
</style>
