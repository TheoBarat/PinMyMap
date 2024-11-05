<template>
    <nav>
      <img alt="Logo" src="../assets/PinMyMapLogo.png" style="height: 80px; width: 80px;" />
      <ul class="navbar">
        <li id="dotNavbar"><a href="#" style="color: white; text-decoration: none;">Home</a></li>
        <li id="dotNavbar"><a href="#" style="color: white; text-decoration: none;">About</a></li>
        <li id="dotNavbar"><a href="#" style="color: white; text-decoration: none;">Contact</a></li>
      </ul>
    </nav>
  </template>
  
  <script>
  export default {
    name: "Header",
  };
  </script>
  
  <style scoped>
  nav {
    height: 10vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #333;
    color: white;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
  }
  .navbar {
    display: flex;
    list-style-type: none;
    margin: 0;
    padding: 10;
  }
  .dotNavbar {
    margin: 0 20px;
  }
  </style>  