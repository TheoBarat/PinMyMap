<template>
  <nav class="header">
    <!-- Logo cliquable -->
    <img alt="Logo" src="../assets/PinMyMapLogo.png" class="logo" @click="goToHome" />

    <!-- Menu profil -->
    <div v-if="isLoggedIn" class="profile-menu">
      <img
        alt="Avatar"
        src="../assets/avatar-placeholder.png"
        class="avatar"
        @click="toggleDropdown"
      />
      <span class="user-name" @click="toggleDropdown">
  {{ user.firstName || "Utilisateur" }} {{ user.lastName || "" }}
</span>

      <!-- Menu déroulant pour se déconnecter -->
      <div v-if="showDropdown" class="dropdown-menu">
        <button @click="logout">Se déconnecter</button>
      </div>
    </div>
  </nav>
</template>

<script>
import eventBus from "../eventBus";

export default {
  
  name: "Header",
  data() {
  return {
    isLoggedIn: false, // Indique si l'utilisateur est connecté
    showDropdown: false, // Contrôle l'affichage du menu déroulant
    user: {
      firstName: "",
      lastName: "",
    },
  };
},

  mounted() {
    this.checkAuth(); // Vérifie l'état de connexion
    eventBus.$on("auth-changed", (status) => {
  console.log("Événement auth-changed capté : ", status);
  this.isLoggedIn = status;
  this.showDropdown = false; // Assure que le menu déroulant est fermé
  if (status) {
    this.loadUser(); // Recharge les données utilisateur
  }
});

  },
  
  methods: {
    checkAuth() {
      const token = localStorage.getItem("token");
      this.isLoggedIn = !!token;
      this.showDropdown = false; // Assure que le menu est fermé au chargement
      if (this.isLoggedIn) {
        this.loadUser(); // Recharge les informations utilisateur si connecté
      }
    }
,
    async loadUser() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le payload JWT
          console.log("Payload JWT :", payload); // Affiche les données pour debug
          this.user.firstName = payload.firstName || "Utilisateur";
          this.user.lastName = payload.lastName || "";
        } catch (error) {
          console.error("Erreur lors du décodage du token :", error);
          this.logout(); // Déconnecte si le token est invalide
        }
      }
    },

    
    logout() {
      localStorage.removeItem("token");
      this.isLoggedIn = false;
      this.user = { email: "" };
      this.showDropdown = false; // Assure que le menu est fermé après déconnexion
      this.$router.push("/login");
      this.$root.$emit("auth-changed", false);
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    goToHome() {
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
.header {
  height: 10vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px;
  position: relative;
  z-index: 10000;
}

.logo {
  height: 90px;
  width: 90px;
  cursor: pointer;
}

.profile-menu {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.avatar {
  height: 40px;
  width: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-email {
  font-weight: bold;
  color: #333;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  padding: 12px;
  z-index: 10;
  transition: opacity 0.2s ease-in-out;
}

.dropdown-menu button {
  width: 100%;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 14px;
  color: #333;
}

.dropdown-menu button:hover {
  background-color: #f2f2f2;
}
</style>