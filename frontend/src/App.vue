<template>
  <div id="app">
    <UserList />  <!-- Utilise ton composant ici -->
  </div>
</template>

<script>
import UserList from './components/UserList.vue';  // Importer le composant

export default {
  name: 'App',
  components: {
    UserList,  // Enregistrer le composant
  },
};
</script>

<style>
/* Styles globaux pour ton application */
</style>
