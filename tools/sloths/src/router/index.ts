import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/About.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/Profile.vue'),
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('../views/Catalog.vue'),
    },
    {
      path: '/create',
      name: 'create',
      component: () => import('../views/Create.vue'),
    },
    {
      path: '/merch',
      name: 'merch',
      component: () => import('../views/Merch.vue'),
    },
    {
      path: '/guess',
      name: 'guess',
      component: () => import('../views/Guess.vue'),
    },
    {
      path: '/memory',
      name: 'memory',
      component: () => import('../views/Memory.vue'),
    },
    {
      path: '/suggest',
      name: 'suggest',
      component: () => import('../views/Suggestion.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
    },
    // 404 always last item
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
});

export default router;
