<template>
  <div class="payment-methods-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('paymentMethodsTitle') }}</h2>
      <el-button type="success" :icon="Plus" @click="openAddGatewayModal">{{ langStore.t('addGatewayBtn') }}</el-button>
    </div>

    <!-- QRIS Status Banner -->
    <div class="qris-status-banner">
      <div class="qris-info">
        <div class="q-logo font-bold">QRIS Dynamic</div>
        <span>{{ langStore.t('qrisStatusBanner') }}</span>
      </div>
      <el-tag type="success" effect="dark">QRIS Live Ready</el-tag>
    </div>

    <!-- Payment Gateways Table -->
    <el-table :data="gateways" style="width: 100%" stripe class="mt-4">
      <el-table-column prop="name" :label="langStore.t('gatewayName')" min-width="180" font-weight="bold" />
      <el-table-column prop="type" :label="langStore.t('integrationType')" width="160" />
      <el-table-column prop="merchantId" :label="langStore.t('merchantId')" width="160" />
      <el-table-column prop="fee" :label="langStore.t('mdrFee')" width="120" align="right" />
      <el-table-column prop="status" :label="langStore.t('cashierStatus')" width="140">
        <template #default="scope">
          <el-switch v-model="scope.row.active" :active-text="langStore.t('active')" :inactive-text="langStore.t('inactive')" />
        </template>
      </el-table-column>
      <el-table-column :label="langStore.t('actionCol')" width="120" align="center">
        <template #default="scope">
          <el-button size="small" type="primary" plain @click="configureGateway(scope.row)">{{ langStore.t('configure') }}</el-button>
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

const gateways = ref([
  { name: 'CASH (Tunai)', type: 'Manual Cash Drawer', merchantId: 'INTERNAL', fee: '0.0%', active: true },
  { name: 'QRIS Tap by Netzme', type: 'Olsera QRIS Dynamic', merchantId: 'NZM-991204', fee: '0.7%', active: true },
  { name: 'QRIS by BCA', type: 'Bank Direct Integration', merchantId: 'BCA-771201', fee: '0.7%', active: true },
  { name: 'OVO E-Wallet', type: 'EDC / API Integration', merchantId: 'OVO-110293', fee: '1.5%', active: false },
  { name: 'ShopeePay', type: 'API Integration', merchantId: 'SPP-448102', fee: '1.5%', active: false }
]);

const openAddGatewayModal = () => {
  ElNotification({ title: langStore.t('paymentMethodsTitle'), message: langStore.currentLang === 'id' ? 'Form tambah integrasi payment gateway dibuka.' : 'Add payment gateway integration form opened.', type: 'info' });
};

const configureGateway = (row) => {
  ElNotification({ title: langStore.t('configure'), message: `Configuring API key ${row.name}`, type: 'info' });
};
</script>

<style scoped>
.payment-methods-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.qris-status-banner {
  background: linear-gradient(135deg, #0088ff, #0050b3);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qris-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.q-logo {
  background-color: white;
  color: #0050b3;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 13px;
}

.font-bold { font-weight: bold; }
.mt-4 { margin-top: 16px; }
</style>
