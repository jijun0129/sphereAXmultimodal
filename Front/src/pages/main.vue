<template>
	<the-header></the-header>
	<div class="h-screen flex flex-col justify-center items-center px-96">
		<n-upload multiple directory-dnd :max="5">
			<n-upload-dragger>
				<div class="mb-3">
					<n-icon size="48" :depth="3">
						<ArchiveOutline />
					</n-icon>
				</div>
				<n-text class="text-base">
					파일을 업로드하려면 이 영역을 클릭하거나 파일을 끌어다 놓으세요.
				</n-text>
				<n-p depth="3" class="mt-2">
					궁금한 점 있으시면 편하게 연락주세요 궁금한 점 있으시면 편하게
					연락주세요 궁금한 점 있으시면 편하게 연락주세요 궁금한 점 있으시면
					편하게 연락주세요
				</n-p>
			</n-upload-dragger>
		</n-upload>

		<div class="mt-4">
			<n-space>
				<n-card
					v-for="(item, index) in 5"
					size="small"
					title="Title"
					class="w-40"
				>
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
		</div>

		<div class="mt-4">
			<n-space>
				<n-input v-model:value="text"></n-input>
				<n-button type="primary" :disabled="!text">제출하기</n-button>
			</n-space>
			<div class="mt-2.5 flex justify-center">
				<n-input :value="text" show-count readonly />
			</div>
		</div>
	</div>
</template>
<script setup>
import { ref } from 'vue';
import {
	ArchiveOutline,
	BookmarkOutline,
	BookmarkSharp,
} from '@vicons/ionicons5';
import TheHeader from '../components/layout/TheHeader.vue';
/* import { useAxios } from '@/composables/useAxios';
import { useSocket } from '@/composables/useSocket'; */

/* const { axios } = useAxios();
const { socket } = useSocket(); */

const bookmarked = ref([false, false, false, true, false]);
const text = ref(); // input

const toggleBookmark = index => {
	bookmarked.value[index] = !bookmarked.value[index];
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
<style scoped></style>
