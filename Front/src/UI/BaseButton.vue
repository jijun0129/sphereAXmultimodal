<template>
	<n-button v-if="!link" :class="mode">
		<slot></slot>
	</n-button>
	<router-link v-else :to="to" :class="mode">
		<slot></slot>
	</router-link>
</template>
<script setup>
const props = defineProps({
	mode: {
		type: String,
		required: false,
		default: null,
	},
	link: {
		type: Boolean,
		required: false,
		default: false,
	},
	to: {
		type: String,
		required: false,
		default: '/',
	},
});
</script>
<style scoped>
button,
a {
	text-decoration: none;
	padding: 0.75rem 1.5rem;
	font: inherit;
	background-color: #4598fe;
	border: 1px solid #4598fe;
	color: white;
	cursor: pointer;
	border-radius: 30px;
	margin-right: 0.5rem;
	display: inline-block;
}

a:hover,
button:hover {
	background-color: #0574fd;
	border-color: #0574fd;
}
</style>
