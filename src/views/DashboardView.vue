<template>
  <div class="dashboard-page">
    <!-- Top Stat Cards -->
    <div class="metrics-grid">
      <div class="metric-card pos-card clickable" @click="$router.push('/reports')">
        <div class="metric-icon blue"><el-icon><Money /></el-icon></div>
        <div class="metric-info">
          <span class="metric-label">{{ langStore.t('todaySales') }}</span>
          <span class="metric-value">{{ formatRp(todaySalesAmount) }}</span>
          <span class="metric-sub green">{{ langStore.t('realtimePos') }}</span>
        </div>
      </div>

      <div class="metric-card pos-card clickable" @click="$router.push('/reports')">
        <div class="metric-icon green"><el-icon><ShoppingCart /></el-icon></div>
        <div class="metric-info">
          <span class="metric-label">{{ langStore.t('totalTx') }}</span>
          <span class="metric-value">{{ todayTxCount }} {{ langStore.t('ordersCount') }}</span>
          <span class="metric-sub">{{ langStore.t('avgPerTx') }} {{ formatRp(avgTxAmount) }}/tx</span>
        </div>
      </div>

      <div class="metric-card pos-card clickable" @click="$router.push('/inventory')">
        <div class="metric-icon orange"><el-icon><Box /></el-icon></div>
        <div class="metric-info">
          <span class="metric-label">{{ langStore.t('lowStockTitle') }}</span>
          <span class="metric-value">{{ lowStockProducts.length }} {{ langStore.t('itemsCount') }}</span>
          <span class="metric-sub orange">{{ langStore.t('needRestock') }}</span>
        </div>
      </div>

      <div class="metric-card pos-card clickable" @click="$router.push('/customers')">
        <div class="metric-icon purple"><el-icon><User /></el-icon></div>
        <div class="metric-info">
          <span class="metric-label">{{ langStore.t('newCustomersTitle') }}</span>
          <span class="metric-value">12 {{ langStore.t('peopleCount') }}</span>
          <span class="metric-sub green">{{ langStore.t('registeredMember') }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Shortcuts & Recent Activity Grid -->
    <div class="dashboard-content-grid">
      <!-- Quick Action Buttons -->
      <div class="quick-actions-card pos-card">
        <div class="card-header">{{ langStore.t('quickActionsTitle') }}</div>
        <div class="actions-buttons-grid">
          <el-button class="card-cashier" type="primary" size="large" :icon="ShoppingCart" @click="$router.push('/cashier')">
            {{ langStore.t('openPosBtn') }}
          </el-button>
          <el-button type="success" size="large" :icon="Plus" @click="$router.push('/products')">
            {{ langStore.t('addProduct') }}
          </el-button>
          <el-button type="warning" size="large" :icon="Document" @click="$router.push('/reports')">
            {{ langStore.t('reportsTitle') }}
          </el-button>
          <el-button type="info" size="large" :icon="User" @click="$router.push('/employees')">
            {{ langStore.t('employees') }}
          </el-button>
        </div>
      </div>

      <!-- Top Selling Products -->
      <div class="top-products-card pos-card">
        <div class="card-header">{{ langStore.t('topSellingTitle') }}</div>
        <div class="top-list">
          <div class="top-item" v-for="(prod, idx) in productStore.products.slice(0, 3)" :key="prod.id">
            <span class="rank font-bold">{{ idx + 1 }}</span>
            <span class="title">{{ prod.name }}</span>
            <span class="qty">{{ langStore.t('stockQty') }}: {{ prod.stock_qty }}</span>
            <span class="total">{{ formatRp(prod.sell_price) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { usePosStore } from '@/stores/posStore';
import { useProductStore } from '@/stores/productStore';
import { useLangStore } from '@/stores/langStore';
import {
  Money,
  ShoppingCart,
  Box,
  User,
  Plus,
  Document
} from '@element-plus/icons-vue';

const posStore = usePosStore();
const productStore = useProductStore();
const langStore = useLangStore();

onMounted(() => {
  posStore.initDefaultHistory();
  productStore.fetchProducts();
});

const todayStr = new Date().toISOString().slice(0, 10);

const todayTransactions = computed(() => {
  return posStore.transactionsHistory.filter(tx => tx.date_str === todayStr || tx.created_at?.includes(todayStr));
});

const todaySalesAmount = computed(() => {
  return todayTransactions.value.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
});

const todayTxCount = computed(() => todayTransactions.value.length);

const avgTxAmount = computed(() => {
  if (todayTxCount.value === 0) return 0;
  return Math.round(todaySalesAmount.value / todayTxCount.value);
});

const lowStockProducts = computed(() => {
  return productStore.products.filter(p => p.stock_qty <= 100);
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.metric-card {
  padding: 20px 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-radius: 14px;
}

.metric-card.clickable {
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
}

.metric-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.metric-icon.blue { background: linear-gradient(135deg, #2563eb, #3b82f6); }
.metric-icon.green { background: linear-gradient(135deg, #10b981, #059669); }
.metric-icon.orange { background: linear-gradient(135deg, #f97316, #ea580c); }
.metric-icon.purple { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.metric-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.metric-value {
  font-size: 24px;
  font-weight: 800;
  color: #1e1b4b;
  letter-spacing: -0.5px;
}

.metric-sub {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.metric-sub.green { color: #10b981; }
.metric-sub.orange { color: #f97316; }

.dashboard-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .dashboard-content-grid {
    grid-template-columns: 1fr;
  }

  .actions-buttons-grid {
    grid-template-columns: 1fr !important;
  }
}

.quick-actions-card, .top-products-card {
  padding: 22px;
}

.card-header {
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
  color: #1e1b4b;
}

.actions-buttons-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.card-cashier {
    margin-left: 12px;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
}

.top-item .rank {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  margin-right: 14px;
}

.top-item .title {
  flex: 1;
  font-weight: 700;
  color: #1e293b;
}

.top-item .qty {
  margin-right: 18px;
  color: #64748b;
  font-weight: 600;
  font-size: 13px;
}

.top-item .total {
  font-weight: 800;
  color: #2563eb;
  font-size: 16px;
}
</style>
