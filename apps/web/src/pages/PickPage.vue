<template>
  <div class="pick-page">
    <button class="btn-back" @click="goBack">
      ← Voltar
    </button>

    <div v-if="loading" class="loading">
      Carregando jogos...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <section v-else class="games-section">
      <div class="section-header">
        <h2>Próximos Jogos</h2>
        <p class="section-subtitle">Faça seus palpites diretamente aqui</p>
        <p v-if="testUser" class="user-info">Usuário: {{ testUser.name }}</p>
        
        <div v-if="userPools.length > 0" class="pool-selector">
          <label for="pool-select">Bolão:</label>
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
      </div>

      <div v-if="finishedMatches.length > 0" class="finished-section">
        <h3 class="subsection-title">Jogos Finalizados</h3>
        <div class="games-list">
          <div
            v-for="match in finishedMatches"
            :key="match.id"
            class="game-card finished"
          >
            <div class="game-header">
              <div class="group-badge">{{ match.groupName || '?' }}</div>
              <div class="game-time">
                <span>{{ formatDate(match.scheduledAt) }}</span>
                <span class="finished-badge">✓ Finalizado</span>
              </div>
            </div>
            
            <div class="game-content">
              <div class="team-section">
                <img
                  :src="`https://flagcdn.com/w80/${match.teamAFlag}.png`"
                  :alt="match.teamA"
                  class="flag"
                  v-if="match.teamAFlag"
                >
                <span class="team-name">{{ match.teamA }}</span>
              </div>
              
              <div class="score-display">
                <div class="final-score">
                  <span class="score-label">Placar Final</span>
                  <div class="score-values">
                    <span class="score-number">{{ match.teamAScore ?? '-' }}</span>
                    <span class="separator">×</span>
                    <span class="score-number">{{ match.teamBScore ?? '-' }}</span>
                  </div>
                </div>
                <div class="pick-score" v-if="getPickForMatch(match.id).saved">
                  <span class="score-label">Seu Palpite</span>
                  <div class="score-values">
                    <span class="score-number pick">{{ getPickForMatch(match.id).teamAScore }}</span>
                    <span class="separator">×</span>
                    <span class="score-number pick">{{ getPickForMatch(match.id).teamBScore }}</span>
                  </div>
                </div>
                <div class="no-pick" v-else>
                  <span class="no-pick-text">Sem palpite</span>
                </div>
              </div>
              
              <div class="team-section">
                <img
                  :src="`https://flagcdn.com/w80/${match.teamBFlag}.png`"
                  :alt="match.teamB"
                  class="flag"
                  v-if="match.teamBFlag"
                >
                <span class="team-name">{{ match.teamB }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="upcomingMatches.length === 0 && finishedMatches.length === 0" class="no-matches">
        Nenhum jogo disponível para palpites.
      </div>

      <div v-if="upcomingMatches.length > 0" class="upcoming-section">
        <h3 class="subsection-title">Próximos Jogos</h3>
        <div class="games-list">
          <div
            v-for="match in upcomingMatches"
            :key="match.id"
            class="game-card"
            :class="{ editing: editingMatchId === match.id }"
          >
          <div class="game-header">
            <div class="group-badge">{{ match.groupName || '?' }}</div>
            <div class="game-time">
              <span>{{ formatDate(match.scheduledAt) }}</span>
              <button class="btn-calendar">📅</button>
            </div>
          </div>
          
          <div class="game-content">
            <div class="team-section">
              <img 
                :src="`https://flagcdn.com/w80/${match.teamAFlag}.png`" 
                :alt="match.teamA" 
                class="flag"
                v-if="match.teamAFlag"
              >
              <span class="team-name">{{ match.teamA }}</span>
            </div>
            
            <div class="score-input">
              <input 
                type="number" 
                v-model.number="getPickForMatch(match.id).teamAScore" 
                min="0" 
                class="score-field"
                :class="{ highlighted: editingMatchId === match.id }"
                @input="markAsEditing(match.id)"
                :disabled="isMatchStarted(match.scheduledAt)"
              >
              <span class="separator">×</span>
              <input 
                type="number" 
                v-model.number="getPickForMatch(match.id).teamBScore" 
                min="0" 
                class="score-field"
                :class="{ highlighted: editingMatchId === match.id }"
                @input="markAsEditing(match.id)"
                :disabled="isMatchStarted(match.scheduledAt)"
              >
            </div>
            
            <div class="team-section">
              <img 
                :src="`https://flagcdn.com/w80/${match.teamBFlag}.png`" 
                :alt="match.teamB" 
                class="flag"
                v-if="match.teamBFlag"
              >
              <span class="team-name">{{ match.teamB }}</span>
            </div>
          </div>
          
          <div v-if="getPickForMatch(match.id).saved && editingMatchId !== match.id" class="game-status saved">
            ✓ Palpite registrado - clique para editar
          </div>

          <div v-if="isMatchStarted(match.scheduledAt)" class="game-status locked">
            🔒 Jogo iniciado - palpites bloqueados
          </div>
          
          <div v-if="editingMatchId === match.id" class="game-actions">
            <button class="btn-save" @click="savePick(match.id)" :disabled="saving">
              {{ saving ? 'Salvando...' : '✓ Salvar Palpite' }}
            </button>
            <button class="btn-cancel" @click="cancelEdit(match.id)">
              Cancelar
            </button>
          </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { matchService, type Match } from '../services/api/matchService'
import { pickService, type Pick } from '../services/api/pickService'
import { userService, type User } from '../services/api/userService'
import { poolService, type Pool } from '../services/api/poolService'

const router = useRouter()

// Test user and pools (loaded dynamically from database)
const testUser = ref<User | null>(null)
const testPool = ref<Pool | null>(null)
const userPools = ref<Pool[]>([])
const selectedPoolId = ref<number | null>(null)

const matches = ref<Match[]>([])
const picks = ref<Pick[]>([])
const localPicks = ref<Record<number, { teamAScore: number; teamBScore: number; saved: boolean; pickId?: number }>>({})
const editingMatchId = ref<number | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

// Computed properties para separar jogos finalizados e futuros
const finishedMatches = computed(() => {
  return matches.value.filter(match => match.status === 'finished')
})

const upcomingMatches = computed(() => {
  return matches.value.filter(match => match.status !== 'finished')
})

const goBack = () => {
  router.push('/')
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isMatchStarted = (scheduledAt: string) => {
  return new Date() >= new Date(scheduledAt)
}

const getPickForMatch = (matchId: number) => {
  if (!localPicks.value[matchId]) {
    localPicks.value[matchId] = {
      teamAScore: 0,
      teamBScore: 0,
      saved: false
    }
  }
  return localPicks.value[matchId]
}

const markAsEditing = (matchId: number) => {
  if (!isMatchStarted(matches.value.find(m => m.id === matchId)?.scheduledAt || '')) {
    editingMatchId.value = matchId
  }
}

const savePick = async (matchId: number) => {
  const pick = localPicks.value[matchId]
  if (!pick || !testUser.value || !testPool.value) return

  try {
    saving.value = true
    const pickData = {
      userId: testUser.value.id,
      matchId,
      poolId: testPool.value.id,
      predictedTeamAScore: pick.teamAScore,
      predictedTeamBScore: pick.teamBScore
    }

    if (pick.pickId) {
      // Update existing pick
      await pickService.updatePick(pick.pickId, {
        predictedTeamAScore: pick.teamAScore,
        predictedTeamBScore: pick.teamBScore
      })
    } else {
      // Create new pick
      const response = await pickService.createPick(pickData)
      if (response.success && response.data) {
        pick.pickId = response.data.id
      }
    }

    pick.saved = true
    editingMatchId.value = null
  } catch (err: any) {
    console.error('Error saving pick:', err)
    error.value = err.message || 'Erro ao salvar palpite'
  } finally {
    saving.value = false
  }
}

const cancelEdit = (matchId: number) => {
  // Restore original values from picks
  const existingPick = picks.value.find(p => p.matchId === matchId)
  if (existingPick) {
    localPicks.value[matchId] = {
      teamAScore: existingPick.predictedTeamAScore,
      teamBScore: existingPick.predictedTeamBScore,
      saved: true,
      pickId: existingPick.id
    }
  } else {
    localPicks.value[matchId] = {
      teamAScore: 0,
      teamBScore: 0,
      saved: false
    }
  }
  editingMatchId.value = null
}

const loadData = async () => {
  try {
    loading.value = true
    error.value = ''

    // 1. Load test user by email (from seed data)
    const TEST_USER_EMAIL = 'joao@example.com'
    try {
      const user = await userService.getUserByEmail(TEST_USER_EMAIL)
      testUser.value = user
      console.log('User loaded:', user)
    } catch (err) {
      console.error('Error loading user:', err)
      error.value = 'Usuário de teste não encontrado. Execute o seed do banco de dados.'
      return
    }

    // 2. Load user's pools
    if (testUser.value) {
      try {
        const pools = await poolService.listUserPools(testUser.value.id)
        if (pools.length === 0) {
          error.value = 'Usuário não está em nenhum bolão. Execute o seed do banco de dados.'
          return
        }
        userPools.value = pools
        testPool.value = pools[0] // Use first pool by default
        selectedPoolId.value = pools[0].id
        console.log('Pools loaded:', pools.length)
        console.log('Selected pool:', testPool.value)
      } catch (err) {
        console.error('Error loading pools:', err)
        error.value = 'Erro ao carregar bolões do usuário.'
        return
      }
    }

    // 3. Load matches
    const matchesResponse = await matchService.listMatches()
    console.log('Matches response:', matchesResponse)
    if (matchesResponse.success && matchesResponse.data) {
      // Filter only group stage matches and limit to first 12
      const allMatches = matchesResponse.data
      console.log('All matches:', allMatches.length)
      const groupMatches = allMatches.filter(m => m.matchType === 'group')
      console.log('Group matches:', groupMatches.length)
      matches.value = groupMatches.slice(0, 12)
      console.log('Matches to display:', matches.value.length)
    }

    // 4. Load user's picks for this pool
    if (testUser.value && testPool.value) {
      const picksResponse = await pickService.getUserPicks(testUser.value.id, testPool.value.id)
      if (picksResponse.success && picksResponse.data) {
        picks.value = picksResponse.data

        // Initialize local picks from existing picks
        picks.value.forEach(pick => {
          localPicks.value[pick.matchId] = {
            teamAScore: pick.predictedTeamAScore,
            teamBScore: pick.predictedTeamBScore,
            saved: true,
            pickId: pick.id
          }
        })
      }
    }
  } catch (err: any) {
    console.error('Error loading data:', err)
    error.value = 'Erro ao carregar dados. Verifique se o servidor está rodando.'
  } finally {
    loading.value = false
  }
}

const onPoolChange = async () => {
  if (!selectedPoolId.value) return
  
  // Update selected pool
  testPool.value = userPools.value.find(p => p.id === selectedPoolId.value) || null
  console.log('Pool changed to:', testPool.value)
  
  // Reload picks for new pool
  if (testUser.value && testPool.value) {
    try {
      loading.value = true
      const picksResponse = await pickService.getUserPicks(testUser.value.id, testPool.value.id)
      if (picksResponse.success && picksResponse.data) {
        picks.value = picksResponse.data
        
        // Reset local picks
        localPicks.value = {}
        
        // Initialize local picks from existing picks
        picks.value.forEach(pick => {
          localPicks.value[pick.matchId] = {
            teamAScore: pick.predictedTeamAScore,
            teamBScore: pick.predictedTeamBScore,
            saved: true,
            pickId: pick.id
          }
        })
      }
    } catch (err: any) {
      console.error('Error loading picks for new pool:', err)
      error.value = 'Erro ao carregar palpites do bolão selecionado.'
    } finally {
      loading.value = false
    }
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.pick-page {
  min-height: calc(100vh - 200px);
}

.pool-selector {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: center;
}

.pool-selector label {
  font-weight: 600;
  color: #2c3e50;
}

.pool-select {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 2px solid #3498db;
  border-radius: 8px;
  background-color: white;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
}

.pool-select:hover {
  border-color: #2980b9;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.pool-select:focus {
  outline: none;
  border-color: #2980b9;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-back {
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-back:hover {
  border-color: #cbd5e1;
  background: #f9fafb;
  transform: translateX(-2px);
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

.games-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.3rem;
  color: #1a1a1a;
  margin-bottom: 0.4rem;
}

.section-subtitle {
  color: #888;
  font-size: 0.9rem;
}

.user-info {
  color: #3b82f6;
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-card {
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  padding: 1.2rem;
  transition: all 0.3s;
  background: white;
}

.game-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.game-card.editing {
  border-color: #3b82f6;
  background: #eff6ff;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.group-badge {
  width: 36px;
  height: 36px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
}

.game-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.btn-calendar {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.2rem;
}

.game-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.team-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
}

.flag {
  width: 50px;
  height: 38px;
  object-fit: cover;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.team-name {
  font-weight: 600;
  font-size: 1rem;
  color: #1a1a1a;
}

.score-input {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 0 0 auto;
}

.score-field {
  width: 60px;
  height: 60px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a1a1a;
  transition: all 0.2s;
}

.score-field:focus {
  outline: none;
  border-color: #3b82f6;
  background: #eff6ff;
}

.score-field.highlighted {
  border-color: #3b82f6;
  background: #eff6ff;
}

.score-field:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

.separator {
  font-size: 1.3rem;
  color: #9ca3af;
  font-weight: 500;
}

.game-status {
  margin-top: 0.8rem;
  padding: 0.6rem;
  border-radius: 6px;
  text-align: center;
  font-size: 0.85rem;
}

.game-status.saved {
  background: #d1fae5;
  color: #065f46;
}

.game-status.locked {
  background: #fee2e2;
  color: #991b1b;
}

.game-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.8rem;
}

.btn-save {
  flex: 1;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 0.8rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #cbd5e1;
  background: #f9fafb;
}

/* Seções de jogos */
.finished-section,
.upcoming-section {
  margin-bottom: 2rem;
}

.subsection-title {
  font-size: 1.2rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.no-matches {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 1rem;
  background: #f9fafb;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Estilos para jogos finalizados */
.game-card.finished {
  border-color: #d1d5db;
  background: #f9fafb;
  padding: 0.8rem;
}

.game-card.finished:hover {
  border-color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.game-card.finished .group-badge {
  width: 28px;
  height: 28px;
  font-size: 0.85rem;
}

.game-card.finished .flag {
  width: 40px;
  height: 30px;
}

.game-card.finished .team-name {
  font-size: 0.9rem;
}

.finished-badge {
  background: #10b981;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 0.5rem;
}

/* Score display para jogos finalizados */
.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  flex: 0 0 auto;
  min-width: 140px;
}

.final-score,
.pick-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
}

.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.final-score .score-label {
  color: #059669;
}

.pick-score .score-label {
  color: #3b82f6;
}

.score-values {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-number {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 700;
  background: #10b981;
  color: white;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.score-number.pick {
  background: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  font-size: 1rem;
}

.no-pick {
  padding: 0.5rem 1rem;
  background: #fee2e2;
  border-radius: 6px;
  margin-top: 0.3rem;
}

.no-pick-text {
  color: #991b1b;
  font-size: 0.75rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .score-display {
    min-width: auto;
    width: 100%;
  }
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
