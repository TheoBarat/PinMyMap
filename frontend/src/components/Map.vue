<template>
  <div>
    <div class="controls">
      <button @click="toggleEditMode">
        {{ isEditMode ? "Passer en mode Vue" : "Passer en mode Édition" }}
      </button>
    </div>
    <div id="map"></div>
    <CountryEditor
      v-if="showEditor"
      :isVisible="showEditor"
      :countryName="selectedCountryName"
      :initialDescription="selectedCountryDescription"
      :initialPhotos="selectedCountryPhotos"
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
import axios from "axios";

export default {
  components: {
    CountryEditor,
  },
  data() {
    return {
      map: null,
      visitedLayer: L.layerGroup(),
      toVisitLayer: L.layerGroup(),
      geoJsonLayer: null,
      isEditMode: false, // Mode vue ou édition
      countries: [], // Liste des pays et leurs informations
      userId: 1, // ID de l'utilisateur
      showEditor: false, // Contrôle l'affichage de l'éditeur
      selectedCountryName: "",
      selectedCountryDescription: "",
      selectedCountryPhotos: [],
      selectedCountryState: "",
      selectedCountryCode: "",
    };
  },
  async mounted() {
    await this.initializeMap();
    await this.loadGeoJson();
    await this.fetchCountryStates(this.userId);
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

      // Ajouter les overlays
      const overlays = {
        "Pays visités": this.visitedLayer,
        "Pays à visiter": this.toVisitLayer,
      };
      L.control.layers(null, overlays).addTo(this.map);

      // Ajouter les overlays à la carte
      this.visitedLayer.addTo(this.map);
      this.toVisitLayer.addTo(this.map);
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
              this.openEditor(feature.properties); // Appeler l'éditeur en mode édition
            }
          });
        },
      }).addTo(this.map);

      // Ajouter les pays dans la liste locale
      this.countries = geojsonData.features.map((feature) => ({
        code: feature.properties.ISO_A3,
        name: feature.properties.ADMIN,
        state: "not_visible", // Par défaut
        description: "", // Simulez des descriptions
        photos: [], // Simulez des photos
      }));
    },
    async fetchCountryStates(userId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/countries/${userId}`);
        const data = response.data;

        data.forEach((country) => {
          this.updateCountryStyle(country.country_code, country.state);
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des états des pays :", error);
      }
    },
    toggleEditMode() {
      this.isEditMode = !this.isEditMode;
      console.log(this.isEditMode ? "Mode édition activé" : "Mode vue activé");
    },
    openEditor(properties) {
      const country = this.countries.find((c) => c.code === properties.ISO_A3);

      this.selectedCountryName = properties.ADMIN;
      this.selectedCountryCode = properties.ISO_A3;
      this.selectedCountryDescription = country?.description || "";
      this.selectedCountryPhotos = country?.photos || [];
      this.selectedCountryState = country?.state || "not_visible";

      this.showEditor = true;
    },
    closeEditor() {
      this.showEditor = false;
    },
    handleCountrySave({ description, photos, state }) {
      const country = this.countries.find((c) => c.code === this.selectedCountryCode);
      if (country) {
        country.state = state;
        country.description = description;
        country.photos = photos;
      }

      // Mettre à jour le style sur la carte
      this.updateCountryStyle(this.selectedCountryCode, state);

      // Envoyer les modifications à l'API
      this.updateCountryData(this.selectedCountryCode, { description, photos, state });

      this.closeEditor();
    },
    async updateCountryData(countryCode, data) {
      try {
        await axios.post("http://localhost:3000/api/country/update", {
          user_id: this.userId,
          country_code: countryCode,
          ...data,
        });
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données du pays :", error);
      }
    },
    updateCountryStyle(countryCode, state) {
      this.geoJsonLayer.eachLayer((layer) => {
        if (layer.feature.properties.ISO_A3 === countryCode) {
          layer.setStyle(this.getStyleForState(state));

          // Mettre à jour les overlays
          if (state === "visited") {
            this.visitedLayer.addLayer(layer);
            this.toVisitLayer.removeLayer(layer);
          } else if (state === "to_visit") {
            this.toVisitLayer.addLayer(layer);
            this.visitedLayer.removeLayer(layer);
          } else {
            this.visitedLayer.removeLayer(layer);
            this.toVisitLayer.removeLayer(layer);
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
</style>
