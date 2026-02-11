import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/admin'),
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
    {
      path: '/branding',
      name: 'branding',
      component: () => import('@/pages/BrandingPage.vue'),
    },
  ],
})

export default router
