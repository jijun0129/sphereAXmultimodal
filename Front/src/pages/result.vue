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
				<image-data></image-data>
			</div>
		</n-space>
	</div>
</template>
<script setup>
import { useTextStore } from '../store';
import ImageData from '../components/component/ImageData.vue';
const props = defineProps({
	text: String,
});
const text = useTextStore();
</script>
<style scoped></style>
