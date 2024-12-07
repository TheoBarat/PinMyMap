<template>
  <div>
    <div v-if="loading" class="loading-overlay">
      <div class="spinner">Chargement...</div>
    </div>
    <div id="map"></div>
    <div class="controls">
      <ToggleButton :isEditMode="isEditMode" @toggle="toggleEditMode" />
    </div>
    <CountryEditor
      v-if="showEditor"
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
import CountryEditor from "./CountryEditor.vue";
import ToggleButton from "./ToggleButton.vue";
import axios from "axios";

export default {
  components: {
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
      userId: 1,
      showEditor: false,
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
        this.userId = payload.userId;
        await this.initializeMap();
        await this.loadGeoJson();
        await this.fetchCountryStates(this.userId);
      } catch (error) {
        console.error("Erreur :", error);
        this.$router.push("/login");
      } finally {
        this.loading = false; // Fin du chargement
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
      console.log("Initialisation de la carte Leaflet.");
    },
    async loadGeoJson() {
      const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
      const response = await fetch(geojsonUrl);
      const geojsonData = await response.json();

      this.geoJsonLayer = L.geoJSON(geojsonData, {
        style: (feature) => this.getCountryStyle(feature.properties.ISO_A3),
        onEachFeature: (feature, layer) => {
          layer.on("click", () => {
            if (this.isEditMode) {
              this.openEditor(feature.properties);
            }
          });
        },
      }).addTo(this.map);

      this.countries = geojsonData.features.map((feature) => ({
        code: feature.properties.ISO_A3,
        name: feature.properties.ADMIN,
        state: "not_visible",
        description: "",
        color: "",
      }));
    },
    async fetchCountryStates(userId) {
      try {
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
    },
    openEditor(properties) {
      const country = this.countries.find((c) => c.code === properties.ISO_A3);

      this.selectedCountryName = properties.ADMIN;
      this.selectedCountryCode = properties.ISO_A3;
      this.selectedCountryDescription = country?.description || "";
      this.selectedCountryState = country?.state || "not_visible";

      this.showEditor = true;
    },
    closeEditor() {
      this.showEditor = false;
    },
    handleCountrySave({ description, state }) {
      const country = this.countries.find((c) => c.code === this.selectedCountryCode);
      if (country) {
        country.state = state;
        country.description = description;
        country.color = state === "visited" ? "blue" : "green";
      }

      this.updateCountryStyle(this.selectedCountryCode, state, country.color);

      this.updateCountryData(this.selectedCountryCode, {
        description,
        state,
        color: country.color,
      });

      this.closeEditor();
    },
    async updateCountryData(countryCode, data) {
      try {
        console.log("Données envoyées :", {
          userId: this.userId,
          countryCode,
          ...data,
        });
        const response = await axios.post("http://localhost:3001/api/countries/update", {
          userId: this.userId,
          countryCode,
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
            fillOpacity: 0.7,
          });

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
      }
      return {
        fillColor: "transparent",
        weight: 1,
        color: "transparent",
        fillOpacity: 0.2,
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