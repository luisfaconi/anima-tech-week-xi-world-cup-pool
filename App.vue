<template>
  <div id="app">
    <header class="header">
      <div class="header-left">
        <div class="logo">
          <div class="logo-icon">⚽</div>
          <span class="logo-text">Copa 2026</span>
        </div>
      </div>
      <div class="header-right">
        <button class="btn-home" @click="goHome">🏠 Home</button>
        <button class="btn-icon">👤</button>
        <span class="username">{{ username }}</span>
        <button class="btn-icon">📤</button>
      </div>
    </header>

    <main class="main">
      <router-view />
    </main>

    <footer class="footer">
      <p>Copa 2026 - Do Zero ao Golaço, 60 Minutos para Criar uma App Inteligente da Copa 2026 🚀</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const username = ref('John Doe')

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.header {
  background: #1e40af;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 2rem;
  line-height: 1;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-home {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-home:hover {
  background: rgba(255, 255, 255, 0.3);
}

.btn-icon {
  background: transparent;
  color: white;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 0.8;
}

.username {
  font-size: 1rem;
  font-weight: 500;
}

.main {
  padding: 0 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  padding: 3rem 0 2rem;
  line-height: 1.6;
}
</style>