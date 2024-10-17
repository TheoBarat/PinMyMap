<template>
  <div>
    <h1>Liste des utilisateurs</h1>
    <ul>
      <li v-for="user in users" :key="user.id">
        {{ user.name }} - {{ user.email }}
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      users: [],
    };
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:3001/users');
      this.users = response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
    }
  },
};
</script>

<style>
/* Ajoute des styles si nécessaire */
</style>