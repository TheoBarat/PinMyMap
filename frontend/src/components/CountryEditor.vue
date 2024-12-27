<template>
  <div class="editor" v-if="isVisible">
    <h2>Modifier le pays : {{ countryName }}</h2>

    <!-- Description -->
    <div class="description-text">
      <label for="description">Description :</label><br />
      <textarea
        id="description"
        v-model="description"
        placeholder="Ajoutez une description..."
        rows="3"
        style="width: 100%; margin-bottom: 10px;"
      ></textarea>
    </div>

    <!-- Note -->
    <RatingScore
      v-model="score"
      :score="score"
      @update:score="updateScore"
    />
    <button
      v-if="score !== null"
      @click="resetScore"
      style="margin-bottom: 10px; padding: 5px 10px; background-color: #ff4d4d; color: white; border: none; border-radius: 5px; cursor: pointer;"
    >
      Supprimer la note
    </button>

    <!-- État -->
    <div class="state">
      <label>État du pays :</label><br />
      <input type="radio" id="visited" value="visited" v-model="state" />
      <label for="visited">Visité</label><br />
      <input type="radio" id="toVisit" value="to_visit" v-model="state" />
      <label for="toVisit">À visiter</label><br />
      <input type="radio" id="notSelected" value="not_selected" v-model="state" />
      <label for="notSelected">Non sélectionné</label><br />
    </div>

    <!-- Ajout de photos -->
    <div class="photos">
      <label>Photos :</label>
      <input type="file" accept="image/*" multiple @change="handleFileUpload" />
      <div v-if="photos.length" class="photo-preview">
        <p>Aperçu des photos :</p>
        <ul>
          <li v-for="(photo, index) in photos" :key="index" style="display: flex; align-items: center; margin-bottom: 10px;">
            <img :src="photo.url" alt="Photo preview" width="100" style="margin: 5px; border: 1px solid #ccc; border-radius: 5px;" />
          </li>
        </ul>
      </div>
    </div>

    <!-- Boutons -->
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
    initialPhotos: Array,
  },
  data() {
    return {
      description: this.initialDescription || "",
      state: this.initialState || "not_selected",
      score: this.initialScore,
      photos: this.initialPhotos || [],
    };
  },
  methods: {
    saveChanges() {
      this.$emit("save", {
        description: this.description,
        state: this.state,
        score: this.score,
        photos: this.photos,
      });
    },
    updateScore(score) {
      this.score = score;
    },
    resetScore() {
      this.score = 0;
    },
    handleFileUpload(event) {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.photos.push({ url: e.target.result, file });
        };
        reader.readAsDataURL(file);
      });
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
  overflow: auto;
  height: 70%;
}

.state {
  margin: 15px 0 10px 0;
}

.description-text {
  margin-top: 10px;
}

.photos {
  margin: 10px 0 20px 0;
}

.photo-preview img {
  border: 1px solid #ccc;
  border-radius: 5px;
}

.photo-preview ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.photo-preview li {
  display: inline-block;
}
</style>
