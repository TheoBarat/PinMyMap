<template>
    <div class="zoom-control">
      <button @click="$emit('zoomIn')">+</button>
      <button @click="$emit('zoomOut')">-</button>
      <button @click="$emit('resetView')">Recentrer</button>
    </div>
  </template>
  
  <script>
  export default {
    name: "ZoomControl",
  };
  </script>
  
  <style scoped>
  </style>  