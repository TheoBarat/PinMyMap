<template>
    <button
      class="custom-button"
      :style="{ backgroundColor: buttonColor, fontSize: buttonSize }"
      @click="$emit('click')"
    >
      <slot>{{ buttonText }}</slot>
    </button>
  </template>
  
  <script>
  export default {
    name: "CustomButton",
    props: {
      buttonColor: {
        type: String,
        default: "rgb(254, 65, 77)",
      },
      buttonText: {
        type: String,
        default: "Button",
      },
      buttonSize: {
        type: String,
        default: "16px",
      },
    },
  };
  </script>
  
  <style scoped>
  .custom-button {
    color: white;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
  }
  
  .custom-button:hover {
    background-color: rgba(254, 65, 77, 0.8);
    box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.3);
  }
  </style>