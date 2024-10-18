<template>
  <div id="app">
    <nav>
      <img alt="Logo" src="./assets/PinMyMapLogo.png" style="height: 80px; width: 80px;"/>
      <ul class=navbar>
        <li id="dotNavbar"><a href="#" style="color: white; text-decoration: none;">Home</a></li>
        <li id="dotNavbar"><a href="#" style="color: white; text-decoration: none;">About</a></li>
        <li id="dotNavbar"><a href="#" style="color: white; text-decoration: none;">Contact</a></li>
      </ul>
    </nav>
    <div id="map" style="height: 90vh; width: 100vw; position: absolute; top: 10vh; right: 0;"></div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {

  mounted() {
    // Initialiser la carte
    const map = L.map('map').setView([43.60221958291301, 1.4557566643659308], 4);

    // Ajouter une couche de tuiles (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  }
};
</script>

<style>
  nav {
    /* Styles pour la barre de navigation */
    height: 10vh; 
    width: 100vw; 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    background-color: #333; 
    color: white; 
    position: absolute; 
    top: 0; 
    left: 0; 
    right: 0; 
    margin: 0; 
    padding: 0;
  }
  .navbar {
    /* Styles pour la liste de navigation */
    display: flex; 
    list-style-type: none; 
    margin: 0;
    padding: 10;
  }
  .dotNavbar {
    /* Styles pour les éléments de la liste de navigation */
    margin: 0 20px;
  }
/* Styles globaux pour ton application */
</style>
