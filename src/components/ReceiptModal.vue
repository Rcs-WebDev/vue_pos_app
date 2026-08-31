<template>
  <el-dialog
    v-model="posStore.isReceiptModalOpen"
    width="520px"
    class="receipt-dialog"
    :show-close="true"
    :close-on-click-modal="false"
  >
    <div class="receipt-container" v-if="tx">
      <!-- Big Checkmark Success Circle -->
      <div class="success-icon-wrapper">
        <div class="success-circle">
          <el-icon><Check /></el-icon>
        </div>
      </div>

      <!-- Transaction No & Amounts -->
      <div class="transaction-info">
        <div class="tx-number">{{ tx.transaction_no }}</div>

        <div class="amounts-summary">
          <div class="amount-col">
            <span class="label">{{ langStore.t('totalPayment') }}</span>
            <span class="value">{{ formatNumberOnly(tx.tendered_amount) }}</span>
          </div>

          <div class="amount-col">
            <span class="label">{{ langStore.t('changeAmount') }}</span>
            <span class="value">{{ formatNumberOnly(tx.change_amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Kirim ke Dapur Button -->
      <div class="kitchen-btn-wrapper">
        <button class="kitchen-btn" @click="handleKitchenPrint">
          <el-icon><ForkSpoon /></el-icon>
          <span>{{ langStore.t('sendToKitchen') }}</span>
        </button>
      </div>

      <!-- Digital Receipt Delivery Inputs -->
      <div class="digital-receipt-inputs">
        <div class="input-row">
          <el-input 
            v-model="emailInput" 
            placeholder="Email Resi" 
            size="default"
          >
            <template #suffix>
              <el-icon class="input-icon blue"><Message /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="input-row">
          <el-input 
            v-model="phoneInput" 
            placeholder="SMS/WhatsApp Resi" 
            size="default"
          >
            <template #suffix>
              <el-icon class="input-icon blue"><Iphone /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- Action Buttons Row -->
      <div class="receipt-actions">
        <button class="action-btn orange" @click="handlePrintCustom">
          <el-icon><Printer /></el-icon>
          <span>{{ langStore.t('printCustom') }}</span>
        </button>

        <button class="action-btn blue" @click="handlePrintReceipt">
          <el-icon><Printer /></el-icon>
          <span>{{ langStore.t('printReceipt') }}</span>
        </button>

        <button class="action-btn green" @click="posStore.startNewTransaction()">
          <el-icon><Plus /></el-icon>
          <span>{{ langStore.t('newTransactionBtn') }}</span>
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePosStore } from '@/stores/posStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import {
  Check,
  ForkSpoon,
  Message,
  Iphone,
  Printer,
  Plus
} from '@element-plus/icons-vue';

const posStore = usePosStore();
const langStore = useLangStore();
const emailInput = ref('');
const phoneInput = ref('');

const tx = computed(() => posStore.activeTransaction);

const formatNumberOnly = (val) => {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
};

const handleKitchenPrint = () => {
  ElNotification({
    title: 'Dapur Resto',
    message: 'Struk dapur berhasil dikirim dan dicetak!',
    type: 'success'
  });
};

const handlePrintReceipt = () => {
  window.print();
};

const handlePrintCustom = () => {
  ElNotification({
    title: 'Cetak Custom',
    message: 'Mencetak struk dengan opsi kustomisasi!',
    type: 'info'
  });
};
</script>

<style scoped>
:deep(.receipt-dialog .el-dialog__header) {
  display: none;
}

:deep(.receipt-dialog .el-dialog__body) {
  padding: 0 !important;
  border-radius: 8px;
  overflow: hidden;
}

.receipt-container {
  background-color: #0b253a;
  color: white;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon-wrapper {
  margin-bottom: 20px;
}

.success-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: #4caf50;
}

.transaction-info {
  text-align: center;
  width: 100%;
  margin-bottom: 20px;
}

.tx-number {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 16px;
  color: #ffffff;
}

.amounts-summary {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 16px;
}

.amount-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.amount-col .label {
  font-size: 11px;
  color: #a0aec0;
  margin-bottom: 4px;
}

.amount-col .value {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
}

.kitchen-btn-wrapper {
  width: 100%;
  max-width: 320px;
  margin-bottom: 20px;
}

.kitchen-btn {
  width: 100%;
  padding: 12px;
  background-color: #ff9800;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.kitchen-btn:hover {
  background-color: #f57c00;
}

.digital-receipt-inputs {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

:deep(.digital-receipt-inputs .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: none;
}

:deep(.digital-receipt-inputs .el-input__inner) {
  color: white;
}

:deep(.digital-receipt-inputs .el-input__inner::placeholder) {
  color: #a0aec0;
}

.input-icon.blue {
  color: #2196f3;
  font-size: 16px;
}

.receipt-actions {
  display: flex;
  gap: 12px;
  width: 100%;
  justify-content: center;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: filter 0.2s;
}

.action-btn.orange {
  background-color: #ff9800;
}

.action-btn.blue {
  background-color: #2196f3;
}

.action-btn.green {
  background-color: #4caf50;
}

.action-btn:hover {
  filter: brightness(1.1);
}
</style>
