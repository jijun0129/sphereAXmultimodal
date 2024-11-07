<template>
	<the-header></the-header>
	<div class="h-screen justify-center m-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl font-bold">검색결과</h2>
		<div
			class="w-full grid gap-10 grid-cols-5 justify-center items-center mt-10 mx-auto"
		>
			<image-data
				v-for="image in images.images"
				:src="image.src"
				:bookmark="image.bookmark"
				@click="onImageClick(image)"
				class="mt-5 cursor-pointer"
			></image-data>
		</div>
		<image-modal
			v-if="showImageModal"
			:image="selectedImage"
			@close="showImageModal = false"
		></image-modal>
	</div>
</template>
<script setup>
import ImageData from '../components/component/ImageData.vue';
import ImageModal from '../components/component/ImageModal.vue';
import { useImagesStore } from '../store';
const images = useImagesStore();

const showImageModal = ref(false);
const selectedImage = ref(null);

const onImageClick = image => {
	selectedImage.value = image;
	showImageModal.value = true;
};
</script>
