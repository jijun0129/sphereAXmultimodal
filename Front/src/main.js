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
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const app = createApp(App);

app.use(router);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

// reset axios & socket
const axiosInstance = useAxios();

// local
const socket = io('http://localhost:10111');
const server = `http://${socket.io.engine.hostname}:${socket.io.engine.port}`;
axiosInstance.setBaseURL(server);

const socketStore = useSocketStore();
socketStore.initSocket(socket, server);

app.component('the-header', TheHeader);
app.component('the-footer', TheFooter);
app.component('base-button', BaseButton);

app.mount('#app');
