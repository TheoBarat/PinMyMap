<template>
  <div>
    <div v-if="loading" class="loading-overlay">
      <div class="spinner">Chargement...</div>
    </div>
    <div id="map"></div>
    <div class="controls">
      <ToggleButton :isEditMode="isEditMode" @toggle="toggleEditMode" />
    </div>
    <CountryView
      v-if="!isEditMode && showCountryView"
      :isVisible="showCountryView"
      :countryName="selectedCountryName"
      :description="selectedCountryDescription"
      :state="selectedCountryState"
      @close="closeView"
    />
    <CountryEditor
      v-if="isEditMode && showEditor"
      :isVisible="showEditor"
      :countryName="selectedCountryName"
      :initialDescription="selectedCountryDescription"
      :initialState="selectedCountryState"
      @save="handleCountrySave"
      @close="closeEditor"
    />
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CountryView from "./CountryView.vue";
import CountryEditor from "./CountryEditor.vue";
import ToggleButton from "./ToggleButton.vue";
import axios from "axios";

export default {
  components: {
    CountryView,
    CountryEditor,
    ToggleButton,
  },
  data() {
    return {
      map: null,
      visitedLayer: L.layerGroup(),
      toVisitLayer: L.layerGroup(),
      geoJsonLayer: null,
      isEditMode: false,
      countries: [],
      userId: null,
      showEditor: false,
      showCountryView: false,
      selectedCountryName: "",
      selectedCountryDescription: "",
      selectedCountryState: "",
      selectedCountryCode: "",
      loading: true,
    };
  },
  async mounted() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        this.userId = payload.id;

        // Charger l'état sauvegardé depuis le localStorage
        const savedMode = localStorage.getItem("mapMode");
        this.isEditMode = savedMode === "edit";

        await this.initializeMap();
        await this.loadGeoJson();
        await this.fetchCountryStates(this.userId);
      } catch (error) {
        console.error("Erreur :", error);
        this.$router.push("/login");
      } finally {
        this.loading = false;
      }
    } else {
      this.$router.push("/login");
    }
  },
  methods: {
    async initializeMap() {
      this.map = L.map("map", {
        zoomControl: true,
        maxZoom: 5,
        minZoom: 2,
        maxBounds: [
          [-90, -180],
          [90, 180],
        ],
      }).setView([50, 10], 4);

      L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGJhcmF0IiwiYSI6ImNtMzR4bWZqdDA0bnQybHIxdDhtczR5N2IifQ.5eGBEQ6vie7GkThK6vQzHw",
        {
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(this.map);

      const overlays = {
        "Pays visités": this.visitedLayer,
        "Pays à visiter": this.toVisitLayer,
      };
      L.control.layers(null, overlays).addTo(this.map);

      this.visitedLayer.addTo(this.map);
      this.toVisitLayer.addTo(this.map);

      // Différencier les interactions selon le mode
      this.map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        console.log(`Clicked on: Latitude ${lat}, Longitude ${lng}`);
      });
    },
    async loadGeoJson() {
      const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
      const response = await fetch(geojsonUrl);
      const geojsonData = await response.json();

      this.geoJsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => this.getCountryStyle(feature.properties.ISO_A3),
        onEachFeature: (feature, layer) => {
          layer.on("click", () => {
            const country = this.countries.find((c) => c.code === feature.properties.ISO_A3);
            if (country) {
              if (this.isEditMode) {
                this.openEditor(country);
              } else if (country.state === "visited" || country.state === "to_visit") {
                this.openView(country);
              }
            }
          });
        },
      }).addTo(this.map);

      // Initialiser les pays comme "non sélectionné" par défaut
      this.countries = geojsonData.features.map((feature) => ({
        code: feature.properties.ISO_A3,
        name: feature.properties.ADMIN,
        state: "not_selected", // Défini par défaut comme "non sélectionné"
        description: "",
        color: "transparent",
      }));
    },
    async fetchCountryStates(userId) {
      try {
        console.log(userId);
        const response = await axios.get(`http://localhost:3001/api/countries/${userId}`);
        const data = response.data;

        data.forEach((country) => {
          const existingCountry = this.countries.find((c) => c.code === country.countryCode);
          if (existingCountry) {
            existingCountry.state = country.state;
            existingCountry.description = country.description;
            existingCountry.color = country.color;
          }
          this.updateCountryStyle(country.countryCode, country.state, country.color);
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des états des pays :", error);
      }
    },
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      this.showCountryView = false; // Fermer la vue si on passe en édition
      this.showEditor = false; // Fermer l'éditeur si on repasse en vue

      // Sauvegarder l'état dans le localStorage
      localStorage.setItem("mapMode", this.isEditMode ? "edit" : "view");
    },
    openEditor(country) {
      this.selectedCountryName = country.name;
      this.selectedCountryCode = country.code;
      this.selectedCountryDescription = country.description;
      this.selectedCountryState = country.state;
      this.showEditor = true;
    },
    closeEditor() {
      this.showEditor = false;
    },
    openView(country) {
      this.selectedCountryName = country.name;
      this.selectedCountryDescription = country.description;
      this.selectedCountryState = country.state;
      this.showCountryView = true;
    },
    closeView() {
      this.showCountryView = false;
    },
    handleCountrySave({ description, state }) {
      const country = this.countries.find((c) => c.code === this.selectedCountryCode);
      
      if (country) {
        country.state = state;
        country.description = description;
        country.color = state === "visited" ? "blue" : state === "to_visit" ? "green" : "transparent";
      }

      // Envoyer les modifications au backend
      this.updateCountryData(this.selectedCountryCode, {
        description,
        state,
        color: country.color,
      }).then(() => {
        // Sauvegarder le mode actuel dans le localStorage avant le rechargement
        localStorage.setItem("mapMode", this.isEditMode ? "edit" : "view");
        // Rafraîchir la page après la mise à jour
        window.location.reload();
      });

      // Recharger les états depuis le backend pour garantir un rafraîchissement complet
      this.fetchCountryStates(this.userId);

      this.closeEditor(); // Fermer l'éditeur
    },
    async updateCountryData(countryCode, data) {
      try {
        const response = await axios.post("http://localhost:3001/api/countries/update", {
          userId: this.userId,
          countryCode,
          countryName: this.selectedCountryName,
          ...data,
        });
        console.log("Réponse de l'API après mise à jour :", response.data);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données du pays :", error);
      }
    },
    updateCountryStyle(countryCode, state, color) {
      this.geoJsonLayer.eachLayer((layer) => {
        if (layer.feature.properties.ISO_A3 === countryCode) {
          layer.setStyle({
            fillColor: color || this.getStyleForState(state).fillColor,
            weight: 1,
            color: "#555",
            fillOpacity: state === "not_selected" ? 0.2 : 0.7, // Opacité différente pour "non sélectionné"
          });

          // Retirer le layer des overlays s'il est "non sélectionné"
          if (state === "visited") {
            this.visitedLayer.addLayer(layer);
            this.toVisitLayer.removeLayer(layer);
          } else if (state === "to_visit") {
            this.toVisitLayer.addLayer(layer);
            this.visitedLayer.removeLayer(layer);
          }
        }
      });
    },
    getCountryStyle(countryCode) {
      const country = this.countries.find((c) => c.code === countryCode);
      return this.getStyleForState(country ? country.state : "not_visible");
    },
    getStyleForState(state) {
      if (state === "visited") {
        return {
          fillColor: "blue",
          weight: 1,
          color: "#555",
          fillOpacity: 0.7,
        };
      } else if (state === "to_visit") {
        return {
          fillColor: "green",
          weight: 1,
          color: "#555",
          fillOpacity: 0.7,
        };
      } else if (state === "not_selected") { // Pays non sélectionné
        return {
          fillColor: "transparent",
          weight: 1,
          color: "#555",
          fillOpacity: 0.2,
        };
      }
      return {
        fillColor: "transparent",
        weight: 1,
        color: "transparent",
        fillOpacity: 0.2,
      };
    }
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 90vh;
}

.controls {
  margin: 10px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  font-size: 1.5em;
  color: #333;
}
</style>