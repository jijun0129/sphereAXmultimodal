<template>
	<the-header></the-header>
	<div class="h-screen justify-center mt-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl">검색결과</h2>
		<p class="text-base mt-5 text-center">{{ text.text }}</p>
		<n-space justify="space-between">
			<div
				v-for="image in images.images"
				class="h-48 w-full flex justify-center items-center mt-10"
			>
				<image-data :src="image.src" :bookmark="image.bookmark"></image-data>
			</div>
		</n-space>
	</div>
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
<style scoped></style>
