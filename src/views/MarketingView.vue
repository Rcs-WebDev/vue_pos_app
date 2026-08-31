<template>
  <div class="marketing-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('marketingTitle') }}</h2>
      <el-button type="primary">{{ langStore.t('addPromo') }}</el-button>
    </div>

    <el-table :data="promos" style="width: 100%" stripe>
      <el-table-column prop="code" :label="langStore.t('voucherCode')" width="140" font-weight="bold" />
      <el-table-column prop="name" :label="langStore.t('promoName')" min-width="180" />
      <el-table-column prop="discount" :label="langStore.t('discountVal')" width="140" />
      <el-table-column prop="period" :label="langStore.t('validPeriod')" width="200" />
      <el-table-column prop="status" :label="langStore.t('statusLbl')" width="110">
        <template #default="scope">
          <el-tag type="success">{{ langStore.currentLang === 'en' && scope.row.status === 'Aktif' ? 'Active' : scope.row.status }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLangStore } from '@/stores/langStore';

const langStore = useLangStore();

const promos = ref([
  { code: 'BIEN50K', name: 'Promo Merdeka Diskon 10%', discount: '10%', period: '01 Aug - 31 Aug 2026', status: 'Aktif' },
  { code: 'KOPIJUMAT', name: 'Jumat Berkah Beli 1 Gratis 1', discount: 'Buy 1 Get 1', period: 'Tiap Jumat', status: 'Aktif' }
]);
</script>

<style scoped>
.marketing-page {
  padding: 20px;
}
.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
