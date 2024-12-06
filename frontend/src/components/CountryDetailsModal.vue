<template>
  <div class="modal">
    <div class="modal-content">
      <h2>{{ country.name }}</h2>
      <button @click="markAsVisited">Marquer comme Visité</button>
      <button @click="markAsToVisit">Marquer comme À Visiter</button>
      <button @click="unmark">Décocher</button>
      <button @click="$emit('close')">Fermer</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CountryDetailsModal",
  props: {
    country: Object,
  },
  emits: ["close", "update-country-status"],
  methods: {
    markAsVisited() {
      this.$emit("update-country-status", { country: this.country, status: "visited" });
    },
    markAsToVisit() {
      this.$emit("update-country-status", { country: this.country, status: "toVisit" });
    },
    unmark() {
      this.$emit("update-country-status", { country: this.country, status: "unvisited" });
    },
  },
};
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
}
</style>