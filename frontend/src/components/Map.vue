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
      :score="selectedCountryScore"
      :photos="selectedCountryPhotos"
      @close="closeView"
    />
    <CountryEditor
      v-if="isEditMode && showEditor"
      :isVisible="showEditor"
      :countryName="selectedCountryName"
      :initialDescription="selectedCountryDescription"
      :initialState="selectedCountryState"
      :initialScore="selectedCountryScore"
      :initialPhotos="selectedCountryPhotos"
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
      notSelectedLayer:L.layerGroup(),
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
      selectedCountryScore: 0,
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
      // Initialiser la carte
      this.map = L.map("map", {
        zoomControl: true,
        maxZoom: 5,
        minZoom: 2,
        maxBounds: [
          [-90, -180],
          [90, 180],
        ],
      });

      // Vérifier si une position est sauvegardée dans le localStorage
      const savedView = localStorage.getItem("mapView");
      if (savedView) {
        // Récupérer la position sauvegardée
        const { lat, lng, zoom } = JSON.parse(savedView);
        this.map.setView([lat, lng], zoom);
      } else {
        // Afficher le monde entier par défaut
        this.map.fitWorld();
      }

      // Sauvegarder la position et le zoom actuels lors du déplacement ou zoom
      this.map.on("moveend", () => {
        const center = this.map.getCenter();
        const zoom = this.map.getZoom();
        localStorage.setItem("mapView", JSON.stringify({ lat: center.lat, lng: center.lng, zoom }));
      });

      // Ajouter les tuiles Mapbox
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGJhcmF0IiwiYSI6ImNtMzR4bWZqdDA0bnQybHIxdDhtczR5N2IifQ.5eGBEQ6vie7GkThK6vQzHw",
        {
          attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
          tileSize: 512,
          zoomOffset: -1,
        }
      ).addTo(this.map);

      // Ajouter les couches pour les pays visités et à visiter
      const overlays = {
        "Pays visités": this.visitedLayer,
        "Pays à visiter": this.toVisitLayer,
      };
      L.control.layers(null, overlays).addTo(this.map);

      this.notSelectedLayer.addTo(this.map);
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
        score: 0,
      }));

      // Ajouter toutes les couches initiales à notSelectedLayer
      this.geoJsonLayer.eachLayer((layer) => {
        this.notSelectedLayer.addLayer(layer);
      });
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
            existingCountry.score = country.score;
            
            // Correction des URLs des photos
            existingCountry.photos = country.photos.map(photo => ({
              ...photo,
              url: `http://localhost:3001${photo.url}` 
            }));
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
      this.selectedCountryScore = country.score;
      this.selectedCountryPhotos = country.photos || [];
      this.showEditor = true;
    },
    closeEditor() {
      this.showEditor = false;
    },
    openView(country) {
      this.selectedCountryName = country.name;
      this.selectedCountryDescription = country.description;
      this.selectedCountryState = country.state;
      this.selectedCountryScore = country.score;
      this.selectedCountryPhotos = country.photos || []; // Assurez-vous que photos est un tableau
      this.showCountryView = true;
    },
    closeView() {
      this.showCountryView = false;
    },
    handleCountrySave({ description, state, score, photos }) {
      const country = this.countries.find((c) => c.code === this.selectedCountryCode);

      if (country) {
        country.state = state;
        country.description = description;
        country.color = state === "visited" ? "blue" : state === "to_visit" ? "green" : "transparent";
        country.score = score;
      }

      // Préparer les données pour l'API
      const formData = new FormData();
      formData.append("userId", this.userId);
      formData.append("countryCode", this.selectedCountryCode);
      formData.append("countryName", this.selectedCountryName);
      formData.append("description", description);
      formData.append("state", state);
      formData.append("color", country.color);
      formData.append("score", parseFloat(score)); 

      // Ajouter les photos au FormData
      if (photos && photos.length > 0) {
        photos.forEach((photo) => {
          if (photo.file) {
            formData.append("photos", photo.file);
          }
        });
      }

      // Envoyer les données via updateCountryData
      this.updateCountryData(formData).then(() => {
         // Rafraîchir les couches après la mise à jour
        this.updateCountryStyle(this.selectedCountryCode, state, country.color);
        this.closeEditor(); 
      });
    },
    async updateCountryData(formData) {
      try {
        const response = await axios.post("http://localhost:3001/api/countries/update", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Réponse de l'API après mise à jour :", response.data);
      } catch (error) {
        console.error("Erreur lors de la mise à jour des données du pays :", error);
      }
    },
    updateCountryStyle(countryCode, state, color) {
      // Trouver la couche correspondante
      const layer = this.geoJsonLayer.getLayers().find(
        (layer) => layer.feature.properties.ISO_A3 === countryCode
      );

      if (layer) {
        // Appliquer le nouveau style directement sur la couche
        const newStyle = {
          fillColor: color || this.getStyleForState(state).fillColor,
          weight: state === "not_selected" ? 0 : 1, 
          color: state === "not_selected" ? "transparent" : "#555",
          fillOpacity: state === "not_selected" ? 0 : 0.7, 
        };

        layer.setStyle(newStyle);

        // Supprimer la couche des anciens états
        this.visitedLayer.removeLayer(layer);
        this.toVisitLayer.removeLayer(layer);
        this.notSelectedLayer.removeLayer(layer);

        // Ajouter la couche dans le bon layer
        if (state === "visited") {
          this.visitedLayer.addLayer(layer);
        } else if (state === "to_visit") {
          this.toVisitLayer.addLayer(layer);
        } else {
          this.notSelectedLayer.addLayer(layer);
        }
      } else {
        console.warn(`Layer for country code ${countryCode} not found.`);
      }

      // Mettre à jour l'état dans l'objet countries
      const country = this.countries.find((c) => c.code === countryCode);
      if (country) {
        country.state = state;
        country.color = color || this.getStyleForState(state).fillColor;
      }
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
      } else if (state === "not_selected") { 
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