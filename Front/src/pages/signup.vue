<template>
	<the-header :isLoggedIn="false"></the-header>
	<n-card class="mx-auto w-5/12 mt-36">
		<div class="w-auto flex flex-col items-center justify-center">
			<div class="text-center m-5 text-xl">
				<h2>회원가입</h2>
			</div>
			<div class="mt-5 mx-auto content-center w-2/3">
				<n-form ref="formRef" :model="model" :rules="rules">
					<n-form-item path="id" label="아이디" class="mb-3">
						<n-input v-model:value="model.id" @keydown.enter.prevent />
					</n-form-item>
					<n-form-item path="password" label="비밀번호" class="mb-3">
						<n-input
							v-model:value="model.password"
							type="password"
							@input="handlePasswordInput"
							@keydown.enter.prevent
						/>
					</n-form-item>
					<n-form-item
						ref="rPasswordFormItemRef"
						first
						path="reenteredPassword"
						label="비밀번호 확인"
						class="mb-3"
					>
						<n-input
							v-model:value="model.reenteredPassword"
							type="password"
							@keydown.enter.prevent
						/>
					</n-form-item>
					<n-row :gutter="[0, 24]">
						<n-col :span="24">
							<div style="display: flex; justify-content: flex-end">
								<n-button
									round
									type="primary"
									@click="handleValidateButtonClick"
								>
									회원가입
								</n-button>
							</div>
						</n-col>
					</n-row>
				</n-form>
			</div>
			<div class="flex justify-between items-center w-7/12 mt-16 mb-3">
				<div>아이디가 이미 있으신가요?</div>
				<div><router-link to="/login">로그인하기</router-link></div>
			</div>
		</div>
	</n-card>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useMessage } from 'naive-ui';
import router from '../router';

export default defineComponent({
	setup() {
		const formRef = ref(null);
		const rPasswordFormItemRef = ref(null);
		const message = useMessage();
		const modelRef = ref({
			id: null,
			password: null,
			reenteredPassword: null,
		});
		function validatePasswordStartWith(rule, value) {
			return (
				!!modelRef.value.password &&
				modelRef.value.password.startsWith(value) &&
				modelRef.value.password.length >= value.length
			);
		}
		function validatePasswordSame(rule, value) {
			return value === modelRef.value.password;
		}
		const rules = {
			id: [
				{
					required: true,
					validator(rule, value) {
						if (!value) {
							return new Error('Age is required');
						}
						return true;
					},
					trigger: ['input', 'blur'],
				},
			],
			password: [
				{
					required: true,
					message: 'Password is required',
				},
			],
			reenteredPassword: [
				{
					required: true,
					message: 'Re-entered password is required',
					trigger: ['input', 'blur'],
				},
				{
					validator: validatePasswordStartWith,
					message: 'Password is not same as re-entered password!',
					trigger: 'input',
				},
				{
					validator: validatePasswordSame,
					message: 'Password is not same as re-entered password!',
					trigger: ['blur', 'password-input'],
				},
			],
		};
		return {
			formRef,
			rPasswordFormItemRef,
			model: modelRef,
			rules,
			handlePasswordInput() {
				if (modelRef.value.reenteredPassword) {
					rPasswordFormItemRef.value?.validate({ trigger: 'password-input' });
				}
			},
			handleValidateButtonClick(e) {
				e.preventDefault();
				formRef.value?.validate(errors => {
					if (!errors) {
						message.success('Valid');
						router.replace('/login');
					} else {
						console.log(errors);
						message.error('Invalid');
					}
				});
			},
		};
	},
});
</script>
<style scoped>
.n-card {
	border-radius: 25px;
}
</style>
