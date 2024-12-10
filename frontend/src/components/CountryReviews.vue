<template>
    <div class="container">
      <h2 class="title">{{ country.name }} - Notes et Commentaires</h2>
      <p class="average-rating">
        Note moyenne : {{ (averageRating || 0).toFixed(2) }} 🌟
      </p>
  
      <div v-if="comments.length" class="comments-list">
        <div v-for="comment in comments" :key="comment.user.id" class="comment-card">
          <p class="comment-author">{{ comment.user.email }}</p>
          <p class="comment-rating">Note : {{ comment.score }} 🌟</p>
          <p class="comment-description">{{ comment.description }}</p>
        </div>
      </div>
      <div v-else class="no-comments">
        Aucun commentaire pour ce pays.
      </div>
  
      <button @click="close" class="close-button">Fermer</button>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      country: { type: Object, required: true },
      comments: { type: Array, required: true },
      averageRating: {
        type: Number,
        default: 0,
      },
    },
    methods: {
      close() {
        this.$emit("close");
      },
    },
  };
  </script>
  
  <style scoped>
  /* Container principal */
  .container {
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  
  /* Titre */
  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 16px;
    color: #333;
  }
  
  /* Note moyenne */
  .average-rating {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #555;
  }
  
  /* Liste de commentaires */
  .comments-list {
    margin-bottom: 20px;
  }
  
  /* Carte de commentaire */
  .comment-card {
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  /* Auteur du commentaire */
  .comment-author {
    font-weight: bold;
    color: #333;
    margin-bottom: 5px;
  }
  
  /* Note du commentaire */
  .comment-rating {
    font-size: 14px;
    color: #777;
  }
  
  /* Description du commentaire */
  .comment-description {
    margin-top: 8px;
    color: #444;
    line-height: 1.4;
  }
  
  /* Aucun commentaire */
  .no-comments {
    text-align: center;
    color: #999;
    font-size: 16px;
  }
  
  /* Bouton de fermeture */
  .close-button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #e53e3e;
    color: #ffffff;
    font-weight: bold;
    font-size: 14px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .close-button:hover {
    background-color: #cc3333;
  }
  </style>
  