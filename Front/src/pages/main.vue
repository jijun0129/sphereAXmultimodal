<template>
	<the-header></the-header>
	<div class="h-screen flex justify-center mt-36">
		<n-card
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

const socket = useSocketStore();
const router = useRouter();
const text = useTextStore();
const inputText = ref('');
const uploadedFile = ref(null);

const handleFileUpload = file => {
	console.log('Uploaded File:', file.file.file); // 파일 객체 출력
	uploadedFile.value = file.file.file; // 파일 저장
	return false; // 자동 업로드 방지
};

const onSubmit = () => {
	text.setText(inputText.value);
	sendMessage();
	router.replace('/result');
};

onMounted(() => {
	// 소켓을 재연결한 뒤, 연결이 완료되었을 때 메시지를 보낼 준비를 한다.
	socket.reconnectSocket();
	socket.on('connect', () => {
		console.log('소켓 연결 완료');
		// 연결이 완료된 후에만 메시지를 보낼 수 있도록 처리
		sendMessage();
	});

	socket.on('searchStatus', data => {
		console.log(data);
	});
});

onBeforeUnmount(() => {
	socket.removeListener();
});

const sendMessage = async () => {
	if (!uploadedFile.value || !inputText.value) {
		console.error('이미지와 텍스트를 모두 입력하세요.');
		return;
	}

	const reader = new FileReader();
	reader.onload = () => {
		const fileData = reader.result; // Base64 파일 데이터
		socket.emit('searchStatus', {
			text: inputText.value,
			image: fileData,
		});
	};
	reader.readAsDataURL(uploadedFile.value);
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
