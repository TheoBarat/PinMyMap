<template>
    <div class="view" v-if="isVisible">
      <h2>Détails du pays : {{ countryName }}</h2>
      <div>
        <p><strong>Description :</strong></p>
        <p>{{ description }}</p>
      </div>
      <div>
        <p><strong>Note :</strong> {{ score }} 🌟</p>
      </div>
      <div>
        <p><strong>État :</strong> {{ state === 'visited' ? 'Visité' : 'À visiter' }}</p>
      </div>
      <button @click="$emit('close')">Fermer</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isVisible: Boolean,
      countryName: String,
      description: String,
      score: Number,
      state: String,
    },
  };
  </script>
  
  <style scoped>
  .view {
    position: absolute;
    top: 200px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    text-align: center;
  }
  
  button {
    margin-top: 10px;
    padding: 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>  