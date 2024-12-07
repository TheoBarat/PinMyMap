<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold text-center mb-6">Classement des Pays</h1>

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

    <div class="leaderboard bg-white shadow rounded-lg p-4">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-gray-200">
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
            class="border-b hover:bg-gray-50"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ country.name }}</td>
            <td v-if="currentTab === 'topRated'">{{ country.rating }}</td>
            <td v-if="currentTab === 'mostVisited'">{{ country.visitsCount }}</td>
            <td v-if="currentTab === 'demanded'">{{ country.visitRequests }}</td>
            <td>
              <button
                @click="viewCountryDetails(country)"
              >
                Voir Détails
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="selectedCountry" class="fixed inset-0 bg-black bg-opacity-50 flex">
      <div class="bg-white p-6 rounded">
        <h3>{{ selectedCountry.name }}</h3>
        <p>Visites: {{ selectedCountry.visitsCount }}</p>
        <p>Demandes: {{ selectedCountry.visitRequests }}</p>
        <button @click="closeModal">Fermer</button>
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
      const response = await axios.get(`http://localhost:3001/api/countries/${country.id}/details`);
      this.selectedCountry = response.data;
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
