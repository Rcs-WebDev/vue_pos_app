<template>
  <div class="online-sales-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('onlineSalesTitle') }}</h2>
      <el-tag type="success">{{ langStore.t('channelConnected') }}</el-tag>
    </div>

    <el-table :data="onlineOrders" style="width: 100%" stripe>
      <el-table-column prop="order_id" :label="langStore.t('webOrderNo')" width="160" />
      <el-table-column prop="channel" :label="langStore.t('channel')" width="130">
        <template #default="scope">
          <el-tag :type="scope.row.channel === 'Gofood' ? 'warning' : 'primary'">{{ scope.row.channel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="customer" :label="langStore.t('customerNameHeader')" width="150" />
      <el-table-column prop="items" :label="langStore.t('orderItems')" min-width="200" />
      <el-table-column prop="total" :label="langStore.t('totalAmountCol')" width="120" align="right" />
      <el-table-column prop="status" :label="langStore.t('statusLbl')" width="130" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLangStore } from '@/stores/langStore';

const langStore = useLangStore();

const onlineOrders = ref([
  { order_id: 'ONL-20260815-01', channel: 'Website POS', customer: 'Budi Santoso', items: '2x Baso Aci, 1x Es Teh', total: '31.000', status: 'Siap Diambil' },
  { order_id: 'ONL-20260815-02', channel: 'Gofood', customer: 'Rina Melati', items: '1x Ayam Goreng Sambal Ijo', total: '27.000', status: 'Diproses Dapur' }
]);
</script>

<style scoped>
.online-sales-page {
  padding: 20px;
}
.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
