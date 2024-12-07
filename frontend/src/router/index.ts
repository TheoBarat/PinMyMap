import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/MapView.vue';
import Login from '../components/Login.vue';
import Leaderbord from '../components/CountryRanking.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/leaderbord',
    name: 'leaderbord',
    component: Leaderbord,
  },
  {
    path: '/',
    redirect: '/login', // Redirige automatiquement vers /login
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Protéger les routes
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Vérifie si un token est présent
  if (to.name !== 'login' && !isAuthenticated) {
    next({ name: 'login' }); // Redirige vers /login si non connecté
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'home' }); // Redirige vers /home si déjà connecté
  } else {
    next(); // Continue normalement
  }
});

export default router;