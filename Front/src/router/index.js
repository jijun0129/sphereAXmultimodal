import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		redirect: '/main',
	},
	{
		path: '/main',
		name: 'main',
		component: () => import('@/pages/main.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
