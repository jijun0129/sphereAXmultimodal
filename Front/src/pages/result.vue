<template>
	<h2>검색결과</h2>
	<p>{{ text }}</p>
	<n-space>
		<n-card v-for="(item, index) in 5" size="small" title="title" class="w-40">
			<template #header-extra>
				<n-button
					type="primary"
					quaternary
					circle
					@click="toggleBookmark(index)"
				>
					<template #icon>
						<n-icon>
							<BookmarkOutline v-if="!bookmarked[index]" />
							<BookmarkSharp v-else />
						</n-icon>
					</template>
				</n-button>
			</template>
			<template #cover>
				<div class="bg-black h-32 w-full flex justify-center items-center">
					IMG
				</div>
			</template>
			Content
		</n-card>
	</n-space>
</template>
<script setup>
import { BookmarkOutline, BookmarkSharp } from '@vicons/ionicons5';
const props = defineProps({
	text: String,
});
const bookmarked = ref([false, false, false, true, false]);

const toggleBookmark = index => {
	bookmarked.value[index] = !bookmarked.value[index];
};
</script>
<style scoped></style>
