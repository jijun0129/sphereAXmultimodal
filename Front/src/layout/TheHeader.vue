<template>
	<header>
		<nav v-if="user.isLoggedIn">
			<h1><router-link to="/main">스피어AX</router-link></h1>
			<ul>
				<li><router-link to="/main">검색하기</router-link></li>
				<li><router-link to="/log">검색기록</router-link></li>
				<li><router-link to="/bookmark">북마크</router-link></li>
				<li>
					<base-button @click="handleLogout"> 로그아웃 </base-button>
				</li>
			</ul>
		</nav>
		<nav v-else>
			<h1><router-link to="/login">스피어AX</router-link></h1>
		</nav>
	</header>
</template>
<script setup>
import router from '../router/index.js';
import { useUserStore } from '../store/user.js';
const user = useUserStore();

const handleLogout = () => {
	user.logout();
	router.replace('/login');
};
</script>
<style scoped>
header {
	width: 100%;
	height: 5rem;
	background-color: #121212;
	display: flex;
	justify-content: center;
	align-items: center;
}

header a {
	text-decoration: none;
	display: inline-block;
	padding: 0.75rem 1.5rem;
	border: 1px solid transparent;
}

a:active,
a:hover,
a.router-link-active {
	border: 1px solid #ffffff;
}

h1 {
	font-size: large;
	margin: 0;
}

h1 a {
	color: white;
	margin: 0;
}

h1 a:hover,
h1 a:active,
h1 a.router-link-active {
	border-color: transparent;
}

header nav {
	width: 90%;
	margin: auto;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

header ul {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

li {
	margin: 0 0.5rem;
}
</style>
