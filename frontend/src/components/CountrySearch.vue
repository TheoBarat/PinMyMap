<template>
    <div class="country-search">
      <input
        type="text"
        v-model="searchQuery"
        @input="filterCountries"
        placeholder="Rechercher un pays..."
      />
      <ul v-if="filteredCountries.length">
        <li
          v-for="(country, index) in filteredCountries"
          :key="index"
          @click="selectCountry(country.isoCode)"
        >
          {{ country.name }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        searchQuery: '',
        filteredCountries: [],
      };
    },
    props: {
      countries: Array, // Liste complète des pays
    },
    methods: {
      filterCountries() {
        this.filteredCountries = this.countries.filter(country =>
          country.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
      selectCountry(isoCode) {
        this.$emit('search', isoCode);
        this.searchQuery = ''; // Réinitialiser le champ de recherche
        this.filteredCountries = []; // Réinitialiser les résultats
      },
    },
  };
  </script>
  
  <style scoped>
  .country-search {
    position: absolute;
    margin-bottom: 10px;
    z-index: 1000;
    width: 100%;
  }
  .country-search input {
    width: 100%;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .country-search ul {
    position: absolute;
    z-index: 1;
    background: white;
    border: 1px solid #ccc;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }
  .country-search li {
    padding: 8px;
    cursor: pointer;
  }
  .country-search li:hover {
    background-color: #f0f0f0;
  }
  </style>