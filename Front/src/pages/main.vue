<template>
	<the-header></the-header>
	<div class="h-screen flex justify-center mt-36">
		<n-card v-if="isLoading" content-style="display: flex;">
			<loading-spinner></loading-spinner>
		</n-card>
		<n-card
			v-else
			content-style="display: flex; flex-direction: column; justify-content: space-between;"
		>
			<n-upload
				:max="1"
				:on-before-upload="handleFileUpload"
				class="mt-20 mx-auto"
				style="width: 85%"
			>
				<n-upload-dragger style="height: 200px">
					<div class="mb-5 mt-3">
						<n-icon size="48" :depth="3">
							<ArchiveOutline />
						</n-icon>
					</div>
					<n-text class="text-base">
						파일을 업로드하려면 이 영역을 클릭하거나 파일을 끌어다 놓으세요.
					</n-text>
					<n-p depth="3" class="mt-2">
						이미지 파일을 한 장 업로드 해주세요
					</n-p>
				</n-upload-dragger>
			</n-upload>

			<div class="mb-20 mx-auto" style="width: 85%">
				<n-space justify="space-between">
					<n-input
						v-model:value="inputText"
						type="textarea"
						placeholder="텍스트를 입력해주세요"
					/>
					<div class="mt-12">
						<n-button
							type="primary"
							size="large"
							round
							:disabled="!inputText"
							@click="onSubmit"
							>제출하기
						</n-button>
					</div>
				</n-space>
			</div>
		</n-card>
	</div>
	<the-footer></the-footer>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { ArchiveOutline } from '@vicons/ionicons5';
import { useTextStore } from '../store/text.js';
import { useRouter } from 'vue-router';
import { useSocketStore } from '@/store/socket.js';
import { useUserStore } from '../store/user.js';
import { useResultsStore } from '../store/results.js';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const socket = useSocketStore();
const router = useRouter();
const text = useTextStore();
const resultData = useResultsStore();
const { token } = useUserStore();
const inputText = ref('');
const uploadedFile = ref(null);
const isLoading = ref(false);

const handleFileUpload = file => {
	console.log('Uploaded File:', file.file);
	uploadedFile.value = file.file;
	return true;
};

const onSubmit = () => {
	text.setText(inputText.value);
	sendMessage();
};

onMounted(() => {
	if (!socket.auth) {
		socket.emit('authenticate', token);
	}
	socket.on('searchComplete', receiveMessage);
});

onBeforeUnmount(() => {
	socket.removeListener('searchComplete', receiveMessage);
});

const sendMessage = async () => {
	if (!uploadedFile.value || !inputText.value) {
		console.log(inputText.value);
		console.error('이미지와 텍스트를 모두 입력하세요.');
		return;
	}

	isLoading.value = true;

	const reader = new FileReader();
	reader.onload = () => {
		const fileData = reader.result; // Base64 파일 데이터
		const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
		socket.emit('search', {
			text: inputText.value,
			image: {
				data: base64Data, // Base64 형식 데이터
				name: uploadedFile.value.file.name,
			},
		});
	};
	reader.readAsDataURL(uploadedFile.value.file);
};
const receiveMessage = data => {
	const { status, searchId, results, message } = data;
	isLoading.value = false;
	if (status === 'completed') {
		resultData.setResults(searchId, results);
		router.replace('/result');
	}
};
</script>
<style scoped>
.center {
	display: flex;
	flex-direction: column;
	align-items: center; /* 수평 중앙 정렬 */
	justify-content: center; /* 수직 중앙 정렬 */
	height: 90vh;
}
.n-card {
	border-radius: 25px;
	width: 60%;
	height: 60%;
}
.n-input {
	width: 750px;
}
</style>
