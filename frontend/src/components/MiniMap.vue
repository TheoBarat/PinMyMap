<template>
    <div class="mini-map" ref="miniMap" />
  </template>
  
  <script>
  import L from "leaflet";
  
  export default {
    props: {
      map: Object,
    },
    mounted() {
      this.initializeMiniMap();
    },
    methods: {
      initializeMiniMap() {
        const miniMap = L.map(this.$refs.miniMap, {
          zoom: 2,
          center: [20, 0],
          maxBounds: [[-90, -180], [90, 180]],
        });
  
        L.tileLayer(
          "https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGJhcmF0IiwiYSI6ImNtMzR4bWZqdDA0bnQybHIxdDhtczR5N2IifQ.5eGBEQ6vie7GkThK6vQzHw",
          {
            attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>',
            tileSize: 512,
            zoomOffset: -1,
          }
        ).addTo(miniMap);
  
        // Synchronisation de la mini-carte avec la carte principale
        this.map.on("move", () => {
          miniMap.setView(this.map.getCenter(), miniMap.getZoom());
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .mini-map {
    height: 150px; /* Ajuste la taille selon tes besoins */
    width: 150px;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
  }
  </style>