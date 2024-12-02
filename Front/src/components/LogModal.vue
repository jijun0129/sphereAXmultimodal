<template>
	<div class="modal-overlay" @click.self="close">
		<div class="flex flex-col modal-content items-center p-5">
			<button @click="close" class="close-button">×</button>
			<div class="flex w-full h-full m-5">
				<div class="w-1/3 flex flex-col justify-center items-center">
					<div class="text-center mb-10 text-xl">{{ log.date }}</div>
					<image-data :url="log.url" :bookmark="null"></image-data>
					<div class="w-3/4 mt-10 text-center break-words text-lg">
						{{ log.text }}
					</div>
				</div>
				<div class="w-2/3 flex flex-col mt-5 items-center mx-auto">
					<div class="text-xl mt-3">결과 이미지</div>
					<div class="grid gap-y-10 grid-cols-3 place-content-start mt-5">
						<image-data
							v-for="(image, index) in log.images"
							:key="index"
							:index="index"
							:url="image.url"
							:bookmark="image.isBookmarked"
							:bookmarkId="image.bookmarkId"
							:searchId="log.id"
							@switch-bookmark="updateBookmark"
						></image-data>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue';
import ImageData from './ImageData.vue';
import useAxios from '../composables/useAxios.js';

const { axios } = useAxios();
const emit = defineEmits(['close']);
const props = defineProps(['log']);
const close = () => {
	emit('close');
};

const updateBookmark = ({ index, bookmark, bookmarkId }) => {
	props.log.images[index].isBookmarked = bookmark;
	props.log.images[index].bookmarkId = bookmarkId;
};

onMounted(() => {
	//axios.get('/Bookmark');
});
</script>
<style scoped>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	justify-content: center;
	align-items: center;
}

.modal-content {
	background: #454545;
	padding: 20px;
	border-radius: 8px;
	height: 60%;
	width: 80%;
	max-height: 750px;
	max-width: 1000px;
	position: relative;
}

.close-button {
	position: absolute;
	top: 10px;
	right: 10px;
	background: transparent;
	border: none;
	font-size: 1.5rem;
	cursor: pointer;
}
</style>
