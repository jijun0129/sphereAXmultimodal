import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		redirect: '/login',
	},
	{
		path: '/main',
		name: 'main',
		component: () => import('@/pages/main.vue'),
	},
	{
		path: '/login',
		name: 'login',
		component: () => import('@/pages/login.vue'),
	},
	{
		path: '/signup',
		name: 'signup',
		component: () => import('@/pages/signup.vue'),
	},
	{
		path: '/result',
		name: 'result',
		component: () => import('@/pages/result.vue'),
	},
	{
		path: '/log',
		name: 'log',
		component: () => import('@/pages/log.vue'),
	},
	{
		path: '/bookmark',
		name: 'bookmark',
		component: () => import('@/pages/bookmark.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
