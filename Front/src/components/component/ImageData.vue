<template>
	<img src="../../assets/dummy/1.jpg" />
	<n-button type="primary" quaternary circle>
		<template #icon>
			<n-icon>
				<BookmarkOutline v-if="!props.bookmark" />
				<BookmarkSharp v-else />
			</n-icon>
		</template>
	</n-button>
</template>
<script setup>
import { BookmarkOutline, BookmarkSharp } from '@vicons/ionicons5';
import { useBookmarkStore } from '../../store';
const bookmark = useBookmarkStore();
const props = defineProps({
	src: String,
	bookmark: Boolean,
});
</script>
