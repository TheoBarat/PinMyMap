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
    <div id="map" style="height: 90vh; width: 100vw; position: absolute; top: 10vh; right: 0;">
      <!-- Carte Leaflet -->
      <l-geo-json
        v-for="(country, index) in countries"
        :key="index"
        :geojson="country.geojson"
        :options="getCountryStyle(country)"
        @click="toggleCountrySelection(country)"
      />
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {

  data() {
    return {
      map: null, // Carte Leaflet
      visitedLayer: L.layerGroup(),   // Overlay pour les pays visités
      toVisitLayer: L.layerGroup(),   // Overlay pour les pays à visiter
      unvisitedLayer: L.layerGroup(), // Overlay pour les pays non visités
      countries: [],
      userID: 1,
    };
  },

  mounted() {
    // Initialiser la carte Leaflet
    this.initializeMap();

    addCountryToMap("France");
  },
  methods: {
    async initializeMap() {
      // Initialiser la carte Leaflet
      this.map = L.map('map').setView([43.60221958291301, 1.4557566643659308], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);

      // Initialiser les couches overlay pour les pays visités et à visiter
      const overlays = {
        "Pays visités": this.visitedLayer,
        "Pays à visiter": this.toVisitLayer,
        "Pays non visités": this.unvisitedLayer,
      };

      // Ajouter le contrôle pour afficher ou masquer les overlays
      L.control.layers(null, overlays).addTo(this.map);
      
      // Charger les pays depuis une source GeoJSON (ici un lien direct)
      const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
      const response = await fetch(geojsonUrl);
      const geojsonData = await response.json();

      // Ajouter les pays en tant que couches GeoJSON
      this.countries = L.geoJSON(geojsonData, {
        style: this.getDefaultCountryStyle(),
        onEachFeature: (feature, layer) => {
          // Gestion du clic pour basculer entre les états
          layer.on("click", () => this.toggleCountryState(layer, feature.properties.ISO_A3));
        },
      }).addTo(this.map);
    },

    addCountryToMap(country) {
      // Ajouter une couche GeoJSON pour chaque pays et gérer les trois états
      L.geoJSON(country.geojson, {
        style: this.getDefaultCountryStyle(),
        onEachFeature: (feature, layer) => {
          // Gestion du clic pour basculer entre les états
          layer.on("click", () => this.toggleCountryState(layer, country));
        },
      }).addTo(this.map);
    },

    toggleCountryState(layer, country) {
      // Ouvrir une boîte de dialogue pour permettre à l'utilisateur de définir l'état

      const container = L.DomUtil.create('div', 'state-selector');
      const select = L.DomUtil.create('select', '', container);
      const options = [
        { value: '1', text: 'Non visible' },
        { value: '2', text: 'Visité' },
        { value: '3', text: 'À visiter' },
      ];

      options.forEach(option => {
        const opt = L.DomUtil.create('option', '', select);
        opt.value = option.value;
        opt.innerHTML = option.text;
      });

      const popup = L.popup()
        .setContent(container)
        .setLatLng(layer.getBounds().getCenter())
        .openOn(this.map);

      this.map.on('click', (e) => {
        if (!layer.getBounds().contains(e.latlng)) {
          this.map.closePopup(popup);
        } else {
          popup.setLatLng(e.latlng).openOn(this.map);
        }
      });

      select.addEventListener('change', () => {
        const currentState = select.value;
        this.map.closePopup(popup);

        switch (currentState) {
          case "1":
        // Retirer le pays de toutes les couches
        this.visitedLayer.removeLayer(layer);
        this.toVisitLayer.removeLayer(layer);
        this.map.removeLayer(layer);
        break;

          case "2":
        // Pays visité : Ajouter à la couche "visitedLayer"
        this.visitedLayer.addLayer(layer);
        this.toVisitLayer.removeLayer(layer);
        layer.setStyle(this.getVisitedCountryStyle());
        break;

          case "3":
        // Pays à visiter : Ajouter à la couche "toVisitLayer"
        this.toVisitLayer.addLayer(layer);
        this.visitedLayer.removeLayer(layer);
        layer.setStyle(this.getToVisitCountryStyle());
        break;

          default:
        break;
        }
      });
    },

    getDefaultCountryStyle() {
      // Style par défaut (pays non visible)
      return {
        fillColor: "transparent",
        weight: 0,
        opacity: 1,
        color: "Black",
        fillOpacity: 0,
      };
    },

    getVisitedCountryStyle() {
      // Style pour les pays visités
      return {
        fillColor: "blue",
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7,
      };
    },

    getToVisitCountryStyle() {
      // Style pour les pays à visiter
      return {
        fillColor: "green",
        weight: 2,
        opacity: 1,
        color: "white",
        fillOpacity: 0.7,
      };
    },
  },
}
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
