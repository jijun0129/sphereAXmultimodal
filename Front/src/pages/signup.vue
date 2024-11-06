<template>
	<the-header :isLoggedIn="false"></the-header>
	<div class="h-screen flex justify-center mt-40">
		<n-card>
			<div class="flex flex-col items-center justify-center">
				<div class="text-center m-5 text-xl">
					<h2>회원가입</h2>
				</div>
				<div class="mb-20 mx-auto content-center" style="width: 70%">
					<n-space>
						<div class="flex mt-5">
							<p>아이디</p>
							<n-input v-model:value="inputId" type="text" placeholder="id" />
						</div>
						<div class="flex mt-5">
							<p>비밀번호</p>
							<n-input
								v-model:value="inputPassword"
								type="text"
								placeholder="password"
							/>
						</div>
						<div class="flex mt-5">
							<p>비밀번호 확인</p>
							<n-input
								v-model:value="inputPassword"
								type="text"
								placeholder="password"
							/>
						</div>
						<div class="mt-5">
							<n-button type="primary" size="large" round @click="onSubmit"
								>회원가입
							</n-button>
						</div>
					</n-space>
				</div>
				<div>
					<div>아이디가 이미 있으신가요?</div>
					<div><router-link to="/login">로그인하기</router-link></div>
				</div>
			</div>
		</n-card>
	</div>
</template>
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUsersStore } from '../store';
const router = useRouter();
const Users = useUsersStore();
const inputId = ref('');
const inputPassword = ref('');
const onSubmit = () => {
	Users.setUser({ inputId, inputPassword });
	router.replace('/login');
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
