import { createApp } from 'vue';
import { createPinia } from 'pinia';

import Shortkey from 'vue-three-shortkey';
import i18n from './i18n';
import App from './App.vue';
import router from './router';

import 'normalize.css/normalize.css';
import './assets/styles/main.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Shortkey, { prevent: ['input', 'textarea'] });

app.mount('#app');
