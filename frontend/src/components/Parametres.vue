<template>
    <div class="account-settings">
      <h1>Paramètres de compte</h1>
  
      <!-- Affichage des messages -->
      <div v-if="message" :class="`message ${messageType}`">
        {{ message }}
      </div>
  
      <form @submit.prevent="updateAccount">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input
            type="text"
            id="username"
            v-model="account.username"
            placeholder="Modifier votre nom d'utilisateur"
          />
        </div>
  
        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <input
            type="password"
            id="password"
            v-model="account.password"
            placeholder="Entrer un nouveau mot de passe"
          />
        </div>
  
        <div class="form-group">
          <label for="confirm-password">Confirmer le mot de passe</label>
          <input
            type="password"
            id="confirm-password"
            v-model="account.confirmPassword"
            placeholder="Confirmer le mot de passe"
          />
        </div>

        <div class="form-group">
            <label for="firstName">Prénom</label>
            <input
                type="text"
                id="firstName"
                v-model="account.firstName"
                placeholder="Modifier votre prénom"
            />
            </div>

            <div class="form-group">
            <label for="lastName">Nom</label>
            <input
                type="text"
                id="lastName"
                v-model="account.lastName"
                placeholder="Modifier votre nom"
            />
            </div>
  
        <button type="submit" class="save-button">Sauvegarder</button>
        <button type="button" class="delete-button" @click="deleteAccount">Supprimer le compte</button>
      </form>
    </div>
  </template>
  
  
  
  <script>

  const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Une erreur s'est produite.");
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return null; // Retourne null pour les réponses sans contenu
};

export default {
  name: "AccountSettings",
  data() {
    return {
      account: {
        username: "",
        password: "",
        confirmPassword: "",
      },
      message: "", // Message d'erreur ou de succès
      messageType: "", // Type de message : success ou error
    };
  },
  
  methods: {
    async updateAccount() {
  const updates = {}; // Objet pour stocker les champs à mettre à jour

  // Valider le nom d'utilisateur (email) s'il est renseigné
  if (this.account.username) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.account.username)) {
      this.message = "Veuillez entrer un email valide.";
      this.messageType = "error";
      return;
    }
    updates.email = this.account.username; // Ajouter l'email à l'objet de mise à jour
  }

  // Ajouter le prénom s'il est renseigné
  if (this.account.firstName) {
    updates.firstName = this.account.firstName.trim();
  }

  // Ajouter le nom de famille s'il est renseigné
  if (this.account.lastName) {
    updates.lastName = this.account.lastName.trim();
  }

  // Valider et ajouter le mot de passe s'il est renseigné
  if (this.account.password || this.account.confirmPassword) {
    if (this.account.password !== this.account.confirmPassword) {
      this.message = "Les mots de passe ne correspondent pas.";
      this.messageType = "error";
      return;
    }
    updates.password = this.account.password;
  }

  // Vérifier qu'il y a au moins un champ à mettre à jour
  if (Object.keys(updates).length === 0) {
    this.message = "Veuillez remplir au moins un champ à mettre à jour.";
    this.messageType = "error";
    return;
  }

  try {
    const response = await fetch("http://localhost:3001/api/account", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(updates),
    });

    await handleResponse(response);

    // Déterminer le message de succès
    const updatedFields = [];
    if (updates.email) updatedFields.push("Nom d'utilisateur");
    if (updates.firstName) updatedFields.push("Prénom");
    if (updates.lastName) updatedFields.push("Nom de famille");
    if (updates.password) updatedFields.push("Mot de passe");

    this.message = `${updatedFields.join(", ")} mis à jour avec succès !`;
    this.messageType = "success";
  } catch (error) {
    console.error(error);
    this.message = error.message || "Une erreur s'est produite.";
    this.messageType = "error";
  }
},

    async deleteAccount() {
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
        return;
    }

    try {
        const response = await fetch("http://localhost:3001/api/account", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        });

        await handleResponse(response); // Vérifie si la suppression a réussi

        // Message de succès
        this.message = "Compte supprimé avec succès.";
        this.messageType = "success";

        // Déconnecter l'utilisateur
        localStorage.removeItem("token");

        // Rediriger vers la page de connexion
        setTimeout(() => {
        this.$router.push("/login");
        }, 1000); // Attente facultative avant redirection
    } catch (error) {
        console.error(error);
        this.message = error.message || "Une erreur s'est produite.";
        this.messageType = "error";
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
  },
};
</script>

  
  <style scoped>
  .account-settings {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  h1 {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: bold;
  }
  
  .save-button {
    background-color: #4caf50;
    color: white;
    margin-right: 10px;
  }
  
  .delete-button {
    background-color: #f44336;
    color: white;
  }
  .message {
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}

.message.success {
  color: #155724;
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
}

.message.error {
  color: #721c24;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
}
  </style>
  