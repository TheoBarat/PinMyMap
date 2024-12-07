<template>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
    />
    <div class="auth-container">
      <!-- Couche pour le flou de l'image de fond -->
      <div class="background-blur"></div>
      <!-- Couche pour améliorer la lisibilité avec un overlay -->
      <div class="auth-overlay"></div>
      <div class="auth-card">
        <h1>{{ isLoginMode ? "Login" : "Sign Up" }}</h1>
        <form @submit.prevent="isLoginMode ? handleLogin() : handleSignup()">
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" required />
          </div>
  
          <!-- Password -->
          <div class="form-group password-group">
            <label for="password">Password</label>
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
            />
            <span class="toggle-password" @click="togglePasswordVisibility">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
  
          <!-- First Name and Last Name (Sign Up only) -->
          <div v-if="!isLoginMode" class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" v-model="firstName" required />
          </div>
          <div v-if="!isLoginMode" class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" v-model="lastName" required />
          </div>
  
          <!-- Error/Success Message -->
          <div v-if="message" :class="messageType" class="message">
            {{ message }}
          </div>
  
          <!-- Submit Button -->
          <button type="submit" class="primary-btn">
            {{ isLoginMode ? "Login" : "Sign Up" }}
          </button>
        </form>
        <!-- Toggle Login/Sign Up -->
        <button @click="toggleMode" class="secondary-btn">
          {{ isLoginMode ? "Create an account" : "Already have an account?" }}
        </button>
      </div>
    </div>
  </template>
  
  
  <script>
  import eventBus from "../eventBus";
  
  export default {
    data() {
      return {
        email: "",
        password: "",
        firstName: "",
        lastName: "",
        isLoginMode: true,
        showPassword: false, // Contrôle de la visibilité du mot de passe
        message: "", // Message d'erreur ou de succès
        messageType: "", // Type de message (erreur ou succès)
      };
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
            localStorage.setItem("token", result.token); // Stocke le token
            eventBus.$emit("auth-changed", true); // Émet un événement de connexion
            this.message = "Login successful!";
            this.messageType = "success";
            this.$router.push("/home"); // Redirige vers la page d'accueil
          } else {
            this.message = result.message || "Login failed";
            this.messageType = "error";
          }
        } catch (error) {
          console.error("Erreur lors du login :", error);
          this.message = "An error occurred during login.";
          this.messageType = "error";
        }
      },
  
      async handleSignup() {
        try {
          const response = await fetch("http://localhost:3001/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: this.email,
              password: this.password,
              firstName: this.firstName,
              lastName: this.lastName,
            }),
          });
          const result = await response.json();
          if (response.ok) {
            this.message = "Signup successful, you can now login!";
            this.messageType = "success";
            this.isLoginMode = true; // Basculer vers le mode login
          } else {
            this.message = result.message || "Signup failed";
            this.messageType = "error";
          }
        } catch (error) {
          console.error("Erreur lors de l'inscription :", error);
          this.message = "An error occurred during signup.";
          this.messageType = "error";
        }
      },
  
      toggleMode() {
        this.isLoginMode = !this.isLoginMode;
        this.message = ""; // Réinitialiser les messages
      },
  
      togglePasswordVisibility() {
        this.showPassword = !this.showPassword; // Basculer la visibilité du mot de passe
      },
    },
  };
  </script>

<style scoped>
/* Conteneur principal */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 90vh;
  position: relative;
  overflow: hidden;
}

/* Image de fond avec flou */
.background-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90vh;
  background: url("../assets/carte.png") no-repeat center center fixed;
  background-size: cover;
  filter: blur(8px); /* Ajustez la valeur pour plus ou moins de flou */
  z-index: 0;
}

/* Overlay semi-transparent pour améliorer la lisibilité */
.auth-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90vh;
  background-color: rgba(0, 0, 0, 0.5); /* Réglez la transparence */
  z-index: 1;
}

/* Carte d'authentification */
.auth-card {
  background: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  z-index: 2;
}

/* Champ de formulaire */
.form-group {
  margin-bottom: 1rem;
  text-align: left;
  position: relative;
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
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #007bff;
}

/* Toggle visibility */
.password-group .toggle-password {
  position: absolute;
  right: 10px;
  top: 70%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #888;
}

.password-group .toggle-password:hover {
  color: #007bff;
}

/* Boutons */
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

/* Messages */
.message {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
