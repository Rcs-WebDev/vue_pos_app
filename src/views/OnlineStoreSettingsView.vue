<template>
  <div class="online-store-config-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('onlineStoreSettingsTitle') }}</h2>
      <el-button type="primary" @click="saveConfig">{{ langStore.t('saveWebSettings') }}</el-button>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 1. Toko Online Website -->
      <el-tab-pane :label="langStore.t('tabWebStore')" name="website">
        <el-form label-width="180px" style="max-width: 600px;" class="mt-4">
          <el-form-item :label="langStore.t('onlineStoreStatus')">
            <el-switch v-model="storeConfig.onlineActive" :active-text="langStore.t('activeCanReceiveOrders')" />
          </el-form-item>
          <el-form-item :label="langStore.t('webDomain')">
            <el-input v-model="storeConfig.domain" placeholder="https://bien-resto.pos-store.id">
              <template #prepend>https://</template>
            </el-input>
          </el-form-item>
          <el-form-item :label="langStore.t('deliveryMethod')">
            <el-checkbox-group v-model="storeConfig.deliveryOptions">
              <el-checkbox :label="langStore.t('pickUp')" />
              <el-checkbox :label="langStore.t('storeDelivery')" />
              <el-checkbox label="GoSend / GrabExpress" />
            </el-checkbox-group>
          </el-form-item>
          <el-form-item :label="langStore.t('minOrder')">
            <el-input-number v-model="storeConfig.minOrder" :min="0" :step="10000" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 2. Mobile App Staff & Customer -->
      <el-tab-pane :label="langStore.t('tabMobileApp')" name="mobile-app">
        <div class="app-status-box mt-4">
          <div class="a-info">
            <div class="a-title">{{ langStore.t('mobileAppTitle') }}</div>
            <span>{{ langStore.t('mobileAppStatus') }}</span>
          </div>
          <el-button type="success" size="small">{{ langStore.t('generateApk') }}</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';

const langStore = useLangStore();
const activeTab = ref('website');

const storeConfig = reactive({
  onlineActive: true,
  domain: 'bien-resto.pos-store.id',
  deliveryOptions: ['Ambil di Tempat (Pick Up)', 'Kurir Toko (Delivery)'],
  minOrder: 20000
});

const saveConfig = () => {
  ElNotification({ title: langStore.t('onlineStoreSettingsTitle'), message: langStore.currentLang === 'id' ? 'Pengaturan web toko online berhasil disimpan!' : 'Online store web settings saved successfully!', type: 'success' });
};
</script>

<style scoped>
.online-store-config-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.app-status-box {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.a-title { font-size: 15px; font-weight: bold; color: #1890ff; }
.mt-4 { margin-top: 16px; }
</style>
