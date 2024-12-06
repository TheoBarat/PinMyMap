<template>
    <div class="auth-container">
      <div v-if="currentUser">
        <h1>Connecté en tant que {{ currentUser }}</h1>
        <button @click="logout">Se déconnecter</button>
      </div>
      <div v-else>
        <h1 v-if="isLoginMode">Login</h1>
        <h1 v-else>Sign Up</h1>
        <form @submit.prevent="isLoginMode ? handleLogin() : handleSignup()">
          <div>
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div>
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit">
            {{ isLoginMode ? "Login" : "Sign Up" }}
          </button>
        </form>
        <button @click="toggleMode">
          {{ isLoginMode ? "Create an account" : "Already have an account?" }}
        </button>
      </div>
    </div>
  </template>
  
  
  <script>
  export default {
    data() {
      return {
        email: "",
        password: "",
        isLoginMode: true, // Mode par défaut : Login
        currentUser: null, // Utilisateur connecté
      };
    },
    mounted() {
    this.checkAuth(); // Vérifie l'authentification au chargement
  },

    methods: {
      async handleLogin() {
        try {
            const response = await fetch("http://localhost:3001/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: this.email, password: this.password }),
            });
            const result = await response.json();
            if (response.ok) {
            alert("Login successful");
            localStorage.setItem("token", result.token); // Stocke le token
            this.checkAuth(); // Vérifie l'état d'authentification
            } else {
            alert(result.message || "Login failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
        }
        },
        async handleSignup() {
  try {
    console.log("Données envoyées pour inscription :", this.email, this.password); // Log pour déboguer
    const response = await fetch("http://localhost:3001/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: this.email, password: this.password }),
    });
    const result = await response.json();
    if (response.ok) {
      alert("Signup successful, you can now login!");
      this.isLoginMode = true; // Bascule vers le mode login après inscription
    } else {
      alert(result.message || "Signup failed");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    alert("An error occurred during signup.");
  }
},

      toggleMode() {
        this.isLoginMode = !this.isLoginMode;
      },
      checkAuth() {
      const token = localStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1])); // Décoder le payload JWT
        this.currentUser = payload.email; // Met à jour l'utilisateur connecté
      } else {
        this.currentUser = null; // Pas de token, pas d'utilisateur connecté
      }
    },
    logout() {
      localStorage.removeItem("token"); // Supprime le token
      this.currentUser = null; // Réinitialise l'état utilisateur
    },

    },
  };
  </script>
  
  <style scoped>
  .auth-container {
    width: 300px;
    margin: auto;
    text-align: center;
  }
  form div {
    margin-bottom: 10px;
  }
  button {
    margin-top: 10px;
  }
  </style>
  