<template>
	<the-header></the-header>
	<div class="h-screen justify-center mt-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl font-bold">검색결과</h2>
		<n-card class="mt-5 w-5/6 mx-auto">
			<p class="text-base m-3 text-center">입력 텍스트: {{ text.text }}</p>
		</n-card>
		<div
			class="w-11/12 grid gap-10 grid-cols-4 justify-center items-center mt-10 mx-auto"
		>
			<image-data
				v-for="(Result, index) in Results.Results"
				:key="index"
				:index="index"
				:url="Result.url"
				:searchId="Results.searchId"
				:src="Result.resultImage"
				:bookmark="Result.bookmark"
				:bookmarkId="Result.bookmarkId"
			></image-data>
		</div>
	</div>
	<the-footer></the-footer>
</template>
<script setup>
import { onMounted } from 'vue';
import ImageData from '../components/ImageData.vue';
import { useResultsStore } from '../store/results.js';
import { useTextStore } from '../store/text.js';
import useAxios from '../composables/useAxios.js';
import { useUserStore } from '../store/user.js';
import { Search } from '@vicons/ionicons5';

const text = useTextStore();
const Results = useResultsStore();
const { token } = useUserStore();
const { axios } = useAxios();

onMounted(() => {
	Results.Results.forEach(result => {
		// map 대신 forEach 사용
		if (result.url) {
			axios
				.get(`${result.url}`, {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					responseType: 'blob', // 응답을 blob으로 받기
				})
				.then(response => {
					// Blob 데이터를 URL로 변환
					const imageUrl = URL.createObjectURL(response.data);
					// Vue가 반응적으로 업데이트하도록
					result.resultImage = imageUrl; // Blob URL로 이미지 설정
				})
				.catch(e => {
					console.error('Error fetching history:', e);
				});
		} else {
			console.error('Invalid URL for result:', result);
		}
	});
});
</script>
<style scoped>
.n-card {
	border-radius: 25px;
	border: 3px solid #121212;
}
</style>
