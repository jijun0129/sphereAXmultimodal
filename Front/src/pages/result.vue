<template>
	<the-header></the-header>
	<div class="h-screen justify-center mt-10 mx-auto" style="width: 80%">
		<h2 class="text-2xl">검색결과</h2>
		<p class="text-base mt-5 text-center">{{ text.text }}</p>
		<n-space justify="space-between">
			<div
				v-for="(item, index) in 5"
				class="h-48 w-full flex justify-center items-center mt-10"
			>
				<img src="../assets/dummy/1.jpg" />
				<n-button
					type="primary"
					quaternary
					circle
					@click="bookmark.toggleBookmark(index)"
				>
					<template #icon>
						<n-icon>
							<BookmarkOutline v-if="!bookmark.bookmark[index]" />
							<BookmarkSharp v-else />
						</n-icon>
					</template>
				</n-button>
			</div>
		</n-space>
	</div>
</template>
<script setup>
import { BookmarkOutline, BookmarkSharp } from '@vicons/ionicons5';
import { useBookmarkStore, useTextStore } from '../store';

const props = defineProps({
	text: String,
});
const text = useTextStore();
const bookmark = useBookmarkStore();
</script>
<style scoped></style>
