<template>
	<div class="flex mx-auto" style="width: 80%">
		<div class="flex-auto w-1/4 text-center">{{ date }}</div>
		<div class="flex-auto w-3/4 text-center">{{ text }}</div>
	</div>
</template>
<script setup>
const props = defineProps({
	text: String,
	date: String,
});
const emit = defineEmits(['date', 'text']);

const handleClick = () => {
	emptyImage('log-click');
};
</script>
