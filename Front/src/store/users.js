import { defineStore } from 'pinia';

export const useUsersStore = defineStore('Users', () => {
	const users = ref([{ id: 'asd123', password: 'asd123', userId: '' }]);

	const setUser = (id, password) => {
		users.value.push({ id, password });
	};
	const isValidUser = (id, password) => {};
	return { users, setUser, isValidUser };
});
