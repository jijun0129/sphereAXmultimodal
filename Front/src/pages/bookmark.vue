<template>
	<the-header></the-header>
	<div
		class="flex flex-col h-screen justify-between m-10 mx-auto"
		style="width: 80%"
	>
		<h2 class="text-2xl font-bold">북마크 목록</h2>
		<div
			class="w-full grid gap-10 grid-cols-6 justify-center items-center mt-10 mx-auto"
		>
			<image-data
				v-if="!isLoading"
				v-for="(image, index) in images.images"
				:key="image.id"
				:index="index"
				:url="image.imageUrl"
				:bookmark="true"
				:bookmarkId="image.id"
				:bookmarkButton="true"
				@click="onImageClick(image)"
				class="mt-5 cursor-pointer"
			></image-data>
		</div>
		<div class="flex justify-center mt-auto mb-48 text-lg">
			<button
				v-for="(_, index) in images.totalPages"
				@click="handlePage(index)"
				:class="{ 'font-bold': images.currentPage === index + 1 }"
				class="m-2"
			>
				{{ index + 1 }}
			</button>
		</div>
		<image-modal
			v-if="showImageModal"
			:image="selectedImage"
			@close="showImageModal = false"
		></image-modal>
	</div>

	<the-footer></the-footer>
	<image-modal
		v-if="showImageModal"
		:image="selectedImage"
		@close="showImageModal = false"
	></image-modal>
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
const isLoading = ref(true);
const showImageModal = ref(false);
const selectedImage = ref(null);
const initPage = 1;
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
				page: initPage,
				limit,
			},
		})
		.then(response => {
			images.setCurrentPage(response.data.currentPage);
			images.setTotalPages(response.data.totalPages);
			images.setImages(response.data.bookmarks);
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		})
		.finally(() => {
			isLoading.value = false; // 로딩 완료
		});
});

const handlePage = async index => {
	axios
		.get(`/bookmarks`, {
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
			images.setCurrentPage(response.data.currentPage);
			images.setTotalPages(response.data.totalPages);
			images.setImages(response.data.bookmarks);
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		})
		.finally(() => {
			isLoading.value = false; // 로딩 완료
		});
};

const onImageClick = async image => {
	await axios
		.get(`/bookmarks/${image.id}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})
		.then(response => {
			selectedImage.value = {
				bookmark: true,
				bookmarkId: image.id,
				url: image.imageUrl,
				date: response.data.date,
				text: response.data.text,
			};
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		});
	showImageModal.value = true;
};
</script>
