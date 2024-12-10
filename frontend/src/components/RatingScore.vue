<template>
  <div class="rating">
    <img
      v-for="(value, index) in stars"
      :key="index"
      :src="value <= currentScore ? fullStar : (value - 0.5 === currentScore ? halfStar : emptyStar)"
      alt="star"
      class="star"
      @click="setRating(value, $event)"
      @mousemove="previewRating(value, $event)"
      @mouseleave="resetPreview"
    />
  </div>
</template>

<script>
    import fullStarImage from "@/assets/full-star.png";
    import halfStarImage from "@/assets/half-star.png";
    import emptyStarImage from "@/assets/empty-star.png";

    export default {
    props: {
        score: {
          type: Number,
          default: 0, // Score initial
        },
    },
    data() {
        return {
          stars: [1, 2, 3, 4, 5],
          fullStar: fullStarImage, // Chemin de l'image étoile pleine
          halfStar: halfStarImage, // Chemin de l'image demi-étoile
          emptyStar: emptyStarImage, // Chemin de l'image étoile vide
        };
    },
    computed: {
      currentScore() {
        return this.score;
      },
    },
    methods: {
        mounted() {
          this.currentScore = this.score; // Initialise le score temporaire
        },
        setRating(value, event) {
          const rect = event.target.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const isHalf = offsetX < rect.width / 2; // Clique sur la moitié gauche
          const finalScore = isHalf ? value - 0.5 : value;
          this.currentScore = finalScore;
          this.$emit("update:score", finalScore); // Met à jour le score côté parent
        },
        previewRating(value, event) {
          const rect = event.target.getBoundingClientRect();
          const offsetX = event.clientX - rect.left;
          const isHalf = offsetX < rect.width / 2;
          this.currentScore = isHalf ? value - 0.5 : value; // Prévisualisation
        },
        resetPreview() {
          this.currentScore = this.score; // Réinitialise à la valeur actuelle
        },
    },
    };
</script>
  
<style scoped>
  .rating {
    display: flex;
    gap: 5px;
  }
  .star {
    width: 24px; /* Taille de l'image */
    height: 24px;
    cursor: pointer;
  }
</style>
  