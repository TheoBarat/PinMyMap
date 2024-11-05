<template>
  <div id="app">
    <Header />
    <Map />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Map from "./components/Map.vue";

export default {
  name: "App",
  components: {
    Header,
    Map,
  },
};
</script>

<style>
/* Styles globaux pour ton application */
</style>