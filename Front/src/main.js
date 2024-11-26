import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import TheHeader from './layout/TheHeader.vue';
import BaseButton from './UI/BaseButton.vue';
import TheFooter from './layout/TheFooter.vue';
// composables
import useAxios from './composables/useAxios';
import { useSocketStore } from './store/socket';
import { io } from 'socket.io-client';
import { createPinia } from 'pinia';

const app = createApp(App);

app.use(router);

const pinia = createPinia();
app.use(pinia);

// reset axios & socket
const axiosInstance = useAxios();

axiosInstance.setBaseURL('http://localhost:10111');

// local
// const socket = io('http://serverip:port'); // 이 부분만 수정 (백엔드)
// const server = `http://${socket.io.engine.hostname}:${socket.io.engine.port}`;
// axiosInstance.setBaseURL(server);

// const socketStore = useSocketStore();
// socketStore.initSocket(socket, server);

app.component('the-header', TheHeader);
app.component('the-footer', TheFooter);
app.component('base-button', BaseButton);

app.mount('#app');
