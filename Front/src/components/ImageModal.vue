<template>
	<div class="modal-overlay" @click.self="close">
		<div class="flex flex-col modal-content items-center p-5">
			<button @click="close" class="close-button">×</button>
			<div class="text-center mt-5 text-xl">{{ image.date }}</div>
			<div class="flex justify-between items-center w-full m-10">
				<div class="w-1/2 flex justify-center">
					<image-data
						:url="image.url"
						:bookmark="image.bookmark"
						:bookmarkId="image.bookmarkId"
						@switch-bookmark="updateBookmark"
					></image-data>
				</div>
				<div class="w-1/2 text-center break-words text-lg">
					{{ image.text }}
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import ImageData from './ImageData.vue';

const emit = defineEmits(['close']);
const props = defineProps(['image']);
const close = () => {
	emit('close');
};

const updateBookmark = ({ index, bookmark, bookmarkId }) => {
	props.image.bookmark = bookmark;
	props.image.bookmarkId = bookmarkId;
	emit('close');
	window.location.reload();
};
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
	width: 80%;
	max-width: 800px;
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
