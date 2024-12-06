<template>
    <div class="auth-container">
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
  </template>
  
  <script>
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
            alert("Login successful");
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
  