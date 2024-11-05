<template>
	<the-header></the-header>
	<div class="h-screen flex justify-center mt-40">
		<n-card
			content-style="display: flex; flex-direction: column; justify-content: space-between;"
		>
			<n-upload
				multiple
				directory-dnd
				:max="1"
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
</template>
<script setup>
import { ref } from 'vue';
import { ArchiveOutline } from '@vicons/ionicons5';
import { useTextStore } from '../store';
import { useRouter } from 'vue-router';
/* import { useAxios } from '@/composables/useAxios';
import { useSocket } from '@/composables/useSocket'; */

/* const { axios } = useAxios();
const { socket } = useSocket(); */
const router = useRouter();
const inputText = ref('');
const text = useTextStore();
const onSubmit = () => {
	text.setText(inputText.value);
	router.replace('/result');
};
// axios 및 socket 사용 방법 - 주석 처리된 부분 확인
/* onMounted(() => {
	// HTTP 요청 예시
	axios
		.get('/users')
		.then(response => console.log(response.data))
		.catch(error => console.error(error));

	// WebSocket 연결 및 이벤트 리스닝 예시
	socket.connect();
	socket.on('message', data => {
		console.log(data);
	});
});
onBeforeUnmount(() => {
	// 컴포넌트가 제거되기 전에 소켓 연결 해제
	socket.disconnect();
});
const sendMessage = () => {
	socket.emit('chat message', 'Hello, server!');
}; */
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
