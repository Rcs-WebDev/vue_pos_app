<template>
  <div class="transactions-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('transactionsTitle') }}</h2>

      <!-- FILTER PER TANGGAL & PER BULAN -->
      <div class="filter-controls-group">
        <el-radio-group v-model="filterMode" size="small" class="mode-toggle">
          <el-radio-button label="all">{{ langStore.t('all') }}</el-radio-button>
          <el-radio-button label="daily">{{ langStore.t('filterDaily') }}</el-radio-button>
          <el-radio-button label="monthly">{{ langStore.t('filterMonthly') }}</el-radio-button>
        </el-radio-group>

        <el-date-picker
          v-if="filterMode === 'daily'"
          v-model="selectedDate"
          type="date"
          :placeholder="langStore.t('selectDate')"
          value-format="YYYY-MM-DD"
          size="small"
          style="width: 140px;"
          clearable
        />

        <el-date-picker
          v-else-if="filterMode === 'monthly'"
          v-model="selectedMonth"
          type="month"
          :placeholder="langStore.t('selectMonth')"
          value-format="YYYY-MM"
          size="small"
          style="width: 130px;"
          clearable
        />
      </div>

      <el-button type="success" @click="$router.push('/cashier')">{{ langStore.t('newTransactionBtn') }}</el-button>
    </div>

    <!-- Summary Banner -->
    <div class="tx-summary-banner">
      <span>{{ langStore.t('totalFilteredTx') }} <strong>{{ filteredTransactions.length }} {{ langStore.t('ordersCount') }}</strong></span>
      <span>{{ langStore.t('totalTurnover') }} <strong class="text-green font-18">{{ formatRp(totalAmountSum) }}</strong></span>
    </div>

    <el-table :data="filteredTransactions" style="width: 100%" stripe class="mt-4">
      <el-table-column prop="transaction_no" :label="langStore.t('txNo')" width="190" font-weight="bold" />
      <el-table-column prop="created_at" :label="langStore.t('timeCol')" width="160" />
      <el-table-column prop="order_type" :label="langStore.t('orderTypeCol')" width="140" />
      <el-table-column prop="cashier_name" :label="langStore.t('cashierCol')" width="100" />
      <el-table-column prop="payment_method" :label="langStore.t('paymentMethodCol')" width="140">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.payment_method }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="total_amount" :label="langStore.t('totalCol')" width="140" align="right">
        <template #default="scope">
          <span class="font-bold">{{ formatRp(scope.row.total_amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="langStore.t('statusLbl')" width="100">
        <template #default="scope">
          <el-tag type="success">{{ scope.row.status || (langStore.currentLang === 'en' ? 'SUCCESS' : 'SUKSES') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="langStore.t('actionCol')" width="120" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="reprintReceipt(scope.row)">{{ langStore.t('reprintReceiptBtn') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '@/stores/posStore';
import { useLangStore } from '@/stores/langStore';

const posStore = usePosStore();
const langStore = useLangStore();

const filterMode = ref('daily');
const todayStr = new Date().toISOString().slice(0, 10);
const thisMonthStr = new Date().toISOString().slice(0, 7);

const selectedDate = ref(todayStr);
const selectedMonth = ref(thisMonthStr);

onMounted(() => {
  posStore.initDefaultHistory();
});

const filteredTransactions = computed(() => {
  return posStore.transactionsHistory.filter(tx => {
    if (filterMode.value === 'all') return true;
    if (filterMode.value === 'daily') {
      if (!selectedDate.value) return true;
      return tx.date_str === selectedDate.value || (tx.created_at && tx.created_at.includes(selectedDate.value));
    } else if (filterMode.value === 'monthly') {
      if (!selectedMonth.value) return true;
      return tx.month_str === selectedMonth.value || (tx.created_at && tx.created_at.includes(selectedMonth.value));
    }
    return true;
  });
});

const totalAmountSum = computed(() => {
  return filteredTransactions.value.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const reprintReceipt = (tx) => {
  posStore.activeTransaction = tx;
  posStore.isReceiptModalOpen = true;
};
</script>

<style scoped>
.transactions-page { padding: 20px; }
.page-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.filter-controls-group { display: flex; align-items: center; gap: 10px; }

.tx-summary-banner {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.text-green { color: #52c41a; }
.font-18 { font-size: 18px; }
.font-bold { font-weight: bold; }
.mt-4 { margin-top: 16px; }
</style>
