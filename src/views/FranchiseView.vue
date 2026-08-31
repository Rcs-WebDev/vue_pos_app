<template>
  <div class="franchise-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('franchiseTitle') }}</h2>
      <el-button type="primary" :icon="Plus" @click="openAddBranchModal">{{ langStore.t('addBranchBtn') }}</el-button>
    </div>

    <!-- Overview Stats Grid -->
    <div class="franchise-stats-grid">
      <div class="f-box blue">
        <span class="lbl">{{ langStore.t('totalOutlets') }}</span>
        <span class="val">5 {{ langStore.currentLang === 'en' ? 'Branches' : 'Cabang' }}</span>
      </div>
      <div class="f-box green">
        <span class="lbl">{{ langStore.t('totalMultiBranchSales') }}</span>
        <span class="val">Rp 12.850.000</span>
      </div>
      <div class="f-box orange">
        <span class="lbl">{{ langStore.t('busiestBranch') }}</span>
        <span class="val">Cabang Yogyakarta</span>
      </div>
    </div>

    <!-- Multi-Branch Monitoring Table -->
    <el-table :data="branches" style="width: 100%" stripe class="mt-4">
      <el-table-column prop="code" :label="langStore.t('branchCode')" width="130" font-weight="bold" />
      <el-table-column prop="name" :label="langStore.t('branchName')" min-width="180" font-weight="bold" />
      <el-table-column prop="manager" :label="langStore.t('branchManager')" width="150" />
      <el-table-column prop="city" :label="langStore.t('city')" width="140" />
      <el-table-column prop="todaySales" :label="langStore.t('todaySalesCol')" width="160" align="right">
        <template #default="scope">
          <span class="text-green font-bold">{{ formatRp(scope.row.todaySales) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" :label="langStore.t('cashierStatus')" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'BUKA' || scope.row.status === 'OPEN' ? 'success' : 'info'">
            {{ langStore.currentLang === 'en' && scope.row.status === 'BUKA' ? 'OPEN' : scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="langStore.t('realtimeAction')" width="140" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="inspectBranch(scope.row)">{{ langStore.t('liveMonitor') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const langStore = useLangStore();

const branches = ref([
  { code: 'BR-001', name: 'bien Resto - Yogyakarta', manager: 'Arif Rahman', city: 'Yogyakarta', todaySales: 4850000, status: 'BUKA' },
  { code: 'BR-002', name: 'bien Resto - Jakarta Selatan', manager: 'Heri Subagja', city: 'Jakarta', todaySales: 3900000, status: 'BUKA' },
  { code: 'BR-003', name: 'bien Resto - Bandung Dago', manager: 'Siti Rahma', city: 'Bandung', todaySales: 2600000, status: 'BUKA' },
  { code: 'BR-004', name: 'bien Resto - Surabaya Gubeng', manager: 'Budi Santoso', city: 'Surabaya', todaySales: 1500000, status: 'BUKA' }
]);

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const openAddBranchModal = () => {
  ElNotification({ title: 'Franchise Cabang', message: 'Form pendaftaran cabang franchise dibuka.', type: 'info' });
};

const inspectBranch = (row) => {
  ElNotification({ title: 'Monitoring Live', message: `Menghubungkan streaming monitoring kasir ${row.name}`, type: 'success' });
};
</script>

<style scoped>
.franchise-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.franchise-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.f-box {
  padding: 16px;
  border-radius: 8px;
  color: white;
  display: flex;
  flex-direction: column;
}

.f-box.blue { background-color: #1890ff; }
.f-box.green { background-color: #52c41a; }
.f-box.orange { background-color: #fa8c16; }

.f-box .lbl { font-size: 12px; opacity: 0.9; }
.f-box .val { font-size: 22px; font-weight: 800; }

.text-green { color: #52c41a; }
.font-bold { font-weight: bold; }
.mt-4 { margin-top: 16px; }
</style>
