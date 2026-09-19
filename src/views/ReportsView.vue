<template>
  <div class="reports-closing-page">
    <!-- Top Sub-Navigation Header Bar -->
    <div class="reports-header-bar">
      <div class="report-tabs">
        <div class="tab-btn" :class="{ active: activeTab === 'closing' }" @click="activeTab = 'closing'">
          <el-icon><DataAnalysis /></el-icon>
          <span>{{ langStore.t('salesClosingTab') }}</span>
        </div>

        <div class="tab-btn" :class="{ active: activeTab === 'pnl' }" @click="activeTab = 'pnl'">
          <el-icon><TrendCharts /></el-icon>
          <span>{{ langStore.t('pnlTab') }}</span>
        </div>

        <div class="tab-btn" :class="{ active: activeTab === 'summary' }" @click="activeTab = 'summary'">
          <el-icon><Box /></el-icon>
          <span>{{ langStore.t('productSummaryTab') }}</span>
        </div>

        <div class="tab-btn" :class="{ active: activeTab === 'logs' }" @click="activeTab = 'logs'">
          <el-icon><View /></el-icon>
          <span>{{ langStore.t('txLogsTab') }}</span>
        </div>
      </div>

      <!-- FILTER TANGGAL & BULAN (PER TANGGAL & PER BULAN) -->
      <div class="date-filter-tools">
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
    </div>

    <!-- TAB 1: LAPORAN PENUTUPAN PENJUALAN -->
    <div class="report-body" v-if="activeTab === 'closing'">
      <!-- Key Financial Snapshot Cards -->
      <div class="metrics-row">
        <div class="metric-card green-card">
          <span class="m-label">{{ langStore.currentLang === 'en' ? 'Total Net Sales' : 'Total Penjualan Bersih' }}</span>
          <span class="m-value">{{ formatRp(totalSalesAmount) }}</span>
        </div>
        <div class="metric-card orange-card">
          <span class="m-label">{{ langStore.t('totalVoidVal') }}</span>
          <span class="m-value">{{ voidTransactions.length }} Tx ({{ formatRp(voidTotalAmount) }})</span>
        </div>
      </div>

      <!-- Financial Closing Breakdown Table (Payment Methods, Tax, Recapitulation) -->
      <div class="pos-card p-4">
        <div class="flex justify-between align-center mb-3">
          <h3>{{ langStore.currentLang === 'en' ? 'Sales Closing Summary by Payment Method & Tax' : 'Ringkasan Penutupan Penjualan Berdasarkan Metode Pembayaran & Pajak' }}</h3>
          <el-button type="primary" size="small" :icon="Printer" @click="printPnl">{{ langStore.t('printReport') }}</el-button>
        </div>

        <el-row :gutter="16" class="mb-4">
          <el-col :span="6">
            <div class="pm-box">
              <span class="lbl">CASH (Tunai)</span>
              <span class="val text-blue">{{ formatRp(salesByPaymentMethod.CASH) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="pm-box">
              <span class="lbl">QRIS Tap / BCA</span>
              <span class="val text-green">{{ formatRp(salesByPaymentMethod.QRIS) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="pm-box">
              <span class="lbl">Bank Transfer / Debit</span>
              <span class="val text-purple">{{ formatRp(salesByPaymentMethod.TRANSFER) }}</span>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="pm-box">
              <span class="lbl">Informasi Pajak PPN (10%)</span>
              <span class="val text-orange">{{ formatRp(totalTaxAmount) }}</span>
            </div>
          </el-col>
        </el-row>

        <!-- Category Recapitulation Table -->
        <h4 class="mt-4 mb-2">{{ langStore.t('salesByCategory') }}</h4>
        <el-table :data="categorySalesRecap" style="width: 100%" stripe size="small">
          <el-table-column prop="category" :label="langStore.t('category')" font-weight="bold" />
          <el-table-column prop="itemCount" :label="langStore.t('soldQty')" align="right" />
          <el-table-column prop="totalSales" :label="langStore.t('totalTurnover')" align="right">
            <template #default="scope">
              <span class="text-green font-bold">{{ formatRp(scope.row.totalSales) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- TAB 2: RINGKASAN LABA RUGI (PROFIT & LOSS STATEMENT) -->
    <div class="report-body" v-else-if="activeTab === 'pnl'">
      <div class="pos-card p-4">
        <div class="pnl-header">
          <div class="pnl-title-box">
            <h3>{{ langStore.t('pnlTab') }}</h3>
            <span class="text-sub">{{ langStore.currentLang === 'en' ? 'Period Filter: ' : 'Periode Filter: ' }}{{ filterMode === 'daily' ? (langStore.currentLang === 'en' ? 'Date ' : 'Tanggal ') + selectedDate : (langStore.currentLang === 'en' ? 'Month ' : 'Bulan ') + selectedMonth }}</span>
          </div>
          <div class="flex gap-2 pnl-actions-group">
            <el-button type="warning" size="default" @click="isEditCogsOpen = true">{{ langStore.currentLang === 'en' ? 'Edit COGS' : 'Edit HPP / COGS' }}</el-button>
            <el-button type="primary" size="default" @click="isEditOpexOpen = true">{{ langStore.currentLang === 'en' ? 'Edit OPEX' : 'Edit OPEX' }}</el-button>
            <el-button type="success" size="default" :icon="Printer" @click="printPnl">{{ langStore.t('exportExcel') }}</el-button>
          </div>
        </div>

        <div class="pnl-statement-container mt-4">
          <!-- 1. PENDAPATAN -->
          <div class="pnl-section">
            <div class="pnl-row section-title">
              <span>1. PENDAPATAN OPERASIONAL</span>
              <span></span>
            </div>
            <div class="pnl-row indent">
              <span>Penjualan Kotor Kasir POS</span>
              <span>{{ formatRp(totalSalesAmount) }}</span>
            </div>
            <div class="pnl-row indent">
              <span>Potongan Diskon Pesanan</span>
              <span>- {{ formatRp(totalDiscount) }}</span>
            </div>
            <div class="pnl-row subtotal">
              <span>PENDAPATAN BERSIH (NET REVENUE)</span>
              <span class="text-blue font-bold">{{ formatRp(netRevenue) }}</span>
            </div>
          </div>

          <!-- 2. HPP -->
          <div class="pnl-section mt-3">
            <div class="pnl-row section-title">
              <span>2. HARGA POKOK PENJUALAN (HPP / COGS)</span>
              <el-button type="text" size="small" style="color: #e6a23c; font-weight: bold;" @click="isEditCogsOpen = true">✏️ Edit HPP</el-button>
            </div>
            <div class="pnl-row indent">
              <span>Biaya Bahan Baku & Olahan Terpakai (Mode: {{ cogsMode === 'percent' ? cogsPercent + '%' : 'Nominal Rp' }})</span>
              <span>- {{ formatRp(totalCogs) }}</span>
            </div>
            <div class="pnl-row subtotal">
              <span>LABA KOTOR (GROSS PROFIT)</span>
              <span class="text-green font-bold">{{ formatRp(grossProfit) }}</span>
            </div>
          </div>

          <!-- 3. BEBAN OPERASIONAL -->
          <div class="pnl-section mt-3">
            <div class="pnl-row section-title">
              <span>3. BEBAN OPERASIONAL (OPEX)</span>
              <el-button type="text" size="small" style="color: #1890ff; font-weight: bold;" @click="isEditOpexOpen = true">✏️ Edit OPEX</el-button>
            </div>
            <div class="pnl-row indent">
              <span>Pengeluaran Kas Keluar (Petty Cash Drawer)</span>
              <span>- {{ formatRp(totalCashOut) }}</span>
            </div>
            <div class="pnl-row indent">
              <span>Estimasi Gaji & Operasional Resto ({{ filterMode === 'daily' ? 'Harian' : 'Bulanan' }})</span>
              <span>- {{ formatRp(opexEstimate) }}</span>
            </div>
            <div class="pnl-row indent text-sub font-11" v-if="customOpexNotes" style="padding-left: 28px; margin-top: -4px;">
              <i>Catatan OPEX: {{ customOpexNotes }}</i>
            </div>
            <div class="pnl-row subtotal">
              <span>TOTAL BEBAN OPERASIONAL</span>
              <span class="text-red font-bold">- {{ formatRp(totalCashOut + opexEstimate) }}</span>
            </div>
          </div>

          <!-- 4. LABA BERSIH -->
          <div class="pnl-section mt-4 net-profit-box">
            <div class="pnl-row final-row">
              <span>LABA / (RUGI) BERSIH RESTO (NET PROFIT)</span>
              <span :class="netProfit >= 0 ? 'text-green font-bold font-22' : 'text-red font-bold font-22'">
                {{ formatRp(netProfit) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: RINGKASAN PENJUALAN PRODUK -->
    <div class="report-body" v-else-if="activeTab === 'summary'">
      <div class="pos-card p-4">
        <h3>{{ langStore.t('productSummaryTab') }}</h3>
        <el-table :data="productSalesSummary" style="width: 100%" stripe class="mt-2">
          <el-table-column prop="name" :label="langStore.t('productName')" min-width="180" font-weight="bold" />
          <el-table-column prop="category" :label="langStore.t('category')" width="140" />
          <el-table-column prop="qty" :label="langStore.t('soldQty')" width="130" align="right" />
          <el-table-column prop="total" :label="langStore.t('totalTurnover')" width="160" align="right">
            <template #default="scope">
              <span class="text-green font-bold">{{ formatRp(scope.row.total) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- TAB 4: LOGS TRANSAKSI -->
    <div class="report-body" v-else>
      <div class="pos-card p-4">
        <h3>{{ langStore.t('txLogsTab') }}</h3>
        <el-table :data="filteredTransactions" style="width: 100%" stripe class="mt-2">
          <el-table-column prop="transaction_no" :label="langStore.t('txNo')" width="180" font-weight="bold" />
          <el-table-column prop="created_at" :label="langStore.t('txTimeCol')" width="160" />
          <el-table-column prop="cashier_name" :label="langStore.t('cashierCol')" width="120" />
          <el-table-column prop="payment_method" :label="langStore.t('paymentMethodCol')" width="160" />
          <el-table-column prop="total_amount" :label="langStore.t('totalCol')" width="140" align="right">
            <template #default="scope">
              <span class="font-bold">{{ formatRp(scope.row.total_amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="langStore.t('statusLbl')" width="110">
            <template #default="scope">
              <el-tag type="success">{{ scope.row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- Modal Edit HPP / COGS -->
    <el-dialog v-model="isEditCogsOpen" title="Penyesuaian Biaya HPP / COGS" width="460px">
      <el-form label-width="160px">
        <el-form-item label="Metode Penentuan HPP">
          <el-radio-group v-model="cogsMode">
            <el-radio label="percent">Persentase (%)</el-radio>
            <el-radio label="manual">Nominal Manual (Rp)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="Persentase HPP (%)" v-if="cogsMode === 'percent'">
          <el-input-number v-model="cogsPercent" :min="1" :max="90" />
        </el-form-item>
        <el-form-item label="Nominal HPP Custom (Rp)" v-else>
          <el-input-number v-model="manualCogsAmount" :min="0" :step="10000" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isEditCogsOpen = false">Batal</el-button>
        <el-button type="success" @click="saveCogsEdit">Terapkan Penyesuaian HPP</el-button>
      </template>
    </el-dialog>

    <!-- Modal Edit OPEX (Beban Operasional) -->
    <el-dialog v-model="isEditOpexOpen" title="Penyesuaian Beban Operasional (OPEX)" width="480px">
      <el-form label-width="190px">
        <el-form-item label="Estimasi Gaji & Ops / Hari (Rp)">
          <el-input-number v-model="dailyOpexEstimate" :min="0" :step="10000" style="width: 100%;" />
        </el-form-item>

        <el-form-item label="Estimasi Gaji & Ops / Bulan (Rp)">
          <el-input-number v-model="monthlyOpexEstimate" :min="0" :step="100000" style="width: 100%;" />
        </el-form-item>

        <el-form-item label="Catatan / Detail Komponen">
          <el-input 
            v-model="customOpexNotes" 
            type="textarea" 
            :rows="2" 
            placeholder="Contoh: Gaji 2 Karyawan, Listrik & Air, Wi-Fi, Kebersihan" 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="isEditOpexOpen = false">Batal</el-button>
        <el-button type="primary" @click="saveOpexEdit">Terapkan Penyesuaian OPEX</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePosStore } from '@/stores/posStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { DataAnalysis, TrendCharts, Box, View, Printer } from '@element-plus/icons-vue';

const route = useRoute();
const posStore = usePosStore();
const langStore = useLangStore();
const activeTab = ref('closing');
const filterMode = ref('daily');

const todayStr = new Date().toISOString().slice(0, 10);
const thisMonthStr = new Date().toISOString().slice(0, 7);

const selectedDate = ref(todayStr);
const selectedMonth = ref(thisMonthStr);

const syncTab = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else if (route.path.includes('financial')) {
    activeTab.value = 'pnl';
  } else {
    activeTab.value = 'closing';
  }
};

const isEditCogsOpen = ref(false);
const cogsMode = ref('percent'); // 'percent' or 'manual'
const cogsPercent = ref(45);
const manualCogsAmount = ref(150000);

const isEditOpexOpen = ref(false);
const dailyOpexEstimate = ref(100000);
const monthlyOpexEstimate = ref(3000000);
const customOpexNotes = ref('');

onMounted(() => {
  posStore.initDefaultHistory();
  syncTab();

  const savedOpex = localStorage.getItem('bien_pos_opex_settings');
  if (savedOpex) {
    try {
      const parsed = JSON.parse(savedOpex);
      if (parsed.daily !== undefined) dailyOpexEstimate.value = parsed.daily;
      if (parsed.monthly !== undefined) monthlyOpexEstimate.value = parsed.monthly;
      if (parsed.notes !== undefined) customOpexNotes.value = parsed.notes;
    } catch (e) {}
  }

  const savedCogs = localStorage.getItem('bien_pos_cogs_settings');
  if (savedCogs) {
    try {
      const parsed = JSON.parse(savedCogs);
      if (parsed.mode !== undefined) cogsMode.value = parsed.mode;
      if (parsed.percent !== undefined) cogsPercent.value = parsed.percent;
      if (parsed.manual !== undefined) manualCogsAmount.value = parsed.manual;
    } catch (e) {}
  }
});
watch(() => [route.path, route.query.tab], syncTab);

const filteredTransactions = computed(() => {
  return posStore.transactionsHistory.filter(tx => {
    if (filterMode.value === 'daily') {
      return tx.date_str === selectedDate.value || tx.created_at.includes(selectedDate.value);
    } else {
      return tx.month_str === selectedMonth.value || tx.created_at.includes(selectedMonth.value);
    }
  });
});

const voidTransactions = computed(() => {
  return filteredTransactions.value.filter(tx => tx.status === 'VOID' || tx.status === 'DIBATALKAN');
});

const voidTotalAmount = computed(() => {
  return voidTransactions.value.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
});

const salesByPaymentMethod = computed(() => {
  const result = { CASH: 0, QRIS: 0, TRANSFER: 0 };
  filteredTransactions.value.forEach(tx => {
    const pm = (tx.payment_method || 'CASH').toUpperCase();
    if (pm.includes('CASH')) result.CASH += tx.total_amount || 0;
    else if (pm.includes('QRIS') || pm.includes('OVO')) result.QRIS += tx.total_amount || 0;
    else result.TRANSFER += tx.total_amount || 0;
  });
  return result;
});

const totalTaxAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, tx) => sum + (tx.tax || Math.round((tx.total_amount || 0) * 0.10)), 0);
});

const categorySalesRecap = computed(() => {
  const map = {
    'Makanan': { category: 'Makanan', itemCount: 0, totalSales: 0 },
    'Minuman': { category: 'Minuman', itemCount: 0, totalSales: 0 },
    'Cemilan': { category: 'Cemilan', itemCount: 0, totalSales: 0 }
  };
  filteredTransactions.value.forEach(tx => {
    if (tx.items) {
      tx.items.forEach(item => {
        const catName = item.name.toLowerCase().includes('kopi') || item.name.toLowerCase().includes('teh') ? 'Minuman' : item.name.toLowerCase().includes('roti') ? 'Cemilan' : 'Makanan';
        map[catName].itemCount += item.qty;
        map[catName].totalSales += (item.sell_price * item.qty);
      });
    }
  });
  return Object.values(map);
});

const totalSalesAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
});

const totalDiscount = computed(() => {
  return filteredTransactions.value.reduce((sum, tx) => sum + (tx.discount || 0), 0);
});

const netRevenue = computed(() => {
  return totalSalesAmount.value - totalDiscount.value;
});

const totalCogs = computed(() => {
  if (cogsMode.value === 'manual') return manualCogsAmount.value;
  return Math.round(netRevenue.value * (cogsPercent.value / 100));
});

const grossProfit = computed(() => {
  return netRevenue.value - totalCogs.value;
});

const filteredCashOut = computed(() => {
  return posStore.cashFlowHistory.filter(cf => {
    const isOut = cf.type === 'Kas Keluar';
    if (filterMode.value === 'daily') {
      return isOut && (cf.date_str === selectedDate.value || cf.date.includes(selectedDate.value));
    } else {
      return isOut && (cf.month_str === selectedMonth.value || cf.date.includes(selectedMonth.value));
    }
  });
});

const totalCashOut = computed(() => {
  return filteredCashOut.value.reduce((sum, cf) => sum + (cf.amount || 0), 0);
});

const opexEstimate = computed(() => {
  return filterMode.value === 'daily' ? dailyOpexEstimate.value : monthlyOpexEstimate.value;
});

const netProfit = computed(() => {
  return grossProfit.value - (totalCashOut.value + opexEstimate.value);
});

const productSalesSummary = computed(() => {
  const map = {};
  filteredTransactions.value.forEach(tx => {
    if (tx.items) {
      tx.items.forEach(item => {
        if (!map[item.name]) {
          map[item.name] = { name: item.name, category: 'makanan', qty: 0, total: 0 };
        }
        map[item.name].qty += item.qty;
        map[item.name].total += (item.sell_price * item.qty);
      });
    }
  });
  return Object.values(map);
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const saveCogsEdit = () => {
  isEditCogsOpen.value = false;
  localStorage.setItem('bien_pos_cogs_settings', JSON.stringify({
    mode: cogsMode.value,
    percent: cogsPercent.value,
    manual: manualCogsAmount.value
  }));
  ElNotification({
    title: 'Penyesuaian HPP',
    message: `Nilai HPP berhasil disesuaikan (${cogsMode.value === 'percent' ? cogsPercent.value + '%' : 'Rp ' + manualCogsAmount.value})!`,
    type: 'success'
  });
};

const saveOpexEdit = () => {
  isEditOpexOpen.value = false;
  localStorage.setItem('bien_pos_opex_settings', JSON.stringify({
    daily: dailyOpexEstimate.value,
    monthly: monthlyOpexEstimate.value,
    notes: customOpexNotes.value
  }));
  ElNotification({
    title: 'Penyesuaian OPEX',
    message: `Beban Operasional berhasil diperbarui (${filterMode.value === 'daily' ? 'Harian Rp ' + formatRp(dailyOpexEstimate.value) : 'Bulanan Rp ' + formatRp(monthlyOpexEstimate.value)})!`,
    type: 'success'
  });
};

const printPnl = () => {
  window.print();
  ElNotification({ title: 'Cetak Laporan', message: 'Menyiapkan dokumen untuk dicetak!', type: 'success' });
};
</script>

<style scoped>
.reports-closing-page { display: flex; flex-direction: column; gap: 20px; }

.reports-header-bar {
  background-color: #ffffff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  overflow: hidden;
}

.report-tabs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.report-tabs::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 10px;
  color: #64748b;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-btn:hover { background-color: #f1f5f9; color: #2563eb; }

.tab-btn.active { background-color: #eef2ff; color: #2563eb; font-weight: 800; }

.date-filter-tools {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

:deep(.date-filter-tools .el-input__wrapper) {
  min-height: 36px !important;
  height: 36px !important;
}

:deep(.mode-toggle .el-radio-button__inner) {
  background: #f1f5f9;
  color: #475569;
  border: none;
  font-weight: 700;
  font-size: 14px;
  height: 36px;
  line-height: 36px;
  padding: 0 15px;
}

:deep(.mode-toggle .el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #2563eb;
  color: white;
}

.report-body { display: flex; flex-direction: column; gap: 20px; }

.metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

@media (max-width: 768px) {
  .reports-header-bar {
    flex-direction: column !important;
    align-items: stretch !important;
    padding: 14px !important;
    gap: 12px !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  .report-tabs {
    width: 100% !important;
    overflow-x: auto !important;
    padding-bottom: 6px !important;
    gap: 8px !important;
  }

  .tab-btn {
    padding: 8px 12px !important;
    font-size: 13px !important;
  }

  .date-filter-tools {
    width: 100% !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }

  :deep(.mode-toggle) {
    display: flex !important;
    width: 100% !important;
  }

  :deep(.mode-toggle .el-radio-button) {
    flex: 1 !important;
  }

  :deep(.mode-toggle .el-radio-button__inner) {
    width: 100% !important;
  }

  :deep(.el-date-editor), :deep(.el-date-editor.el-input), :deep(.el-date-editor.el-input__wrapper) {
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .metrics-row, .charts-grid { grid-template-columns: 1fr !important; gap: 12px !important; }

  .metric-card {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 6px !important;
    padding: 14px 16px !important;
  }

  .m-label {
    font-size: 14px !important;
  }

  .m-value {
    font-size: 20px !important;
  }

  .chart-box {
    padding: 14px !important;
    min-height: auto !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  .pnl-header {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 12px !important;
  }

  .pnl-actions-group {
    flex-direction: column !important;
    width: 100% !important;
    gap: 8px !important;
  }

  .pnl-actions-group .el-button {
    width: 100% !important;
    margin-left: 0 !important;
  }

  .pnl-section {
    padding: 12px 14px !important;
  }

  .pnl-row {
    font-size: 13px !important;
    flex-wrap: wrap !important;
    gap: 4px !important;
  }
}

.metric-card { padding: 20px 24px; border-radius: 14px; color: white; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
.metric-card.green-card { background: linear-gradient(135deg, #10b981, #059669); }
.metric-card.orange-card { background: linear-gradient(135deg, #f97316, #ea580c); }
.m-label { font-size: 17px; font-weight: 700; }
.m-value { font-size: 26px; font-weight: 800; }

.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-box { padding: 24px; display: flex; flex-direction: column; min-height: 300px; }
.chart-title { font-size: 17px; color: #1e1b4b; font-weight: 800; margin-bottom: 24px; }

.bar-chart-wrapper { display: flex; height: 200px; border-bottom: 1px solid #cbd5e1; }
.y-axis { display: flex; flex-direction: column; justify-content: space-between; font-size: 12px; color: #64748b; padding-right: 14px; }
.bars-container { flex: 1; display: flex; align-items: flex-end; justify-content: space-around; }
.bar-col { display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
.bar.empty { height: 0; }
.bar.active-bar { width: 44px; background-color: #2563eb; border-radius: 6px 6px 0 0; position: relative; transition: height 0.3s; }
.bar-tooltip { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); color: #2563eb; font-size: 12px; font-weight: bold; }
.x-lbl { font-size: 12px; color: #475569; margin-top: 8px; font-weight: 600; }

.donut-chart-wrapper { display: flex; align-items: center; justify-content: center; height: 180px; }
.donut-circle { width: 150px; height: 150px; border-radius: 50%; background: conic-gradient(#2563eb 0% 100%); display: flex; align-items: center; justify-content: center; position: relative; }
.donut-center { width: 50px; height: 50px; border-radius: 50%; background-color: white; }
.donut-center-label { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 16px; font-weight: 800; color: #1e1b4b; }
.chart-legend { display: flex; align-items: center; gap: 10px; margin-top: 20px; font-size: 14px; font-weight: 600; }
.legend-box.teal { width: 16px; height: 16px; background-color: #2563eb; border-radius: 4px; }

/* PNL Statement Table */
.pnl-header { display: flex; justify-content: space-between; align-items: center; }
.pnl-statement-container { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.pnl-section { background-color: #ffffff; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.pnl-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 15px; }
.pnl-row.section-title { font-weight: 800; color: #1e1b4b; background-color: #f8fafc; padding: 10px 14px; border-radius: 6px; }
.pnl-row.indent { padding-left: 28px; color: #475569; }
.pnl-row.subtotal { border-top: 1px dashed #cbd5e1; margin-top: 6px; padding-top: 10px; font-weight: 800; }
.net-profit-box { background-color: #ecfdf5; border: 2px solid #10b981; }
.pnl-row.final-row { font-size: 18px; font-weight: 800; }

.text-blue { color: #2563eb; }
.text-green { color: #10b981; }
.text-red { color: #ef4444; }
.font-bold { font-weight: bold; }
.font-22 { font-size: 24px; }
.mt-4 { margin-top: 20px; }
.mt-3 { margin-top: 14px; }
.mt-2 { margin-top: 10px; }
.p-4 { padding: 20px; }
.text-sub { font-size: 13px; color: #64748b; }
</style>
