<template>
    <div class="auth-container">
      <div v-if="currentUser" class="user-info">
        <h1>Connecté en tant que <span>{{ currentUser }}</span></h1>
        <button @click="logout" class="logout-btn">Se déconnecter</button>
      </div>
      <div v-else class="auth-card">
        <h1>{{ isLoginMode ? "Login" : "Sign Up" }}</h1>
        <form @submit.prevent="isLoginMode ? handleLogin() : handleSignup()">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit" class="primary-btn">
            {{ isLoginMode ? "Login" : "Sign Up" }}
          </button>
        </form>
        <button @click="toggleMode" class="secondary-btn">
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
          console.log("Données envoyées pour inscription :", this.email, this.password);
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
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f9f9f9;
  }
  
  .auth-card {
    background: #ffffff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    text-align: center;
  }
  
  .user-info {
    text-align: center;
  }
  
  .user-info h1 {
    font-size: 1.5rem;
    color: #333333;
  }
  
  .user-info span {
    color: #007bff;
  }
  
  .form-group {
    margin-bottom: 1rem;
    text-align: left;
  }
  
  label {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    color: #555555;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border: 1px solid #dddddd;
    border-radius: 4px;
  }
  
  input:focus {
    outline: none;
    border-color: #007bff;
  }
  
  button {
    width: 100%;
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
  }
  
  .primary-btn {
    background: #007bff;
    color: white;
    font-weight: bold;
    transition: background 0.3s;
  }
  
  .primary-btn:hover {
    background: #0056b3;
  }
  
  .secondary-btn {
    background: transparent;
    color: #007bff;
    font-weight: bold;
    margin-top: 1rem;
    border: 1px solid #007bff;
    transition: all 0.3s;
  }
  
  .secondary-btn:hover {
    background: #007bff;
    color: white;
  }
  
  .logout-btn {
    background: #dc3545;
    color: white;
    padding: 0.5rem 1rem;
    font-weight: bold;
    border-radius: 4px;
    transition: background 0.3s;
  }
  
  .logout-btn:hover {
    background: #a71d2a;
  }
  </style>
  