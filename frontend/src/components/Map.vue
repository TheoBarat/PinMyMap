<template>
  <div id="map">
    <CountrySearch :countries="countries" @search="focusOnCountry" />
    <l-geo-json
      v-for="(country, index) in countries"
      :key="index"
      :geojson="country.geojson"
      :options="getCountryStyle(country)"
      @click="openCountryDetails(country)"
    />
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
import axios from "axios";
import CountryDetailsModal from "./CountryDetailsModal.vue";
import CountrySearch from "./CountrySearch.vue";
import MiniMap from "./MiniMap.vue";

export default {
  name: "Map",
  components: {
    CountryDetailsModal,
    MiniMap,
    CountrySearch,
  },
  data() {
    return {
      map: null,
      countries: [],
      selectedCountry: null,
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
      this.map = L.map("map", {
        zoomControl: false,
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

      this.loadCountries();
    },
    async loadCountries() {
      const geojsonUrl = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
      const response = await fetch(geojsonUrl);
      const geojsonData = await response.json();

      this.countries = geojsonData.features.map((feature) => ({
        ...feature,
        status: "unvisited",
        photos: [],
        name: feature.properties.ADMIN,
        isoCode: feature.properties.ISO_A3,
      }));

      L.geoJSON(geojsonData, {
        style: this.getDefaultCountryStyle(),
        onEachFeature: (feature, layer) => {
          layer.on("click", () => this.openCountryDetails(feature.properties.ISO_A3));
        },
      }).addTo(this.map);
    },
    getDefaultCountryStyle() {
      return {
        fillColor: "transparent",
        weight: 0.5,
        color: "gray",
        opacity: 0.6,
        fillOpacity: 0,
      };
    },
    getCountryStyle(country) {
      if (country.status === "visited") return this.getVisitedCountryStyle();
      if (country.status === "toVisit") return this.getToVisitCountryStyle();
      return this.getDefaultCountryStyle();
    },
    getVisitedCountryStyle() {
      return {
        fillColor: "blue",
        weight: 2,
        color: "white",
        fillOpacity: 0.7,
      };
    },
    getToVisitCountryStyle() {
      return {
        fillColor: "green",
        weight: 2,
        color: "white",
        fillOpacity: 0.7,
      };
    },
    openCountryDetails(isoCode) {
      this.selectedCountry = this.countries.find(
        (country) => country.isoCode === isoCode
      );
    },
    closeModal() {
      this.selectedCountry = null;
    },
    markAsVisited(country) {
      country.status = "visited";
      this.selectedCountry = null;
      this.updateCountryStyle(country);
    },
    markAsToVisit(country) {
      country.status = "toVisit";
      this.selectedCountry = null;
      this.updateCountryStyle(country);
    },
    updateCountryStyle(country) {
      const layer = this.map._layers.find(
        (layer) => layer.feature.properties.ISO_A3 === country.isoCode
      );
      if (layer) layer.setStyle(this.getCountryStyle(country));
    },
    focusOnCountry(isoCode) {
      const country = this.countries.find((c) => c.isoCode === isoCode);
      if (country) {
        // Récupérer la coordonnée du pays et recentrer la carte
        const countryLayer = this.map._layers.find(
          (layer) => layer.feature.properties.ISO_A3 === isoCode
        );
        if (countryLayer) {
          const bounds = countryLayer.getBounds();
          this.map.fitBounds(bounds);
        }
      }
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