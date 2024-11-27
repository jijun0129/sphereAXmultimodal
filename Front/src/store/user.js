import { defineStore } from 'pinia';

export const useUserStore = defineStore(
	'Users',
	() => {
		const user = ref([{ id: 'asd123', password: 'asd123' }]);
		const token = ref('');
		const isLoggedIn = ref(false);
		const login = newToken => {
			isLoggedIn.value = true;
			token.value = newToken;
		};
		const logout = () => {
			isLoggedIn.value = false;
			token.value = null;
		};
		const setUser = (id, password) => {
			users.value.push({ id, password });
		};

		return { user, token, setUser, login, logout, isLoggedIn };
	},
	{
		persist: true, // 이 옵션으로 자동 저장 활성화
	},
);
