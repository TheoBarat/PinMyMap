<template>
    <div id="map" style="height: 90vh; width: 100vw; position: absolute; top: 10vh; right: 0;">
      <l-geo-json
        v-for="(country, index) in countries"
        :key="index"
        :geojson="country.geojson"
        :options="getCountryStyle(country)"
        @click="toggleCountrySelection(country)"
      />
    </div>
  </template>
  
  <script>
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import axios from "axios";
  
  export default {
    name: "Map",
    data() {
      return {
        map: null,
        visitedLayer: L.layerGroup(),
        toVisitLayer: L.layerGroup(),
        unvisitedLayer: L.layerGroup(),
        countries: [],
        users: [],
      };
    },
    async mounted() {
      this.initializeMap();
      try {
        const response = await axios.get("http://localhost:3001/users");
        this.users = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs", error);
      }
    },
    methods: {
      initializeMap() {
        this.map = L.map("map").setView([43.60221958291301, 1.4557566643659308], 5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(this.map);
        this.loadCountries();
      },
      async loadCountries() {
        const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
        const response = await fetch(geojsonUrl);
        const geojsonData = await response.json();
  
        this.countries = L.geoJSON(geojsonData, {
          style: this.getDefaultCountryStyle(),
          onEachFeature: (feature, layer) => {
            layer.on("click", () => this.toggleCountryState(layer, feature.properties.ISO_A3));
          },
        }).addTo(this.map);
      },
      toggleCountryState(layer, country) {
        // Logic to toggle the country state
      },
      getDefaultCountryStyle() {
        return {
          fillColor: "transparent",
          weight: 0,
          opacity: 1,
          color: "Black",
          fillOpacity: 0,
        };
      },
      getVisitedCountryStyle() {
        return {
          fillColor: "blue",
          weight: 2,
          opacity: 1,
          color: "white",
          fillOpacity: 0.7,
        };
      },
      getToVisitCountryStyle() {
        return {
          fillColor: "green",
          weight: 2,
          opacity: 1,
          color: "white",
          fillOpacity: 0.7,
        };
      },
    },
  };
  </script>
  
  <style scoped>
  /* Styles spécifiques à la carte, si nécessaire */
  </style>  