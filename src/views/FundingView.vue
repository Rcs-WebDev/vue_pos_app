<template>
  <div class="funding-page pos-card">
    <div class="page-title-row">
      <div class="title-box">
        <el-icon class="wallet-icon"><Wallet /></el-icon>
        <h2>{{ langStore.t('fundingTitle') }}</h2>
      </div>
      <el-tag type="success" size="large">{{ langStore.t('readyLimit') }}</el-tag>
    </div>

    <!-- Funding Banner -->
    <div class="funding-banner">
      <div class="f-info">
        <h3>{{ langStore.t('fundingBannerTitle') }}</h3>
        <p>{{ langStore.t('fundingBannerDesc') }}</p>
      </div>
      <el-button type="warning" size="large" @click="applyFunding">{{ langStore.t('applyFundingBtn') }}</el-button>
    </div>

    <!-- Funding History Table -->
    <div class="mt-4">
      <h3>{{ langStore.t('fundingHistory') }}</h3>
      <el-table :data="fundingApplications" style="width: 100%" stripe class="mt-2">
        <el-table-column prop="no" :label="langStore.t('applicationNo')" width="160" font-weight="bold" />
        <el-table-column prop="date" :label="langStore.t('applicationDate')" width="150" />
        <el-table-column prop="amount" :label="langStore.t('loanLimit')" width="160" align="right">
          <template #default="scope">
            <span>{{ formatRp(scope.row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tenor" :label="langStore.t('tenorMonths')" width="130" align="center" />
        <el-table-column prop="status" :label="langStore.t('approvalStatus')" width="160">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Disetujui' || scope.row.status === 'Approved' ? 'success' : 'warning'">
              {{ langStore.currentLang === 'en' && scope.row.status === 'Disetujui' ? 'Approved' : scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Wallet } from '@element-plus/icons-vue';

const langStore = useLangStore();

const fundingApplications = ref([
  { no: 'MODAL-2026-001', date: '01-Aug-2026', amount: 25000000, tenor: '12 Bulan', status: 'Disetujui' }
]);

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const applyFunding = () => {
  ElNotification({ title: langStore.t('fundingTitle'), message: langStore.currentLang === 'id' ? 'Pengajuan pemodalan Rp 50.000.000 dikirim ke tim GoTyme Modal.' : 'Funding application of IDR 50,000,000 sent to GoTyme Modal team.', type: 'success' });
};
</script>

<style scoped>
.funding-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wallet-icon { font-size: 28px; color: #fa8c16; }

.funding-banner {
  background: linear-gradient(135deg, #fa8c16, #d48806);
  color: white;
  padding: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mt-4 { margin-top: 20px; }
.mt-2 { margin-top: 8px; }
</style>
