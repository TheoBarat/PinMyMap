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
      <div>
        <label>Photos :</label><br />
        <input type="file" @change="handlePhotoUpload" multiple style="margin-bottom: 10px;" />
        <div class="photo-preview">
          <img v-for="(photo, index) in photos" :src="photo" :key="index" alt="Photo ajoutée" />
        </div>
      </div>
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
      </div>
      <button @click="saveChanges" style="margin-right: 10px;">Enregistrer</button>
      <button @click="$emit('close')">Annuler</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isVisible: Boolean,
      countryName: String,
      initialDescription: String,
      initialPhotos: Array,
      initialState: String,
    },
    data() {
      return {
        description: this.initialDescription || "",
        photos: [...this.initialPhotos] || [],
        state: this.initialState || "to_visit",
      };
    },
    methods: {
      handlePhotoUpload(event) {
        const files = event.target.files;
        for (const file of files) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.photos.push(e.target.result);
          };
          reader.readAsDataURL(file);
        }
      },
      saveChanges() {
        this.$emit("save", {
          description: this.description,
          photos: this.photos,
          state: this.state,
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
  }
  
  .photo-preview img {
    width: 100px;
    height: 100px;
    margin: 5px;
    object-fit: cover;
    border: 1px solid #ddd;
  }
  </style>
  