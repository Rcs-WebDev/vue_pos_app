<template>
  <el-dialog
    v-model="posStore.isPaymentModalOpen"
    width="850px"
    class="payment-dialog"
    :show-close="true"
    :close-on-click-modal="false"
  >
    <div class="payment-container">
      <!-- Left Sidebar: Payment Methods -->
      <div class="payment-methods-sidebar">
        <div class="sidebar-title">{{ langStore.t('selectPaymentMethod') }}</div>
        <div class="methods-list">
          <div
            v-for="method in posStore.paymentMethods"
            :key="method.id"
            class="method-item"
            :class="{
              'is-active': posStore.selectedPaymentMethod === method.id,
              'is-disabled': method.disabled
            }"
            @click="!method.disabled && (posStore.selectedPaymentMethod = method.id)"
          >
            <div class="method-icon-box">
              <span class="icon-text">{{ method.id.includes('QRIS') ? 'QRIS' : method.id.split('_')[0] }}</span>
            </div>
            <div class="method-info">
              <span class="method-name">{{ method.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Main: Calculator & Tender Display -->
      <div class="payment-numpad-area">
        <!-- Top Bar: Cash Summary & Quick Preset Denominations -->
        <div class="numpad-header">
          <div class="method-summary">
            <span class="summary-method">{{ posStore.selectedPaymentMethod }}</span>
            <span class="summary-total">{{ formatRp(posStore.totalAmount) }}</span>
          </div>

          <div class="quick-presets">
            <button 
              class="preset-btn"
              @click="posStore.setTenderedAmount(posStore.totalAmount)"
            >
              {{ langStore.t('exactMoney') }}
            </button>
            <button 
              class="preset-btn"
              @click="posStore.setTenderedAmount(40000)"
            >
              40.000
            </button>
            <button 
              class="preset-btn"
              @click="posStore.setTenderedAmount(50000)"
            >
              50.000
            </button>
            <button 
              class="preset-btn"
              @click="posStore.setTenderedAmount(100000)"
            >
              100.000
            </button>
            <button 
              class="close-preset-btn"
              @click="posStore.closePaymentModal()"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Big Display of Entered Cash Tendered -->
        <div class="tender-display-box">
          <div class="tender-amount-text">
            {{ formatNumberOnly(posStore.tenderedAmount) }}
          </div>
        </div>

        <!-- Numpad Keyboard Grid (3x4) -->
        <div class="numpad-grid">
          <button class="num-btn" @click="posStore.appendNumpad('1')">1</button>
          <button class="num-btn" @click="posStore.appendNumpad('2')">2</button>
          <button class="num-btn" @click="posStore.appendNumpad('3')">3</button>

          <button class="num-btn" @click="posStore.appendNumpad('4')">4</button>
          <button class="num-btn" @click="posStore.appendNumpad('5')">5</button>
          <button class="num-btn" @click="posStore.appendNumpad('6')">6</button>

          <button class="num-btn" @click="posStore.appendNumpad('7')">7</button>
          <button class="num-btn" @click="posStore.appendNumpad('8')">8</button>
          <button class="num-btn" @click="posStore.appendNumpad('9')">9</button>

          <button class="num-btn clear-btn" @click="posStore.appendNumpad('C')">C</button>
          <button class="num-btn" @click="posStore.appendNumpad('0')">0</button>
          <button class="num-btn" @click="posStore.appendNumpad('00')">00</button>
        </div>

        <!-- Keyboard Hint Bar -->
        <div class="keyboard-hint-bar">
          <span>⌨️ {{ langStore.t('keyboardShortcutHint') }}</span>
        </div>

        <!-- Submit Bayar Button -->
        <div class="bayar-action-bar">
          <button 
            class="bayar-button" 
            :disabled="posStore.tenderedAmount < posStore.totalAmount"
            @click="posStore.submitPayment()"
          >
            {{ langStore.t('payActionBtn') }}
          </button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { usePosStore } from '@/stores/posStore';
import { useLangStore } from '@/stores/langStore';

const posStore = usePosStore();
const langStore = useLangStore();

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const formatNumberOnly = (val) => {
  if (!val) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
};

// Keyboard Event Listener for Numpad / Keyboard Number Input
const handleKeyDown = (e) => {
  if (!posStore.isPaymentModalOpen) return;

  // Skip if user is typing inside an input element or textarea
  if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName)) return;

  if (e.key >= '0' && e.key <= '9') {
    e.preventDefault();
    posStore.appendNumpad(e.key);
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    const currentStr = String(posStore.tenderedAmount || 0);
    if (currentStr.length <= 1) {
      posStore.tenderedAmount = 0;
    } else {
      posStore.tenderedAmount = Number(currentStr.slice(0, -1));
    }
  } else if (e.key === 'Delete' || e.key === 'c' || e.key === 'C') {
    e.preventDefault();
    posStore.appendNumpad('C');
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (posStore.tenderedAmount >= posStore.totalAmount) {
      posStore.submitPayment();
    }
  } else if (e.key === 'Escape') {
    e.preventDefault();
    posStore.closePaymentModal();
  }
};

watch(() => posStore.isPaymentModalOpen, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleKeyDown);
  } else {
    window.removeEventListener('keydown', handleKeyDown);
  }
});

onMounted(() => {
  if (posStore.isPaymentModalOpen) {
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
:deep(.payment-dialog .el-dialog__header) {
  display: none;
}

:deep(.payment-dialog .el-dialog__body) {
  padding: 0 !important;
  border-radius: 8px;
  overflow: hidden;
}

.payment-container {
  display: flex;
  height: 540px;
  background-color: #0b253a;
  color: white;
}

.payment-methods-sidebar {
  width: 280px;
  background-color: #0d2c44;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #163d5c;
}

.sidebar-title {
  padding: 16px;
  font-weight: bold;
  font-size: 15px;
  background-color: #0a1f30;
  border-bottom: 1px solid #163d5c;
}

.methods-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: #2196f3;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-item:hover:not(.is-disabled) {
  background-color: #1e88e5;
  transform: translateX(2px);
}

.method-item.is-active {
  border: 2px solid #ffffff;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.8);
}

.method-item.is-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.method-icon-box {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

.method-name {
  font-size: 13px;
  font-weight: 600;
}

/* Numpad Area */
.payment-numpad-area {
  flex: 1;
  background-color: #ffffff;
  color: #333;
  display: flex;
  flex-direction: column;
}

.numpad-header {
  background-color: #2196f3;
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.method-summary {
  display: flex;
  flex-direction: column;
}

.summary-method {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

.summary-total {
  font-size: 20px;
  font-weight: 800;
}

.quick-presets {
  display: flex;
  align-items: center;
  gap: 6px;
}

.preset-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.preset-btn:hover {
  background-color: rgba(255, 255, 255, 0.35);
}

.close-preset-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  margin-left: 8px;
}

.tender-display-box {
  padding: 16px 20px;
  text-align: right;
  border-bottom: 1px solid #e0e0e0;
}

.tender-amount-text {
  font-size: 38px;
  font-weight: 700;
  color: #2c3e50;
  font-family: monospace;
}

.numpad-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 1px;
  background-color: #f0f0f0;
}

.num-btn {
  background-color: #ffffff;
  border: none;
  font-size: 24px;
  font-weight: 600;
  color: #333333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}

.num-btn:hover {
  background-color: #e3f2fd;
}

.num-btn:active {
  background-color: #bbdefb;
}

.clear-btn {
  color: #ff9800;
  font-weight: bold;
}

.keyboard-hint-bar {
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 6px 12px;
  font-size: 11px;
  color: #64748b;
  text-align: center;
}

.bayar-action-bar {
  padding: 0;
}

.bayar-button {
  width: 100%;
  padding: 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bayar-button:hover:not(:disabled) {
  background-color: #43a047;
}

.bayar-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
