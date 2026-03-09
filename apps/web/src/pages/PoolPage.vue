<template>
  <div class="pool-page">
    <button class="btn-back" @click="goBack">
      ← Voltar
    </button>

    <div class="form-container">
      <div class="form-header">
        <div class="form-icon">🏆</div>
        <div class="form-title-section">
          <h1 class="form-title">Criar Novo Bolão</h1>
          <p class="form-subtitle">Configure seu bolão da Copa 2026 e compartilhe com seus amigos</p>
        </div>
      </div>

      <form @submit.prevent="createPool" class="form">
        <div class="form-group">
          <label for="name" class="form-label">
            Nome do Bolão
          </label>
          <input
            type="text"
            id="name"
            v-model="formData.name"
            placeholder="Ex: Bolão dos Amigos"
            class="form-input"
            required
          >
        </div>

        <div class="form-group">
          <label for="description" class="form-label">
            Descrição
          </label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Descreva seu bolão..."
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div class="form-section">
          <h3 class="section-title">Regras de Pontuação</h3>
          
          <div class="form-group">
            <label for="exactScore" class="form-label">
              Placar Exato
            </label>
            <input
              type="number"
              id="exactScore"
              v-model.number="formData.exactScore"
              min="0"
              class="form-input"
              required
            >
            <p class="form-help">Pontos ao acertar o placar exato</p>
          </div>

          <div class="form-group">
            <label for="goalDifference" class="form-label">
              Diferença de Gols Correta
            </label>
            <input
              type="number"
              id="goalDifference"
              v-model.number="formData.goalDifference"
              min="0"
              class="form-input"
              required
            >
            <p class="form-help">Pontos ao acertar a diferença de gols</p>
          </div>

          <div class="form-group">
            <label for="correctWinner" class="form-label">
              Vencedor Correto
            </label>
            <input
              type="number"
              id="correctWinner"
              v-model.number="formData.correctWinner"
              min="0"
              class="form-input"
              required
            >
            <p class="form-help">Pontos ao acertar apenas o vencedor</p>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-submit" :disabled="!isFormValid || loading">
          {{ loading ? 'Criando...' : 'Criar Bolão' }}
        </button>
      </form>
    </div>

    <Transition name="modal">
      <div v-if="showSuccessModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-icon">✅</div>
          <h2 class="modal-title">Bolão Criado com Sucesso!</h2>
          <p class="modal-text">
            Seu bolão "{{ createdPool?.name }}" foi criado e está pronto para receber participantes.
          </p>
          <div class="invite-code-section">
            <p class="invite-label">Código de Convite:</p>
            <div class="invite-code">{{ createdPool?.inviteCode }}</div>
            <button class="btn-copy" @click="copyInviteCode">
              📋 Copiar Código
            </button>
          </div>
          <div class="modal-actions">
            <button class="btn-modal-primary" @click="goToHome">
              Ver Meus Bolões
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoolStore } from '../stores/poolStore'
import { userService } from '../services/api/userService'

const router = useRouter()
const poolStore = usePoolStore()

// Test user - In a real app, this would come from authentication
const TEST_USER_EMAIL = 'joao@example.com'
const userId = ref<number | null>(null)

onMounted(async () => {
  try {
    const user = await userService.getUserByEmail(TEST_USER_EMAIL)
    userId.value = user.id
  } catch (error) {
    console.error('Error loading user:', error)
  }
})

const formData = ref({
  name: '',
  description: '',
  exactScore: 5,
  goalDifference: 3,
  correctWinner: 1
})

const showSuccessModal = ref(false)
const createdPool = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' &&
         formData.value.exactScore >= 0 &&
         formData.value.goalDifference >= 0 &&
         formData.value.correctWinner >= 0
})

const goBack = () => {
  router.push('/')
}

const createPool = async () => {
  if (!isFormValid.value || !userId.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const pool = await poolStore.createPool({
      name: formData.value.name,
      description: formData.value.description || undefined,
      ownerId: userId.value,
      scoringRules: {
        exact_score: formData.value.exactScore,
        goal_difference: formData.value.goalDifference,
        correct_winner: formData.value.correctWinner,
        wrong: 0,
      },
    })
    
    createdPool.value = pool
    showSuccessModal.value = true
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar bolão. Tente novamente.'
    console.error('Error creating pool:', err)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showSuccessModal.value = false
}

const copyInviteCode = () => {
  if (createdPool.value?.inviteCode) {
    navigator.clipboard.writeText(createdPool.value.inviteCode)
    alert('Código copiado para área de transferência!')
  }
}

const goToHome = () => {
  closeModal()
  router.push('/')
}
</script>

<style scoped>
.pool-page {
  min-height: calc(100vh - 200px);
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

.form-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.form-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f3f4f6;
}

.form-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.form-title-section {
  flex: 1;
}

.form-title {
  font-size: 1.4rem;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
  font-weight: 700;
}

.form-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.7rem 0.9rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #1a1a1a;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #9ca3af;
}

.form-textarea {
  resize: vertical;
  min-height: 70px;
}

.form-help {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.15rem;
}

.form-section {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1.2rem;
  margin-top: 0.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.error-message {
  padding: 0.75rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  font-size: 0.9rem;
}

.btn-submit {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
}

.btn-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
  text-align: center;
}

.modal-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  margin: 0 auto 1.5rem;
}

.modal-title {
  font-size: 1.75rem;
  color: #1a1a1a;
  margin-bottom: 1rem;
  font-weight: 700;
}

.modal-text {
  color: #6b7280;
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.invite-code-section {
  background: #f0f9ff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.invite-label {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.invite-code {
  font-size: 2rem;
  font-weight: 700;
  color: #0369a1;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #0369a1;
  color: #0369a1;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #0369a1;
  color: white;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  flex-direction: column;
}

.btn-modal-primary {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-modal-primary:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

@media (max-width: 768px) {
  .form-container {
    padding: 1.5rem;
  }
  
  .form-header {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  
  .form-title {
    font-size: 1.5rem;
  }
  
  .modal-content {
    padding: 2rem;
  }
  
  .modal-title {
    font-size: 1.5rem;
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
