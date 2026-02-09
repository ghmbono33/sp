import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/main.css';
import { createApp } from 'vue';
// Pinia es el gestor de estado
import { createPinia } from 'pinia';

// import para poder ver los message de Ant Design
import 'ant-design-vue/es/message/style/css';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
