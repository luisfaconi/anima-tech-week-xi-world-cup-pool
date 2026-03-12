<template>
  <div class="home-page">
    <section class="welcome-section">
      <h1 class="welcome-title">Bem-vindo, {{ username }}</h1>
      <p class="welcome-subtitle">Seus bolões da Copa 2026</p>
    </section>

    <div v-if="poolStore.loading" class="loading">Carregando...</div>
    <div v-else-if="poolStore.error" class="error">{{ poolStore.error }}</div>

    <div v-else class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Meus Bolões</span>
          <span class="stat-icon">⭐</span>
        </div>
        <div class="stat-value">{{ stats.boloes }}</div>
        <div class="stat-description">bolões ativos</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Participantes</span>
          <span class="stat-icon">👥</span>
        </div>
        <div class="stat-value">{{ stats.participantes }}</div>
        <div class="stat-description">pessoas competindo</div>
      </div>

      <div class="stat-card clickable" @click="goToRanking">
        <div class="stat-header">
          <span class="stat-label">Posição Média</span>
          <span class="stat-icon">📊</span>
        </div>

        <div v-if="userStats && userStats.averagePosition !== null" class="stat-value">
          {{ userStats.averagePosition.toFixed(1) }}º
        </div>
        <div v-else class="coming-soon">Sem dados</div>
        <div v-if="userStats && userStats.averagePosition !== null" class="stat-description">
          posição média em {{ stats.boloes }} {{ stats.boloes === 1 ? 'bolão' : 'bolões' }}
        </div>
      </div>

      <div class="stat-card purple">
        <div class="stat-header">
          <span class="stat-label">IA Disponível</span>
          <span class="stat-icon">🤖</span>
        </div>
        <div class="coming-soon">Em breve</div>
      </div>
    </div>

    <div class="actions-section">
      <div class="action-column">
        <h3 class="section-title">Ações Rápidas</h3>
        <p class="section-subtitle">Gerencie seus bolões</p>
        
        <div class="action-buttons">
          <button class="action-btn btn-create" @click="createPick">
            <span class="btn-icon">➕</span>
            Fazer Palpites
          </button>
          <button class="action-btn btn-create" @click="createPool">
            <span class="btn-icon">➕</span>
            Criar Bolão
          </button>
        </div>
      </div>

      <div class="action-column">
        <h3 class="section-title">Meus Bolões</h3>
        <p class="section-subtitle">Clique para ver detalhes</p>
        
        <div v-if="poolStore.pools.length === 0" class="empty-state">
          Você ainda não participa de nenhum bolão
        </div>
        <button 
          v-for="pool in poolStore.pools" 
          :key="pool.id"
          class="bolao-card" 
          @click="viewPool(pool.id)"
        >
          <span>{{ pool.name }}</span>
          <span class="badge">{{ pool.memberCount }} pessoas</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoolStore } from '../stores/poolStore'
import { userService, type UserStats } from '../services/api/userService'

const router = useRouter()
const poolStore = usePoolStore()

// Test user - In a real app, this would come from authentication
const TEST_USER_EMAIL = 'joao@example.com'
const userId = ref<number | null>(null)
const username = ref('João Silva')
const userStats = ref<UserStats | null>(null)

const stats = computed(() => ({
  boloes: poolStore.pools.length,
  participantes: poolStore.pools.reduce((sum, pool) => sum + (pool.memberCount || 0), 0),
}))

onMounted(async () => {
  try {
    // Get user by email (dynamic ID)
    const user = await userService.getUserByEmail(TEST_USER_EMAIL)
    userId.value = user.id
    username.value = user.name
    
    // Fetch pools for this user
    await poolStore.fetchUserPools(user.id)
    
    // Fetch user statistics
    userStats.value = await userService.getUserStats(user.id)
  } catch (error) {
    console.error('Error loading user:', error)
  }
})

const createPick = () => {
  router.push('/picks')
}

const createPool = () => {
  if (userId.value) {
    router.push('/pool')
  }
}

const viewPool = (poolId: number) => {
  router.push(`/ranking/${poolId}`)
}

const goToRanking = () => {
  // Navigate to first pool's ranking if available
  if (poolStore.pools.length > 0) {
    router.push(`/ranking/${poolStore.pools[0].id}`)
  }
}
</script>

<style scoped>
.home-page {
  min-height: calc(100vh - 200px);
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  color: #666;
  font-size: 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: #dc2626;
  background: #fee2e2;
  border-radius: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}

.stat-card.purple {
  background: linear-gradient(135deg, #f3e7ff, #e9d5ff);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
}

.stat-description {
  font-size: 0.85rem;
  color: #888;
}

.coming-soon {
  margin-top: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #fef3c7;
  color: #92400e;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

.actions-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.action-column {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-title {
  font-size: 1.3rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  color: #1a1a1a;
}

.action-btn:hover {
  border-color: #0099ff;
  background: #f0f9ff;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #888;
  font-size: 0.95rem;
}

.bolao-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #0099ff;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  color: #0099ff;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.bolao-card:hover {
  background: #f0f9ff;
}

.badge {
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .actions-section {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
}
</style>
