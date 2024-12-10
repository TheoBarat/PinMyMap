<template>
  <div class="editor" v-if="isVisible">
    <h2>Modifier le pays : {{ countryName }}</h2>
    <div>
      <label for="description">Description :</label><br />
      <textarea
        id="description"
        v-model="description"
        placeholder="Ajoutez une description..."
        rows="3"
        style="width: 100%; margin-bottom: 10px;"
      ></textarea>
    </div>
    <RatingScore
      v-model="score"
      :score="score"
      @update:score="updateScore"
    />
    <div>
      <label>État du pays :</label><br />
      <input
        type="radio"
        id="visited"
        value="visited"
        v-model="state"
      />
      <label for="visited">Visité</label><br />
      <input
        type="radio"
        id="toVisit"
        value="to_visit"
        v-model="state"
      />
      <label for="toVisit">À visiter</label><br />
      <input
        type="radio"
        id="notSelected"
        value="not_selected"
        v-model="state"
      />
      <label for="notSelected">Non sélectionné</label><br />
    </div>
    <button @click="saveChanges" style="margin-right: 10px;">Enregistrer</button>
    <button @click="$emit('close')">Annuler</button>
  </div>
</template>

<script>
import RatingScore from "./RatingScore.vue";

export default {
  components: {
    RatingScore,
  },
  props: {
    isVisible: Boolean,
    countryName: String,
    initialDescription: String,
    initialState: String,
    initialScore: Number,
  },
  data() {
    return {
      description: this.initialDescription || "",
      state: this.initialState || "not_selected",
      score: this.initialScore,
    };
  },
  methods: {
    mounted() {
      this.currentScore = this.score;
    },
    saveChanges() {
      this.$emit("save", {
        description: this.description,
        state: this.state,
        score: this.score,
      });
    },
    updateScore(score) {
      this.score = score;
      console.log("Newww score:", score);
    },
  },
};
</script>

<style scoped>
.editor {
  position: absolute;
  top: 200px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}
</style>