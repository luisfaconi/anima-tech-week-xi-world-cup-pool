import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/HomePage.vue'),
    },
    {
      path: '/palpites',
      name: 'palpites',
      component: () => import('../pages/PalpitesPage.vue'),
    },
  ],
});

export default router;
