<template>
  <div id="app">
    <Header />
    <router-view />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import eventBus from "./eventBus";

export default {
  components: { Header },
  mounted() {
    const token = localStorage.getItem("token");
    console.log("App.vue : token détecté =", token);
    eventBus.$emit("auth-changed", !!token);
  },
};
</script>