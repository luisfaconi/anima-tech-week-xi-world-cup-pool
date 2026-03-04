<template>
  <div id="app">
    <header class="header">
      <h1>🏆 World Cup Pool</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/register">Register</router-link>
        <router-link to="/leaderboard">Leaderboard</router-link>
      </nav>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// This is the main app component
</script>

<style scoped>
.header {
  background: #1e40af;
  color: white;
  padding: 1rem;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0 0 1rem 0;
}

.header nav {
  display: flex;
  gap: 1rem;
}

.header nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.header nav a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.header nav a.router-link-active {
  background: rgba(255, 255, 255, 0.3);
}

.main {
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>