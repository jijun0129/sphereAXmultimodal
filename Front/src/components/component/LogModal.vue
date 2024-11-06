<template>
	<div class="modal-overlay" @click.self="close">
		<div class="modal-content">
			<button @click="close" class="close-button">×</button>
			<div>{{ log.date }}</div>
			<div>{{ log.text }}</div>
		</div>
	</div>
</template>

<script setup>
const emit = defineEmits(['close']);
const props = defineProps(['log']);
const close = () => {
	emit('close');
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
	background: #727272;
	padding: 20px;
	border-radius: 8px;
	width: 80%;
	max-width: 500px;
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
