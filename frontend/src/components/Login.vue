<template>
  <div class="auth-container">
    <div class="auth-card">
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
import eventBus from "../eventBus";

export default {
  data() {
    return {
      email: "",
      password: "",
      isLoginMode: true, // Mode par défaut : Login
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
          localStorage.setItem("token", result.token);
          console.log("Login réussi, token sauvegardé :", result.token);
          eventBus.$emit("auth-changed", true); // Émet l’événement via l’event bus
          this.$router.push("/home");
        } else {
          alert(result.message || "Login failed");
        }
      } catch (error) {
        console.error("Erreur lors du login :", error);
      }
    },
    async handleSignup() {
      try {
        const response = await fetch("http://localhost:3001/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });
        const result = await response.json();
        if (response.ok) {
          alert("Signup successful, you can now login!");
          this.isLoginMode = true;
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
  