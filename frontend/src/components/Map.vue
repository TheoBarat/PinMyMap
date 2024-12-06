<template>
  <div id="map">
    <!-- <CountrySearch :countries="countries" @search="focusOnCountry" />
    <l-geo-json
      v-for="(country, index) in countries"
      :key="index"
      :geojson="country.geojson"
      :options="getCountryStyle(country)"
      @click="openCountryDetails(country)"
    /> -->
    <CountryDetailsModal
      v-if="selectedCountry"
      :country="selectedCountry"
      @close="closeModal"
      @mark-as-visited="markAsVisited"
      @mark-as-to-visit="markAsToVisit"
    />
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CountryDetailsModal from "./CountryDetailsModal.vue";
import axios from "axios";

export default {
  data() {
    return {
      map: null,           // La carte Leaflet
      visitedLayer: L.layerGroup(),   // Overlay pour les pays visités
      toVisitLayer: L.layerGroup(),   // Overlay pour les pays à visiter
      countries: [],       // Liste des pays avec leurs états
      userId: 1,           // ID de l'utilisateur (à adapter selon l'utilisateur connecté)
    };
  },
  async mounted() {
    // Initialisation de la carte après que le composant soit monté
    this.initializeMap();

    // Récupération de l'état des pays pour cet utilisateur
    this.fetchCountryStates(this.userId);
  },
  methods: {
    async initializeMap() {
      // Initialiser la carte Leaflet
      this.map = L.map("map", {
        zoomControl: true,
        maxZoom: 5,
        minZoom: 2,
        maxBounds: [
          [-90, -180],
          [90, 180],
        ],
      }).setView([50, 10], 4);
      // Ajouter la couche de tuiles OpenStreetMap
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGJhcmF0IiwiYSI6ImNtMzR4bWZqdDA0bnQybHIxdDhtczR5N2IifQ.5eGBEQ6vie7GkThK6vQzHw",
        {
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(this.map);

      // Initialiser les couches overlay pour les pays visités et à visiter
      const overlays = {
        "Pays visités": this.visitedLayer,
        "Pays à visiter": this.toVisitLayer,
      };

      // Ajouter le contrôle pour afficher ou masquer les overlays
      L.control.layers(null, overlays).addTo(this.map);

      //this.loadCountries();
      
      // Charger les pays depuis une source GeoJSON (ici un lien direct)
      const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
      const response = await fetch(geojsonUrl);
      const geojsonData = await response.json();

      // Ajouter les pays en tant que couches GeoJSON
      this.countries = L.geoJSON(geojsonData, {
        style: this.getDefaultCountryStyle(), // Style par défaut
        onEachFeature: (feature, layer) => {
          // Gestion du clic pour basculer entre les états
          layer.on("click", () => this.toggleCountryState(layer, feature.properties.ISO_A3));
        },
      }).addTo(this.map);
      
    },

    /* Taff à faire avec la BDD
    async loadCountries() {
      const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
      const response = await fetch(geojsonUrl);
      const geojsonData = await response.json();

      // Charger les informations utilisateur
      const userCountries = await axios.get("/api/user/countries"); // Exemple API utilisateur

      // Fusionner les données GeoJSON avec les données utilisateur
      this.countries = geojsonData.features.map((feature) => {
        const userData = userCountries.data.find((c) => c.isoCode === feature.properties.ISO_A3);
        return {
          ...feature,
          status: userData ? userData.status : "unvisited", // Statut utilisateur (par ex. 'visited')
          name: feature.properties.ADMIN,
          isoCode: feature.properties.ISO_A3,
        };
      });
      this.addCountriesToMap();
    }, */

    async fetchCountryStates(userId) {
      try {
        // Requête pour récupérer l'état des pays pour un utilisateur
        const response = await fetch(`http://localhost:3000/api/countries/${userId}`);
        const data = await response.json();

        // Traitez les données reçues ici et mettez à jour les couches sur la carte
        data.forEach((country) => {
          this.updateCountryOnMap(country.country_code, country.state);
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des états des pays :", error);
      }
    },

    updateCountryOnMap(countryCode, state) {
      // Recherche du pays dans la carte via son code ISO (par exemple 'FRA' pour la France)
      const countryLayer = this.getCountryLayerByCode(countryCode);

      if (countryLayer) {
        // Mettre à jour l'état du pays selon les données reçues de l'API
        if (state === "visited") {
          this.visitedLayer.addLayer(countryLayer);
          countryLayer.setStyle(this.getVisitedCountryStyle());
        } else if (state === "to_visit") {
          this.toVisitLayer.addLayer(countryLayer);
          countryLayer.setStyle(this.getToVisitCountryStyle());
        } else {
          // Pays non visible : retirer de la carte
          this.map.removeLayer(countryLayer);
        }
      }
    },

    getCountryLayerByCode(countryCode) {
      // Fonction pour retrouver un pays via son code ISO dans la carte Leaflet
      let countryLayer = null;
      this.countries.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties.ISO_A3 === countryCode) {
          countryLayer = layer;
        }
      });
      return countryLayer;
    },

    toggleCountryState(layer, countryCode) {
      // Ouvrir une boîte de dialogue pour permettre à l'utilisateur de définir l'état du pays
      const currentState = window.prompt(
        `Choisissez l'état pour le pays ${countryCode} :\n1 - Non visible\n2 - Visité\n3 - À visiter`,
        "1"
      );

      let newState = "not_visible";
      if (currentState === "2") {
        newState = "visited";
        this.visitedLayer.addLayer(layer);
        this.toVisitLayer.removeLayer(layer);
        layer.setStyle(this.getVisitedCountryStyle());
      } else if (currentState === "3") {
        newState = "to_visit";
        this.toVisitLayer.addLayer(layer);
        this.visitedLayer.removeLayer(layer);
        layer.setStyle(this.getToVisitCountryStyle());
      } else {
        // Si l'état est "1", retirer le pays de la carte
        this.visitedLayer.removeLayer(layer);
        this.toVisitLayer.removeLayer(layer);
        this.map.removeLayer(layer);
      }

      // Mettre à jour l'état du pays dans la base de données via l'API
      this.updateCountryState(this.userId, countryCode, newState);
    },

    async updateCountryState(userId, countryCode, state) {
      try {
        // Requête POST pour mettre à jour l'état d'un pays dans la base de données
        const response = await fetch("http://localhost:3000/api/country/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            country_code: countryCode,
            state: state,
          }),
        });
        const result = await response.json();
        console.log(result.message);  // Message de succès
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'état du pays :", error);
      }
    },

    // Styles pour les pays en fonction de leur état
    getDefaultCountryStyle() {
      return {
        fillColor: "transparent",
        weight: 2,
        opacity: 1,
        color: "transparent",
        fillOpacity: 0.5,
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
<style>
  #map {
    width: 100%;
    height: 90vh;
  }
</style>