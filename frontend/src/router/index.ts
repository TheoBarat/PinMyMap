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
    path: '/leaderboard',
    name: 'leaderboard',
    component: Leaderbord,
  },
  {
    path: '/',
    redirect: '/login', 
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Protéger les routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  if (isAuthenticated) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        console.log("Token expiré, déconnexion automatique.");
        localStorage.removeItem("token"); // Nettoyage
        return next({ name: "login" });
      }
    } catch (error) {
      console.error("Erreur de décodage du token :", error);
      localStorage.removeItem("token"); // Nettoyage en cas d'erreur
      return next({ name: "login" });
    }
  }

  if (to.name !== "login" && !isAuthenticated) {
    next({ name: "login" });
  } else if (to.name === "login" && isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;