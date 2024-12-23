<template>
  <div class="view" v-if="isVisible">
    <h2>Détails du pays : {{ countryName }}</h2>
    <div>
      <p><strong>Description :</strong></p>
      <p>{{ description }}</p>
    </div>
    <div>
      <p><strong>Note :</strong> {{ score }} 🌟</p>
    </div>
    <div>
      <p><strong>État :</strong> {{ state === 'visited' ? 'Visité' : 'À visiter' }}</p>
    </div>

    <!-- Photos -->
    <div v-if="photos && photos.length" class="photo-gallery">
      <p><strong>Photos :</strong></p>
      <div class="photo-list">
        <img
          v-for="(photo, index) in photos"
          :key="index"
          :src="photo.url"
          alt="Photo"
          class="photo-thumbnail"
          @click="openPhoto(index)"
        />
      </div>
    </div>

    <!-- Galerie en plein écran -->
    <div class="fullscreen-gallery" v-if="fullscreenPhotoIndex !== null" @click.self="closePhoto">
      <button class="close-button" @click="closePhoto">X</button>
      <img :src="photos[fullscreenPhotoIndex].url" alt="Photo pleine écran" class="fullscreen-photo" />
      <button class="prev-button" v-if="fullscreenPhotoIndex > 0" @click="showPrevPhoto">&#8249;</button>
      <button class="next-button" v-if="fullscreenPhotoIndex < photos.length - 1" @click="showNextPhoto">&#8250;</button>
    </div>

    <button @click="$emit('close')">Fermer</button>
  </div>
</template>

<script>
export default {
  props: {
    isVisible: Boolean,
    countryName: String,
    description: String,
    score: Number,
    state: String,
    photos: {
      type: Array,
      default: () => [], // Initialisez comme tableau vide
    },
  },
  data() {
    return {
      fullscreenPhotoIndex: null, // Index de la photo affichée en plein écran
    };
  },
  methods: {
    openPhoto(index) {
      this.fullscreenPhotoIndex = index;
    },
    closePhoto() {
      this.fullscreenPhotoIndex = null;
    },
    showPrevPhoto() {
      if (this.fullscreenPhotoIndex > 0) {
        this.fullscreenPhotoIndex--;
      }
    },
    showNextPhoto() {
      if (this.fullscreenPhotoIndex < this.photos.length - 1) {
        this.fullscreenPhotoIndex++;
      }
    },
  },
};
</script>

<style scoped>
.view {
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
  text-align: center;
}

button {
  margin-top: 10px;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.photo-gallery {
  margin-top: 20px;
}

.photo-list {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.photo-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #ccc;
  border-radius: 5px;
}

.photo-thumbnail:hover {
  border-color: #007bff;
}

.fullscreen-gallery {
  position: fixed;
  top: 70%;
  left: 50%;
  transform: translate(-50%, -50%); /* Centre horizontalement et verticalement */
  width: 180%; /* Ajustez selon vos besoins */
  height: auto; /* Gardez les proportions */
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  border: none; /* Supprimez la bordure rouge */
  z-index: 2000;
  padding: 20px; /* Ajout d'un léger padding */
  border-radius: 10px; /* Optionnel : coins arrondis */
}


.fullscreen-photo {
  max-width: 90%;
  max-height: 90%;
  border: 2px solid white;
  border-radius: 10px;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #ff0000;
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 18px;
  border-radius: 50%;
  cursor: pointer;
}

.prev-button,
.next-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  padding: 15px;
  font-size: 24px;
  cursor: pointer;
  border-radius: 50%;
}

.prev-button {
  left: 20px;
}

.next-button {
  right: 20px;
}

.prev-button:hover,
.next-button:hover {
  background: rgba(0, 0, 0, 0.9);
}
</style>