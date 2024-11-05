<template>
	<the-header></the-header>
	<div class="h-screen justify-center m-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl font-bold">검색결과</h2>
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
import { useImagesStore } from '../store';
const images = useImagesStore();
</script>
