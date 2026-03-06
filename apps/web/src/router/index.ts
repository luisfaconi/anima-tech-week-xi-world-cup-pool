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
      path: '/picks',
      name: 'picks',
      component: () => import('../pages/PickPage.vue'),
    },
    {
      path: '/pool',
      name: 'pool',
      component: () => import('../pages/PoolPage.vue'),
    },
  ],
});

export default router;
