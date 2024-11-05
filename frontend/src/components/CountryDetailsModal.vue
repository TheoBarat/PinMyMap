<template>
    <div v-if="country" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ country.name }}</h2>
        <p>État de visite : {{ country.status }}</p>
        <div v-if="country.photos.length">
          <h3>Photos</h3>
          <div class="photo-gallery">
            <img
              v-for="(photo, index) in country.photos"
              :key="index"
              :src="photo"
              :alt="`Photo ${index + 1} de ${country.name}`"
            />
          </div>
        </div>
        <button @click="markAsVisited(country)">Marquer comme visité</button>
        <button @click="markAsToVisit(country)">Ajouter aux souhaits</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      country: Object,
      closeModal: Function,
      markAsVisited: Function,
      markAsToVisit: Function,
    },
  };
  </script>
  
  <style scoped>
  /* Styles similaires à ceux que tu as déjà pour la modale */
  </style>