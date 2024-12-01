<template>
	<div class="flex mx-auto relative" style="width: 80%">
		<img :src="src" class="w-full" />
		<n-button
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
const props = defineProps({
	searchId: String,
	bookmarkId: String,
	index: Number,
	src: String,
	url: String,
	bookmark: Boolean,
});

const { axios } = useAxios();
const { token } = useUserStore();
const Results = useResultsStore();

const handleBookmark = () => {
	if (props.bookmark == true) {
		delBookmark();
	} else {
		addBookmark();
	}
};

const addBookmark = async () => {
	try {
		console.log(props.searchId);
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
				console.log('History data:', response.data.history);
				Results.setBookmark(props.index, response.data.bookmarkId);
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
				console.log('History data:', response.data.history);
				Results.setBookmark(props.index, null);
			});
	} catch (error) {
		console.error(
			'Error deleting bookmark:',
			error.response?.data?.message || error.message,
		);
	}
};
</script>
