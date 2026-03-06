<template>
  <div class="palpites-page">
    <section class="games-section">
      <div class="section-header">
        <h2>Próximos Jogos</h2>
        <p class="section-subtitle">Faça seus palpites diretamente aqui</p>
      </div>

      <div class="games-list">
        <!-- Game 1 - Brasil vs Canadá -->
        <div class="game-card">
          <div class="game-header">
            <div class="group-badge">A</div>
            <div class="game-time">
              <span>16/06 às 16:00</span>
              <button class="btn-calendar">📅</button>
            </div>
          </div>
          
          <div class="game-content">
            <div class="team-section">
              <img src="https://flagcdn.com/w80/br.png" alt="Brasil" class="flag">
              <span class="team-name">Brasil</span>
            </div>
            
            <div class="score-input">
              <input 
                type="number" 
                v-model="games[0].homeScore" 
                min="0" 
                class="score-field"
                @input="markAsEdited(0)"
              >
              <span class="separator">×</span>
              <input 
                type="number" 
                v-model="games[0].awayScore" 
                min="0" 
                class="score-field"
                @input="markAsEdited(0)"
              >
            </div>
            
            <div class="team-section">
              <img src="https://flagcdn.com/w80/ca.png" alt="Canadá" class="flag">
              <span class="team-name">Canadá</span>
            </div>
          </div>
          
          <div v-if="games[0].saved" class="game-status saved">
            ✓ Palpite registrado - clique para editar
          </div>
        </div>

        <div class="game-card editing">
          <div class="game-header">
            <div class="group-badge">A</div>
            <div class="game-time">
              <span>16/06 às 19:00</span>
              <button class="btn-calendar">📅</button>
            </div>
          </div>
          
          <div class="game-content">
            <div class="team-section">
              <img src="https://flagcdn.com/w80/mx.png" alt="México" class="flag">
              <span class="team-name">México</span>
            </div>
            
            <div class="score-input">
              <input 
                type="number" 
                v-model="games[1].homeScore" 
                min="0" 
                class="score-field"
              >
              <span class="separator">×</span>
              <input 
                type="number" 
                v-model="games[1].awayScore" 
                min="0" 
                class="score-field highlighted"
              >
            </div>
            
            <div class="team-section">
              <img src="https://flagcdn.com/w80/cr.png" alt="Costa Rica" class="flag">
              <span class="team-name">Costa Rica</span>
            </div>
          </div>
          
          <div class="game-actions">
            <button class="btn-save" @click="saveGame(1)">
              ✓ Salvar Palpite
            </button>
            <button class="btn-cancel" @click="cancelEdit(1)">
              Cancelar
            </button>
          </div>
        </div>

        <div class="game-card">
          <div class="game-header">
            <div class="group-badge">A</div>
            <div class="game-time">
              <span>21/06 às 16:00</span>
              <button class="btn-calendar">📅</button>
            </div>
          </div>
          
          <div class="game-content">
            <div class="team-section">
              <img src="https://flagcdn.com/w80/br.png" alt="Brasil" class="flag">
              <span class="team-name">Brasil</span>
            </div>
            
            <div class="score-input">
              <input 
                type="text" 
                v-model="games[2].homeScore" 
                placeholder="-"
                class="score-field"
              >
              <span class="separator">×</span>
              <input 
                type="text" 
                v-model="games[2].awayScore" 
                placeholder="-"
                class="score-field"
              >
            </div>
            
            <div class="team-section">
              <img src="https://flagcdn.com/w80/cr.png" alt="Costa Rica" class="flag">
              <span class="team-name">Costa Rica</span>
            </div>
          </div>
        </div>

        <div class="game-card">
          <div class="game-header">
            <div class="group-badge">A</div>
            <div class="game-time">
              <span>21/06 às 16:00</span>
              <button class="btn-calendar">📅</button>
            </div>
          </div>
          
          <div class="game-content">
            <div class="team-section">
              <img src="https://flagcdn.com/w80/mx.png" alt="México" class="flag">
              <span class="team-name">México</span>
            </div>
            
            <div class="score-input">
              <input 
                type="text" 
                v-model="games[3].homeScore" 
                placeholder="-"
                class="score-field"
              >
              <span class="separator">×</span>
              <input 
                type="text" 
                v-model="games[3].awayScore" 
                placeholder="-"
                class="score-field"
              >
            </div>
            
            <div class="team-section">
              <img src="https://flagcdn.com/w80/ca.png" alt="Canadá" class="flag">
              <span class="team-name">Canadá</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const games = reactive([
  {
    id: 1,
    homeTeam: 'Brasil',
    awayTeam: 'Canadá',
    homeScore: 2,
    awayScore: 1,
    date: '16/06 às 16:00',
    group: 'A',
    saved: true
  },
  {
    id: 2,
    homeTeam: 'México',
    awayTeam: 'Costa Rica',
    homeScore: 3,
    awayScore: 1,
    date: '16/06 às 19:00',
    group: 'A',
    saved: false
  },
  {
    id: 3,
    homeTeam: 'Brasil',
    awayTeam: 'Costa Rica',
    homeScore: '',
    awayScore: '',
    date: '21/06 às 16:00',
    group: 'A',
    saved: false
  },
  {
    id: 4,
    homeTeam: 'México',
    awayTeam: 'Canadá',
    homeScore: '',
    awayScore: '',
    date: '21/06 às 16:00',
    group: 'A',
    saved: false
  }
])

const saveGame = (index: number) => {
  games[index].saved = true
  console.log('Palpite salvo:', games[index])
}

const cancelEdit = (index: number) => {
  games[index].homeScore = ''
  games[index].awayScore = ''
  console.log('Edição cancelada')
}

const markAsEdited = (index: number) => {
  games[index].saved = false
}
</script>

<style scoped>
.palpites-page {
  min-height: calc(100vh - 200px);
}

.suggestion-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.match-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1.5rem;
  position: relative;
}

.team {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.flag-small {
  width: 32px;
  height: 24px;
  object-fit: cover;
  border-radius: 4px;
}

.vs {
  color: #888;
  font-size: 0.9rem;
}

.confidence-badge {
  position: absolute;
  right: 0;
  background: #ede9fe;
  color: #7c3aed;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.suggestion-result {
  text-align: center;
  margin-bottom: 1rem;
}

.suggestion-title {
  font-size: 1.8rem;
  background: linear-gradient(135deg, #a855f7, #d946ef);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
}

.ai-info {
  background: #fef3c7;
  color: #92400e;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
}

.games-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.5rem;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  color: #888;
  font-size: 0.95rem;
}

.games-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.game-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
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
  margin-bottom: 1.5rem;
}

.group-badge {
  width: 40px;
  height: 40px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.game-time {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #666;
  font-size: 0.95rem;
}

.btn-calendar {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
}

.game-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.team-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.flag {
  width: 60px;
  height: 45px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.team-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #1a1a1a;
}

.score-input {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 0 0 auto;
}

.score-field {
  width: 70px;
  height: 70px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  text-align: center;
  font-size: 2rem;
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

.score-field::placeholder {
  color: #cbd5e1;
}

.separator {
  font-size: 1.5rem;
  color: #9ca3af;
  font-weight: 500;
}

.game-status {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
  font-size: 0.9rem;
}

.game-status.saved {
  background: #d1fae5;
  color: #065f46;
}

.game-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
}

.btn-save {
  flex: 1;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-cancel {
  padding: 1rem 2rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #cbd5e1;
  background: #f9fafb;
}

@media (max-width: 768px) {
  .game-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .match-preview {
    flex-direction: column;
    gap: 1rem;
  }
  
  .confidence-badge {
    position: static;
  }
  
  .game-actions {
    flex-direction: column;
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
