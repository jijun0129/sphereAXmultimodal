<template>
	<div class="flex mx-auto relative" style="width: 80%">
		<img :src="ImageSrc" class="w-full" />
		<n-button
			v-if="props.bookmark != null"
			type="primary"
			quaternary
			circle
			class="absolute top-2 right-2"
			@click="handleBookmark"
		>
			<template #icon>
				<n-icon>
					<BookmarkOutline v-if="!props.bookmark" />
					<BookmarkSharp v-else />
				</n-icon>
			</template>
		</n-button>
	</div>
</template>
<script setup>
import { BookmarkOutline, BookmarkSharp } from '@vicons/ionicons5';
import useAxios from '../composables/useAxios';
import { useUserStore } from '../store/user.js';
import { useResultsStore } from '../store/results.js';
import { onMounted, ref } from 'vue';
const props = defineProps([
	'searchId',
	'bookmarkId',
	'index',
	'url',
	'bookmark',
]);
const emit = defineEmits(['switch-bookmark']);

const { axios } = useAxios();
const { token } = useUserStore();
const ImageSrc = ref('');

const handleBookmark = () => {
	if (props.bookmark == true) {
		delBookmark();
	} else {
		addBookmark();
	}
};
onMounted(() => {
	axios
		.get(`${props.url}`, {
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
			ImageSrc.value = imageUrl; // Blob URL로 이미지 설정
		})
		.catch(e => {
			console.error('Error fetching history:', e);
		});
});

const addBookmark = async () => {
	try {
		await axios
			.post(
				'/bookmarks',
				{
					searchHistoryId: props.searchId,
					imageUrl: props.url,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`, // 인증을 위한 Authorization 헤더
						'Content-Type': 'application/json',
					},
				},
			)
			.then(response => {
				emit('switch-bookmark', {
					index: props.index,
					bookmark: true,
					bookmarkId: response.data.bookmarkId,
				});
			});
	} catch (error) {
		console.error(
			'Error adding bookmark:',
			error.response?.data?.message || error.message,
		);
	}
};

const delBookmark = async () => {
	try {
		await axios
			.delete(`/bookmarks/${props.bookmarkId}`, {
				headers: {
					Authorization: `Bearer ${token}`, // 인증을 위한 Authorization 헤더
					'Content-Type': 'application/json',
				},
			})
			.then(response => {
				emit('switch-bookmark', {
					index: props.index,
					bookmark: false,
					bookmarkId: null,
				});
			});
	} catch (error) {
		console.error(
			'Error deleting bookmark:',
			error.response?.data?.message || error.message,
		);
	}
};
</script>
