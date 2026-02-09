import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'listado', component: () => import('../views/ListadoView.vue') },
    { path: '/:id', name: 'solicitud', component: () => import('../views/SolicitudView.vue') },
    { path: '/pruebas', name: 'pruebas', component: () => import('../views/Pruebas.vue') },
    { path: '/pruebas2', name: 'pruebas2', component: () => import('../views/Pruebas2.vue') },
    { path: '/pruebas3/:nombre', name: 'pruebas3', component: () => import('../views/Pruebas3.vue') },
  ],
});

export default router;
