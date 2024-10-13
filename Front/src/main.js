import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import pinia from './store/index.js';
import axiosInstance from './plugins/axios';
import socket from './plugins/socket';
import BaseButton from './components/UI/BaseButton.vue';

const app = createApp(App);

app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$socket = socket;

app.use(router);
app.use(pinia);

app.component('base-button', BaseButton);

app.mount('#app');
