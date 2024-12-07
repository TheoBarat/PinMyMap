<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Classement des Pays</h1>

    <!-- Tabs pour les classements -->
    <div class="tabs mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Contenu des classements -->
    <div class="leaderboard bg-white shadow rounded-lg p-4">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-3 text-sm">#</th>
            <th class="p-3 text-sm">Pays</th>
            <th class="p-3 text-sm" v-if="currentTab !== 'demanded'">
              {{ currentTab === 'topRated' ? 'Note 🌟' : 'Visites 🌍' }}
            </th>
            <th class="p-3 text-sm" v-else>Demandes de Visite 📨</th>
            <th class="p-3 text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(country, index) in filteredCountries"
            :key="country.id"
            class="border-b hover:bg-gray-50 transition"
          >
            <td class="p-3 font-bold text-gray-700">{{ index + 1 }}</td>
            <td class="p-3">{{ country.name }}</td>
            <td class="p-3 font-semibold text-yellow-500" v-if="currentTab === 'topRated'">
              🌟 {{ country.rating }}
            </td>
            <td class="p-3 font-semibold text-blue-500" v-if="currentTab === 'mostVisited'">
              🌍 {{ country.visitsCount }} visites
            </td>
            <td class="p-3 font-semibold text-green-500" v-if="currentTab === 'demanded'">
              📩 {{ country.visitRequests }} demandes
            </td>
            <td class="p-3">
              <button
                class="text-sm text-white bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
                @click="viewCountryDetails(country)"
              >
                Voir Détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal pour les détails d'un pays -->
    <div
      v-if="selectedCountry"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
    >
      <div class="bg-white rounded p-6 w-11/12 max-w-2xl shadow-lg">
        <h3 class="text-xl font-bold mb-4">{{ selectedCountry.name }}</h3>
        <p class="mb-4">🌟 Note: {{ selectedCountry.rating }}</p>
        <p class="mb-4">🌍 Nombre de visites: {{ selectedCountry.visitsCount }}</p>
        <p class="mb-4">📩 Demandes de visite: {{ selectedCountry.visitRequests }}</p>

        <button
          class="mt-6 bg-red-500 text-white px-4 py-2 rounded"
          @click="closeModal"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
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
      selectedCountry: null,
    };
  },
  computed: {
    filteredCountries() {
      if (this.currentTab === "mostVisited") {
        return this.mostVisitedCountries;
      } else if (this.currentTab === "topRated") {
        return this.topRatedCountries;
      } else if (this.currentTab === "demanded") {
        return this.demandedCountries;
      }
      return [];
    },
  },
  methods: {
    async fetchData() {
      try {
        const [topRated, mostVisited, demanded] = await Promise.all([
          axios.get("/api/countries/top-rated"),
          axios.get("/api/countries/most-visited"),
          axios.get("/api/countries/demanded"),
        ]);
        this.topRatedCountries = topRated.data;
        this.mostVisitedCountries = mostVisited.data;
        this.demandedCountries = demanded.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    },
    async viewCountryDetails(country) {
      try {
        const response = await axios.get(`/api/countries/${country.id}/details`);
        this.selectedCountry = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du pays:", error);
      }
    },
    closeModal() {
      this.selectedCountry = null;
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
/* Style des onglets */
.tabs {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.tab {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  cursor: pointer;
  background-color: #f9f9f9;
  transition: background-color 0.3s, color 0.3s;
}
.tab:hover {
  background-color: #f0f0f0;
}
.tab.active {
  background-color: #4f46e5;
  color: white;
  font-weight: bold;
}

/* Table styles */
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 0.75rem;
}
thead th {
  background-color: #f3f4f6;
  font-weight: 600;
}
tbody tr:hover {
  background-color: #f9fafb;
}
</style>
