<template>
  <nav class="header">
    <!-- Logo cliquable -->
    <img alt="Logo" src="../assets/PinMyMapLogo.png" class="logo" @click="goToHome" />

    <!-- Bouton de connexion ou menu profil -->
    <div v-if="!isLoggedIn" class="auth-button">
      <CustomButton
        buttonText="Se connecter"
        :buttonColor="'rgb(254, 65, 77)'"
        buttonSize="16px"
        @click="login"
      />
    </div>
    <div v-else class="profile-menu">
      <!-- Avatar et nom de l'utilisateur cliquables pour afficher le menu -->
      <img alt="Avatar" src="../assets/avatar-placeholder.png" class="avatar" @click="toggleDropdown" />
      <span class="user-name" @click="toggleDropdown">{{ user.firstName }} {{ user.lastName }}</span>

      <!-- Menu déroulant pour se déconnecter -->
      <div v-if="showDropdown" class="dropdown-menu">
        <button @click="logout">Se déconnecter</button>
      </div>
    </div>
  </nav>
</template>

<script>
import CustomButton from "../components/Button.vue";

export default {
  name: "Header",
  components: {
    CustomButton,
  },
  data() {
    return {
      isLoggedIn: false,
      showDropdown: false,
      user: {
        firstName: "Jean",
        lastName: "Dupont",
      },
    };
  },
  methods: {
    goToHome() {
      this.$router.push('/');
    },
    login() {
      this.isLoggedIn = true;
    },
    logout() {
      this.isLoggedIn = false;
      this.showDropdown = false;
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
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

.auth-button {
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

.user-name {
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