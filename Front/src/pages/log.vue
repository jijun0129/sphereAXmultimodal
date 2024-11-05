<template>
	<the-header></the-header>
	<div class="h-screen justify-center m-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl font-bold">검색기록</h2>
		<log-data
			date="날짜"
			text="입력 텍스트"
			class="text-base mt-10 pb-3 font-bold log-data"
		></log-data>
		<log-data
			v-for="log in logs.logs"
			:date="log.date"
			:text="log.text"
			class="text-base mt-3 pb-3 log-data"
		></log-data>
	</div>
</template>
<script setup>
import LogData from '../components/component/LogData.vue';
import { useLogsStore } from '../store';
const logs = useLogsStore();
</script>
<style scoped>
.log-data {
	border-bottom: 1px solid #ccc;
}
</style>
