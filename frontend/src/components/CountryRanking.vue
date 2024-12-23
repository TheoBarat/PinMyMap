<template>
  <div class="leaderboard-container">
    <div class="background"></div>
    <h1 class="leaderboard-title">Classement des Pays</h1>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="leaderboard">
      <table class="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Pays</th>
            <th v-if="currentTab !== 'demanded'">
              {{ currentTab === 'topRated' ? 'Note 🌟' : 'Visites 🌍' }}
            </th>
            <th v-if="currentTab === 'demanded'">Demandes 📨</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(country, index) in filteredCountries"
            :key="country.id"
            class="table-row"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ country.name }}</td>
            <td v-if="currentTab === 'topRated'"> {{ country.averageScore }} </td>
            <td v-if="currentTab === 'mostVisited'"> {{ country.visitsCount }} </td>
            <td v-if="currentTab === 'demanded'"> {{ country.visitRequests }} </td>
            <td>
              <button
                class="details-button"
                @click="viewCountryDetails(country)"
              >
                Voir Détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="selectedCountryDetails"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <CountryReviews
        :key="selectedCountryDetails.id"
        :country="selectedCountryDetails"
        :comments="selectedCountryDetails.comments"
        :averageRating="selectedCountryDetails.averageRating"
        @close="closeModal"
      />
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CountryReviews from "./CountryReviews.vue";

export default {
  components: {
    CountryReviews,
  },
  data() {
    return {
      tabs: [
        { key: "mostVisited", label: "🌍 Les plus visités" },
        { key: "topRated", label: "🌟 Les mieux notés" },
        { key: "demanded", label: "📩 Les plus demandés" },
      ],
      currentTab: "mostVisited",
      mostVisitedCountries: [],
      topRatedCountries: [],
      demandedCountries: [],
      selectedCountryDetails: null,
    };
  },
  computed: {
    filteredCountries() {
      if (this.currentTab === "mostVisited") return this.mostVisitedCountries;
      if (this.currentTab === "topRated") return this.topRatedCountries;
      if (this.currentTab === "demanded") return this.demandedCountries;
      return [];
    },
  },
  methods: {
    async fetchData() {
      const [mostVisited, topRated, demanded] = await Promise.all([
        axios.get("http://localhost:3001/api/most-visited"),
        axios.get("http://localhost:3001/api/top-rated"),
        axios.get("http://localhost:3001/api/demanded"),
      ]);
      this.mostVisitedCountries = mostVisited.data;
      this.topRatedCountries = topRated.data;
      this.demandedCountries = demanded.data;
    },
    async viewCountryDetails(country) {
      try {
        const response = await axios.get(`http://localhost:3001/api/pays/${country.id}/details`);
        this.selectedCountryDetails = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des détails :", error);
      }
    },
    closeModal() {
      this.selectedCountryDetails = null;
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
/* Conteneur principal */
.leaderboard-container {
  padding: 20px;
  background-color: #f9f9f9;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

/* Titre */
.leaderboard-title {
  position: relative;
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* Onglets */
.tabs {
  position: relative;
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
.tab {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #fff;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}
.tab:hover {
  background-color: #f1f1f1;
}
.tab.active {
  background-color: #4caf50;
  color: #fff;
  font-weight: bold;
}

/* Tableau */
.leaderboard {
  position: relative;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}
.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.leaderboard-table th,
.leaderboard-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}
.leaderboard-table th {
  background-color: #f3f3f3;
  font-weight: bold;
}
.leaderboard-table tr:hover {
  background-color: #f9f9f9;
}

/* Bouton des détails */
.details-button {
  color: #007bff;
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  font-size: 14px;
  transition: color 0.3s ease;
}
.details-button:hover {
  color: #0056b3;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
/* Conteneur principal avec image de fond */
.leaderboard-container {
  padding: 20px;
  background-size: cover; /* Assure que l'image couvre tout l'espace */
  background-position: center; /* Centre l'image */
  background-attachment: fixed; /* L'image reste fixe lors du défilement */
  min-height: 90vh;
  font-family: Arial, sans-serif;
  color: #fff; /* Texte en blanc pour une bonne lisibilité */
}

/* Image de fond avec flou */
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 90vh;
  background: url("../assets/carte.png") no-repeat center center fixed;
  background-size: cover;
  filter: blur(8px); /* Ajustez la valeur pour plus ou moins de flou */
  z-index: 0;
}

/* Ajout d'un fond semi-transparent pour améliorer la lisibilité */
.leaderboard {
  position: relative;
  background-color: rgba(255, 255, 255, 0.98); /* Fond blanc avec transparence */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  color: #333; /* Texte noir dans la zone du tableau */
}
</style>