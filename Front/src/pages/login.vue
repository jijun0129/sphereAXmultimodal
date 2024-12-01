<template>
	<the-header></the-header>
	<div class="h-screen">
		<n-card class="mx-auto w-5/12 mt-36">
			<div class="w-auto flex flex-col items-center justify-center">
				<div class="text-center m-5 text-xl">
					<h2>로그인</h2>
				</div>
				<div class="mt-5 mx-auto content-center w-2/3">
					<n-form ref="formRef" :model="modelRef">
						<n-form-item path="id" label="아이디" class="mb-3">
							<n-input v-model:value="modelRef.id" @keydown.enter.prevent />
						</n-form-item>
						<n-form-item path="password" label="비밀번호" class="mb-3">
							<n-input
								v-model:value="modelRef.password"
								type="password"
								@input="handlePasswordInput"
								@keydown.enter.prevent
							/>
						</n-form-item>
						<n-row :gutter="[0, 24]">
							<n-col :span="24">
								<div style="display: flex; justify-content: flex-end">
									<n-button
										:disabled="!modelRef.id || !modelRef.password"
										round
										type="primary"
										@click="handleValidateButtonClick"
									>
										로그인
									</n-button>
								</div>
							</n-col>
						</n-row>
					</n-form>
				</div>
				<div class="flex justify-between items-center w-7/12 mt-16 mb-3">
					<div>아이디가 없으신가요?</div>
					<div class="text-blue-300">
						<router-link to="/signup">회원가입하기</router-link>
					</div>
				</div>
			</div>
		</n-card>
	</div>
	<the-footer></the-footer>
</template>

<script setup>
import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import router from '@/router';
import useAxios from '../composables/useAxios.js';
import { useUserStore } from '../store/user.js';

const axiosInstance = useAxios();
const formRef = ref(null);
const rPasswordFormItemRef = ref(null);
const message = useMessage();
const user = useUserStore();
const modelRef = ref({
	id: null,
	password: null,
});
const handlePasswordInput = () => {
	if (modelRef.value.reenteredPassword) {
		rPasswordFormItemRef.value?.validate({ trigger: 'password-input' });
	}
};
const handleValidateButtonClick = e => {
	e.preventDefault();
	formRef.value?.validate(errors => {
		if (!errors) {
			// loginRequest 객체 정의
			const loginRequest = {
				ID: modelRef.value.id,
				PASSWORD: modelRef.value.password,
			};

			// POST 요청 보내기
			axiosInstance.axios
				.post(`/login`, loginRequest, {
					headers: {
						'Content-Type': 'application/json',
					},
				})
				.then(response => {
					message.success('로그인 성공');
					user.login(response.data.token);
					router.replace('/main');
				})
				.catch(() => {
					message.error('로그인 실패');
				});
		} else {
			console.log(errors);
			message.error('로그인 실패');
		}
	});
};
</script>

<style scoped>
.n-card {
	border-radius: 25px;
}
</style>
