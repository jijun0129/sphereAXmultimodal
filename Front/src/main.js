import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import pinia from './store/index.js';
import TheHeader from './components/layout/TheHeader.vue';
import BaseButton from './components/UI/BaseButton.vue';
import BaseCard from './components/UI/BaseCard.vue';
import TheFooter from './components/layout/TheFooter.vue';
// composables
import useAxios from './composables/useAxios';
import { useSocketStore } from './store/socket';
import { io } from 'socket.io-client';

const app = createApp(App);

app.use(router);
app.use(pinia);

// reset axios & socket
const axiosInstance = useAxios();

// local
const socket = io('http://serverip:port'); // 이 부분만 수정 (백엔드)
const server = `http://${socket.io.engine.hostname}:${socket.io.engine.port}`;
axiosInstance.setBaseURL(server);

const socketStore = useSocketStore();
socketStore.initSocket(socket, server);

// app.vue
app.component('the-header', TheHeader);
app.component('the-footer', TheFooter);
app.component('base-button', BaseButton);
app.component('base-card', BaseCard);

app.mount('#app');
