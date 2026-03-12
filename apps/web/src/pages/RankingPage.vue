<template>
  <main class="main-content">
    <button class="btn-back" @click="goBack">
      ← Voltar
    </button>

    <div class="bolao-container">
      <div class="bolao-header">
        <div class="bolao-title-section">
          <h1 class="bolao-title">{{ selectedPool?.name || 'Bolão da Copa 2026' }}</h1>
          <p class="bolao-subtitle">{{ selectedPool?.description || 'Selecione um bolão' }}</p>
        </div>
        <div class="bolao-actions-section">
          <div v-if="userPools.length > 0" class="pool-info">
            <span class="info-label">Bolão</span>
            <select
              id="pool-select"
              v-model="selectedPoolId"
              @change="onPoolChange"
              class="pool-select"
            >
              <option
                v-for="pool in userPools"
                :key="pool.id"
                :value="pool.id"
              >
                {{ pool.name }}
              </option>
            </select>
          </div>
          <div v-if="selectedPool?.inviteCode" class="code-info">
            <span class="info-label">Código</span>
            <div class="code-box">
              <span class="code-text">{{ selectedPool.inviteCode }}</span>
              <button class="btn-copy" @click="copyCode" title="Copiar código">
                📋
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Participantes</span>
            <span class="stat-icon">👥</span>
          </div>
          <div class="stat-value">{{ participantsCount }}</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Placar Exato</span>
            <span class="stat-icon">⭐</span>
          </div>
          <div class="stat-value">{{ exactScorePoints }} pts</div>
        </div>

        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">Vencedor</span>
            <span class="stat-icon">🏆</span>
          </div>
          <div class="stat-value">{{ winnerPoints }} pts</div>
        </div>
      </div>

      <div class="tabs-container">
        <div class="tabs">
          <button 
            class="tab" 
            :class="{ active: activeTab === 'ranking' }"
            @click="activeTab = 'ranking'"
          >
            🏅 Ranking
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'games' }"
            @click="activeTab = 'games'"
          >
            ⚽ Jogos
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'chat' }"
            @click="activeTab = 'chat'"
          >
            💬 Chat
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'stats' }"
            @click="activeTab = 'stats'"
          >
            📊 Stats
          </button>
          <button 
            class="tab" 
            :class="{ active: activeTab === 'history' }"
            @click="activeTab = 'history'"
          >
            📜 Histórico
          </button>
        </div>

        <div class="tab-content">
          <div v-show="activeTab === 'ranking'" class="ranking-section">
            <div v-if="loading" class="loading-state">Carregando ranking...</div>
            <div v-else-if="error" class="error-state">{{ error }}</div>
            <div v-else-if="rankingData.length === 0" class="empty-state">
              Nenhum ranking disponível para este bolão
            </div>
            <div v-else class="ranking-list">
              <div
                v-for="(player, index) in rankingData"
                :key="player.userId"
                class="ranking-item"
                :class="{ highlight: player.userId === testUser?.id }"
              >
                <div class="ranking-position">
                  <span v-if="index < 3" class="position-medal">{{ getMedal(index) }}</span>
                  <span class="position-number">{{ player.position }}º</span>
                </div>
                <div class="player-info">
                  <div class="player-avatar">{{ getInitials(player.userName) }}</div>
                  <div class="player-details">
                    <div class="player-name">
                      {{ player.userName }}
                      <span v-if="player.userId === testUser?.id" class="badge-you">Você</span>
                    </div>
                    <div class="player-stats">
                      {{ player.totalPicks }} palpites • {{ player.correctPicks }} acertos
                      <span v-if="player.exactScorePicks > 0">
                        • {{ player.exactScorePicks }} placar{{ player.exactScorePicks > 1 ? 'es' : '' }} exato{{ player.exactScorePicks > 1 ? 's' : '' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="player-points">{{ player.totalPoints }} pts</div>
              </div>
            </div>
          </div>

          <div v-show="activeTab === 'games'" class="games-section">
            <p class="empty-state">⚽ Seção de jogos em desenvolvimento</p>
          </div>

          <div v-show="activeTab === 'chat'" class="chat-section">
            <p class="empty-state">💬 Chat em desenvolvimento</p>
          </div>

          <div v-show="activeTab === 'stats'" class="stats-section">
            <p class="empty-state">📊 Estatísticas em desenvolvimento</p>
          </div>

          <div v-show="activeTab === 'history'" class="history-section">
            <p class="empty-state">📜 Histórico em desenvolvimento</p>
          </div>
        </div>
      </div>
    </div>

    <transition name="toast">
      <div v-if="showToast" class="toast">
        {{ toastMessage }}
      </div>
    </transition>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userService, type User } from '../services/api/userService'
import { poolService, type Pool, type RankingEntry } from '../services/api/poolService'

const router = useRouter()
const route = useRoute()

// Test user - In a real app, this would come from authentication
const TEST_USER_EMAIL = 'joao@example.com'
const testUser = ref<User | null>(null)
const userPools = ref<Pool[]>([])
const selectedPool = ref<Pool | null>(null)
const selectedPoolId = ref<number | null>(null)

const activeTab = ref('ranking')
const participantsCount = ref(0)
const exactScorePoints = ref(5)
const winnerPoints = ref(3)
const showToast = ref(false)
const toastMessage = ref('')
const loading = ref(true)
const error = ref('')

const rankingData = ref<RankingEntry[]>([])

const getMedal = (index: number) => {
  const medals = ['🥇', '🥈', '🥉']
  return medals[index]
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const loadRanking = async (poolId: number) => {
  try {
    loading.value = true
    const ranking = await poolService.getPoolRanking(poolId)
    rankingData.value = ranking.ranking
  } catch (err) {
    console.error('Error loading ranking:', err)
    rankingData.value = []
    error.value = 'Erro ao carregar ranking'
  } finally {
    loading.value = false
  }
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    try {
      const user = await userService.getUserByEmail(TEST_USER_EMAIL)
      testUser.value = user
    } catch (err) {
      console.error('Error loading user:', err)
      error.value = 'Usuário de teste não encontrado. Execute o seed do banco de dados.'
      loading.value = false
      return
    }

    if (testUser.value) {
      try {
        const pools = await poolService.listUserPools(testUser.value.id)
        if (pools.length === 0) {
          error.value = 'Usuário não está em nenhum bolão. Execute o seed do banco de dados.'
          loading.value = false
          return
        }
        userPools.value = pools
        
        // Check if poolId is passed in route params
        const poolIdParam = route.params.id ? Number(route.params.id) : null
        
        if (poolIdParam && pools.find(p => p.id === poolIdParam)) {
          selectedPool.value = pools.find(p => p.id === poolIdParam) || pools[0]
          selectedPoolId.value = poolIdParam
        } else {
          selectedPool.value = pools[0]
          selectedPoolId.value = pools[0].id
        }
        
        updatePoolStats()
        
        await loadRanking(selectedPoolId.value!)
      } catch (err) {
        console.error('Error loading pools:', err)
        error.value = 'Erro ao carregar bolões do usuário.'
        loading.value = false
        return
      }
    }
  } catch (err: any) {
    console.error('Error loading data:', err)
    error.value = 'Erro ao carregar dados. Verifique se o servidor está rodando.'
  } finally {
    loading.value = false
  }
}

const updatePoolStats = () => {
  if (selectedPool.value) {
    participantsCount.value = selectedPool.value.memberCount || 0
    exactScorePoints.value = selectedPool.value.scoringRules.exact_score
    winnerPoints.value = selectedPool.value.scoringRules.correct_winner
  }
}

const onPoolChange = async () => {
  if (!selectedPoolId.value) return
  
  selectedPool.value = userPools.value.find(p => p.id === selectedPoolId.value) || null
  updatePoolStats()
  
  if (selectedPoolId.value) {
    await loadRanking(selectedPoolId.value)
  }
}

const copyCode = async () => {
  try {
    const code = selectedPool.value?.inviteCode || 'COPA26'
    await navigator.clipboard.writeText(code)
    toastMessage.value = 'Código copiado!'
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy code:', error)
  }
}

const goBack = () => {
  router.push('/')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem;
}

.btn-back {
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  border-color: #cbd5e1;
  background: #f9fafb;
  transform: translateX(-2px);
}

.bolao-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.bolao-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.bolao-title-section {
  flex: 1;
}

.bolao-title {
  font-size: 1.5rem;
  color: #1a1a1a;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.bolao-subtitle {
  color: #6b7280;
  font-size: 0.85rem;
}

.bolao-actions-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.pool-info,
.code-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
}

.info-label {
  font-size: 0.7rem;
  color: #6b7280;
}

.pool-select {
  padding: 0.6rem;
  font-size: 0.9rem;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  background: #eff6ff;
  color: #1e40af;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 700;
  letter-spacing: 0.05em;
  min-width: auto;
}

.pool-select:hover {
  border-color: #2563eb;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.pool-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.code-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #eff6ff;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 0.4rem 0.6rem;
}

.code-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e40af;
  letter-spacing: 0.1em;
}

.btn-copy {
  background: transparent;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem;
  transition: transform 0.2s;
}

.btn-copy:hover {
  transform: scale(1.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.stat-icon {
  font-size: 1rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
}

.tabs-container {
  margin-top: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}

.tab {
  background: transparent;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: #1a1a1a;
  background: #f9fafb;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  min-height: 300px;
}

.loading-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #dc2626;
  font-size: 0.9rem;
  background: #fef2f2;
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-size: 0.9rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.2rem;
  color: #1a1a1a;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.section-subtitle {
  color: #6b7280;
  font-size: 0.85rem;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.ranking-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.ranking-item.highlight {
  background: #eff6ff;
  border-color: #3b82f6;
}

.ranking-position {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 50px;
}

.position-number {
  font-size: 1.1rem;
  font-weight: 700;
  color: #374151;
}

.position-medal {
  font-size: 1.2rem;
}

.player-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.player-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
}

.player-details {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.player-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a1a1a;
}

.player-stats {
  font-size: 0.75rem;
  color: #6b7280;
}

.badge-you {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.15rem 0.5rem;
  background: #3b82f6;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 4px;
  text-transform: uppercase;
}

.player-points {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
}

.points-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a1a1a;
}

.points-label {
  font-size: 0.7rem;
  color: #6b7280;
}

.empty-state {
  text-align: center;
  color: #9ca3af;
  font-size: 1rem;
  padding: 3rem 2rem;
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1a1a1a;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  font-weight: 500;
  font-size: 0.9rem;
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .bolao-container {
    padding: 1.25rem;
  }

  .bolao-header {
    flex-direction: column;
    gap: 1rem;
  }

  .bolao-code-section {
    align-items: flex-start;
  }

  .bolao-title {
    font-size: 1.3rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs {
    gap: 0.2rem;
  }

  .tab {
    padding: 0.6rem 0.85rem;
    font-size: 0.8rem;
  }

  .ranking-item {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .player-info {
    flex: 1 1 100%;
  }

  .toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
