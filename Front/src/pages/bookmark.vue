<template>
	<the-header></the-header>
	<div class="h-screen justify-center m-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl font-bold">북마크 목록</h2>
		<div
			class="w-full grid gap-10 grid-cols-6 justify-center items-center mt-10 mx-auto"
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
	<the-footer></the-footer>
</template>
<script setup>
import ImageData from '../components/ImageData.vue';
import ImageModal from '../components/ImageModal.vue';
import { useImagesStore } from '../store/images.js';
import { onMounted } from 'vue';
import useAxios from '../composables/useAxios.js';
import { useUserStore } from '../store/user.js';
const images = useImagesStore();
const { token } = useUserStore();
const showImageModal = ref(false);
const selectedImage = ref(null);
const page = 1;
const limit = 18;

const { axios } = useAxios();

onMounted(() => {
	axios
		.get(`/bookmarks`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			params: {
				page,
				limit,
			},
		})
		.then(response => {
			images.setImages(response.imageUrl);
			console.log('History data:', response.data);
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		});
});

const onImageClick = image => {
	selectedImage.value = image;
	showImageModal.value = true;
};
</script>
