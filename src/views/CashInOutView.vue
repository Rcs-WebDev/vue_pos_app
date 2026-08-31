<template>
  <div class="cash-flow-page pos-card">
    <div class="page-title-row">
      <div class="title-with-icon">
        <el-icon class="page-icon"><Money /></el-icon>
        <h2>{{ langStore.t('cashInOutTitle') }}</h2>
      </div>

      <!-- FILTER TANGGAL & BULAN -->
      <div class="filter-controls-group">
        <el-radio-group v-model="filterMode" size="small" class="mode-toggle">
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
        />

        <el-date-picker
          v-else
          v-model="selectedMonth"
          type="month"
          :placeholder="langStore.t('selectMonth')"
          value-format="YYYY-MM"
          size="small"
          style="width: 130px;"
        />
      </div>

      <div class="action-btns">
        <el-button type="success" @click="openCashInModal">{{ langStore.t('cashInRecordBtn') }}</el-button>
        <el-button type="warning" @click="openCashOutModal">{{ langStore.t('cashOutRecordBtn') }}</el-button>
      </div>
    </div>

    <!-- Balance Cards Row -->
    <div class="balance-cards-row">
      <div class="b-card green">
        <span class="lbl">{{ langStore.t('currentCashBalance') }} ({{ filterMode === 'daily' ? selectedDate : selectedMonth }})</span>
        <span class="val">{{ formatRp(totalCashIn - totalCashOut) }}</span>
      </div>
      <div class="b-card blue">
        <span class="lbl">{{ langStore.currentLang === 'en' ? 'Total Cash In' : 'Total Kas Masuk' }}</span>
        <span class="val">{{ formatRp(totalCashIn) }}</span>
      </div>
      <div class="b-card orange">
        <span class="lbl">{{ langStore.currentLang === 'en' ? 'Total Cash Out (Operational Expenses)' : 'Total Kas Keluar (Pengeluaran Operasional)' }}</span>
        <span class="val">{{ formatRp(totalCashOut) }}</span>
      </div>
    </div>

    <!-- History Table -->
    <el-table :data="filteredCashLogs" style="width: 100%" stripe class="mt-4">
      <el-table-column prop="date" label="Waktu Audit" width="160" />
      <el-table-column prop="type" label="Tipe Transaksi" width="140">
        <template #default="scope">
          <el-tag :type="scope.row.type === 'Kas Masuk' ? 'success' : 'warning'">{{ scope.row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="Nominal (Rp)" width="150" align="right">
        <template #default="scope">
          <span :class="scope.row.type === 'Kas Masuk' ? 'text-green' : 'text-orange'">
            {{ scope.row.type === 'Kas Masuk' ? '+' : '-' }} {{ formatRp(scope.row.amount) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="cashier" label="Kasir" width="120" />
      <el-table-column prop="notes" label="Keterangan / Catatan Alasan" min-width="200" />
    </el-table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePosStore } from '@/stores/posStore';
import { useLangStore } from '@/stores/langStore';
import { ElMessageBox, ElNotification } from 'element-plus';
import { Money } from '@element-plus/icons-vue';

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

const filteredCashLogs = computed(() => {
  return posStore.cashFlowHistory.filter(cf => {
    if (filterMode.value === 'daily') {
      return cf.date_str === selectedDate.value || cf.date.includes(selectedDate.value);
    } else {
      return cf.month_str === selectedMonth.value || cf.date.includes(selectedMonth.value);
    }
  });
});

const totalCashIn = computed(() => {
  return filteredCashLogs.value
    .filter(cf => cf.type === 'Kas Masuk')
    .reduce((sum, cf) => sum + (cf.amount || 0), 0);
});

const totalCashOut = computed(() => {
  return filteredCashLogs.value
    .filter(cf => cf.type === 'Kas Keluar')
    .reduce((sum, cf) => sum + (cf.amount || 0), 0);
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const openCashInModal = () => {
  ElMessageBox.prompt('Masukkan Jumlah Kas Masuk (Rp):', 'Kas Masuk Baru', {
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    inputType: 'number'
  }).then(({ value }) => {
    posStore.addCashFlowEntry({
      type: 'Kas Masuk',
      amount: Number(value || 0),
      notes: 'Penerimaan Kas Tambahan'
    });
    ElNotification({ title: 'Kas Masuk', message: `Kas masuk sebesar Rp ${value} berhasil dicatat.`, type: 'success' });
  }).catch(() => {});
};

const openCashOutModal = () => {
  ElMessageBox.prompt('Masukkan Jumlah Kas Keluar (Rp):', 'Kas Keluar Operasional', {
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal',
    inputType: 'number'
  }).then(({ value }) => {
    posStore.addCashFlowEntry({
      type: 'Kas Keluar',
      amount: Number(value || 0),
      notes: 'Pengeluaran Kas Operasional'
    });
    ElNotification({ title: 'Kas Keluar', message: `Kas keluar sebesar Rp ${value} berhasil dicatat.`, type: 'warning' });
  }).catch(() => {});
};
</script>

<style scoped>
.cash-flow-page { padding: 20px; }

.page-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.title-with-icon { display: flex; align-items: center; gap: 10px; }
.page-icon { font-size: 28px; color: #1890ff; }
.filter-controls-group { display: flex; align-items: center; gap: 10px; }

.balance-cards-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.b-card { padding: 16px; border-radius: 8px; color: white; display: flex; flex-direction: column; }
.b-card.green { background-color: #4caf50; }
.b-card.blue { background-color: #2196f3; }
.b-card.orange { background-color: #ff9800; }

.b-card .lbl { font-size: 12px; opacity: 0.9; }
.b-card .val { font-size: 24px; font-weight: 800; }

.text-green { color: #52c41a; font-weight: bold; }
.text-orange { color: #fa8c16; font-weight: bold; }
.mt-4 { margin-top: 16px; }
</style>
