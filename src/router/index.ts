import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
    },
    {
      path: '/speakers',
      name: 'speakers',
      component: () => import('@/pages/SpeakersPage.vue'),
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('@/pages/FaqPage.vue'),
    },
    {
      path: '/locales',
      name: 'locales',
      component: () => import('@/pages/LocalesPage.vue'),
    },
  ],
})

export default router
