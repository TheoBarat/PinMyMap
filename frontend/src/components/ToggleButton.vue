<template>
    <div class="toggle-buttonn" @click="toggleMode">
        <img :src="isEditMode ? editImage : viewImage" :alt="buttonText" />
    </div>
  </template>
  
  <script>
  import edit from "@/assets/editer.png";
  import view from "@/assets/rechercher.png";
  export default {
    props: {
    isEditMode: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      editImage: edit,
      viewImage: view,
    };
  },
  computed: {
    buttonText() {
      return this.isEditMode ? "Passer en mode Vue" : "Passer en mode Édition";
    },
  },
  methods: {
    toggleMode() {
      console.log(this.isEditMode ? "Mode édition activé" : "Mode vue activé");
      this.$emit("toggle");
    },
  },
  created() {
    console.log("isEditMode reçu :", this.isEditMode);
 },
  };
  </script>
  
  <style scoped>
  .toggle-buttonn {
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 50px;
    height: 50px;
    cursor: pointer;
    z-index: 2000;
    background: #f4f4f4; /* Évite tout blocage visuel */
    border : 2px solid rgba(0,0,0,0.2);
    border-radius: 5px;
  }
  
  .toggle-buttonn img {
    width: 90%;
    height: 90%;
    object-fit: contain;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  </style>
  