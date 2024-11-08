import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router/index.js';
import pinia from './store/index.js';
import axiosInstance from './plugins/axios';
import socket from './plugins/socket';
import TheHeader from './components/layout/TheHeader.vue';
import BaseButton from './components/UI/BaseButton.vue';
import BaseCard from './components/UI/BaseCard.vue';
import TheFooter from './components/layout/TheFooter.vue';

const app = createApp(App);

app.config.globalProperties.$axios = axiosInstance;
app.config.globalProperties.$socket = socket;

app.use(router);
app.use(pinia);

app.component('the-header', TheHeader);
app.component('the-footer', TheFooter);
app.component('base-button', BaseButton);
app.component('base-card', BaseCard);

app.mount('#app');
