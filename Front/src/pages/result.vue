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
				v-for="image in images.images"
				:id="image.id"
				:src="image.src"
				:bookmark="image.bookmark"
			></image-data>
		</div>
	</div>
	<the-footer></the-footer>
</template>
<script setup>
import ImageData from '../components/component/ImageData.vue';
import { useImagesStore, useTextStore } from '../store';
const props = defineProps({
	text: String,
});
const text = useTextStore();
const images = useImagesStore();
</script>
<style scoped>
.n-card {
	border-radius: 25px;
	border: 3px solid #121212;
}
</style>
