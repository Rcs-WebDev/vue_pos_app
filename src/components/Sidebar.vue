<template>
  <div class="sidebar-wrapper" :class="{ 'is-collapsed': isCollapsed }">
    <!-- Store Info Header -->
    <div class="sidebar-header">
      <div class="avatar-circle">{{ authStore.currentUserName[0]?.toLowerCase() || 'b' }}</div>
      <div class="store-info" v-if="!isCollapsed">
        <span class="store-name">{{ authStore.currentUserName }}</span>
        <span class="store-role">{{ authStore.currentRole }}</span>
      </div>
    </div>

    <!-- Navigation Menu (Desktop & Tablet) -->
    <el-scrollbar class="menu-scrollbar desktop-menu-only">
      <el-menu
        :default-active="activePath"
        class="sidebar-menu"
        :collapse="isCollapsed"
        router
        :unique-opened="true"
      >
        <!-- 1. Dasbor -->
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>{{ langStore.t('dashboard') }}</template>
        </el-menu-item>

        <!-- 2. Transaksi & Kasir (POS) -->
        <el-menu-item index="/cashier">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>{{ langStore.t('cashier') }}</template>
        </el-menu-item>

        <!-- 3. Kas Masuk-Keluar -->
        <el-menu-item index="/cash-flow">
          <el-icon><Money /></el-icon>
          <template #title>{{ langStore.t('cashInOut') }}</template>
        </el-menu-item>

        <!-- 4. Produk & Katalog -->
        <el-sub-menu index="products-group">
          <template #title>
            <el-icon><Box /></el-icon>
            <span>{{ langStore.t('productCatalog') }}</span>
          </template>
          <el-menu-item index="/products">{{ langStore.t('productList') }}</el-menu-item>
          <el-menu-item index="/products/special-types">{{ langStore.t('specialTypes') }}</el-menu-item>
          <el-menu-item index="/products/print-barcode">{{ langStore.t('printBarcode') }}</el-menu-item>
          <el-menu-item index="/products/print-label">{{ langStore.t('printLabel') }}</el-menu-item>
        </el-sub-menu>

        <!-- 5. Inventori -->
        <el-sub-menu index="inventory-group">
          <template #title>
            <el-icon><List /></el-icon>
            <span>{{ langStore.t('inventoryAndStock') }}</span>
          </template>
          <el-menu-item index="/inventory">{{ langStore.t('stockInOut') }}</el-menu-item>
          <el-menu-item index="/inventory/franchise">{{ langStore.t('franchiseDashboard') }}</el-menu-item>
        </el-sub-menu>

        <!-- 6. Marketing -->
        <el-sub-menu index="marketing-group">
          <template #title>
            <el-icon><Discount /></el-icon>
            <span>{{ langStore.t('marketing') }}</span>
          </template>
          <el-menu-item index="/customers">{{ langStore.t('customerManagement') }}</el-menu-item>
          <el-menu-item index="/customers?tab=satisfaction">{{ langStore.t('customerSatisfaction') }}</el-menu-item>
          <el-menu-item index="/marketing">{{ langStore.t('discountsPromos') }}</el-menu-item>
          <el-menu-item index="/suppliers">{{ langStore.t('supplierList') }}</el-menu-item>
        </el-sub-menu>

        <!-- 7. Karyawan -->
        <el-sub-menu index="karyawan-group">
          <template #title>
            <el-icon><UserFilled /></el-icon>
            <span>{{ langStore.t('employees') }}</span>
          </template>
          <el-menu-item index="/attendance">{{ langStore.t('attendance') }}</el-menu-item>
          <el-menu-item index="/employees?tab=permissions">{{ langStore.t('employeePermissions') }}</el-menu-item>
          <el-menu-item index="/employees?tab=commission">{{ langStore.t('salesCommission') }}</el-menu-item>
          <el-menu-item index="/employees?tab=logs">{{ langStore.t('employeeLogs') }}</el-menu-item>
          <el-menu-item index="/employees?tab=schedule">{{ langStore.t('employeeSchedule') }}</el-menu-item>
        </el-sub-menu>

        <!-- 8. Insight & AI Analytics -->
        <el-sub-menu index="insight-group">
          <template #title>
            <el-icon><Cpu /></el-icon>
            <span>{{ langStore.t('insightsAi') }}</span>
          </template>
          <el-menu-item index="/insights/recommendations">{{ langStore.t('salesRecommendations') }}</el-menu-item>
          <el-menu-item index="/insights/predictive">{{ langStore.t('stockPredictive') }}</el-menu-item>
          <el-menu-item index="/insights/analytics">{{ langStore.t('performanceAnalytics') }}</el-menu-item>
        </el-sub-menu>

        <!-- 9. Laporan Penutupan & Pembukuan -->
        <el-sub-menu index="reports-group">
          <template #title>
            <el-icon><TrendCharts /></el-icon>
            <span>{{ langStore.t('reportsBookkeeping') }}</span>
          </template>
          <el-menu-item index="/reports">{{ langStore.t('closingReports') }}</el-menu-item>
          <el-menu-item index="/transactions">{{ langStore.t('transactionLogs') }}</el-menu-item>
          <el-menu-item index="/reports/financial">{{ langStore.t('profitLossSummary') }}</el-menu-item>
        </el-sub-menu>

        <!-- 10. Lainnya -->
        <el-sub-menu index="lainnya-group">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>{{ langStore.t('others') }}</span>
          </template>
          <el-menu-item index="/online-sales">{{ langStore.t('onlineOrder') }}</el-menu-item>
          <el-menu-item index="/payment-methods">{{ langStore.t('qrPayment') }}</el-menu-item>
          <el-menu-item index="/online-sales/settings">{{ langStore.t('onlineStoreSettings') }}</el-menu-item>
          <el-menu-item index="/gotyme">{{ langStore.t('storeFunding') }}</el-menu-item>
          <el-menu-item index="/partnerships">{{ langStore.t('storeMonitoring') }}</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>{{ langStore.t('systemSettings') }}</template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>

    <!-- Mobile Bottom Navigation Bar (Visible only on mobile screens < 768px) -->
    <div class="mobile-bottom-bar">
      <div class="m-nav-item" :class="{ active: route.path === '/dashboard' }" @click="$router.push('/dashboard')">
        <el-icon><Odometer /></el-icon>
        <span>{{ langStore.currentLang === 'id' ? 'Dasbor' : 'Dashboard' }}</span>
      </div>
      <div class="m-nav-item" :class="{ active: route.path === '/cashier' || route.path === '/' }" @click="$router.push('/cashier')">
        <el-icon><ShoppingCart /></el-icon>
        <span>{{ langStore.currentLang === 'id' ? 'Kasir' : 'Cashier' }}</span>
      </div>
      <div class="m-nav-item" :class="{ active: route.path.includes('/products') }" @click="$router.push('/products')">
        <el-icon><Box /></el-icon>
        <span>{{ langStore.currentLang === 'id' ? 'Produk' : 'Products' }}</span>
      </div>
      <div class="m-nav-item" :class="{ active: route.path.includes('/reports') }" @click="$router.push('/reports')">
        <el-icon><TrendCharts /></el-icon>
        <span>{{ langStore.currentLang === 'id' ? 'Laporan' : 'Reports' }}</span>
      </div>
      <div class="m-nav-item" :class="{ active: route.path === '/settings' }" @click="$router.push('/settings')">
        <el-icon><Setting /></el-icon>
        <span>{{ langStore.currentLang === 'id' ? 'Setting' : 'Settings' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useLangStore } from '@/stores/langStore';
import {
  Odometer,
  ShoppingCart,
  Money,
  Box,
  List,
  Discount,
  UserFilled,
  Cpu,
  TrendCharts,
  Grid,
  Setting
} from '@element-plus/icons-vue';

defineProps({
  isCollapsed: Boolean
});

const authStore = useAuthStore();
const langStore = useLangStore();
const route = useRoute();

const activePath = computed(() => {
  if (route.query && Object.keys(route.query).length > 0) {
    return route.fullPath;
  }
  return route.path;
});
</script>

<style scoped>
.sidebar-wrapper {
  width: 240px;
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
}

.sidebar-wrapper.is-collapsed {
  width: 76px;
}

.sidebar-header {
  height: 64px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 16px;
  flex-shrink: 0;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.store-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.store-name {
  font-weight: 700;
  font-size: 15px;
  color: #1e1b4b;
}

.store-role {
  font-size: 12px;
  color: #64748b;
}

.menu-scrollbar {
  flex: 1;
}

.sidebar-menu {
  border-right: none;
}

:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  font-size: 14px !important;
  font-weight: 600 !important;
  height: 48px !important;
  line-height: 48px !important;
  color: #475569 !important;
  margin: 4px 8px !important;
  border-radius: 10px !important;
  display: flex !important;
  align-items: center !important;
  padding-right: 34px !important;
}

:deep(.el-sub-menu__title span), :deep(.el-menu-item span) {
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
  flex: 1 !important;
}

:deep(.el-sub-menu__icon-arrow) {
  right: 12px !important;
  font-size: 14px !important;
  font-weight: bold !important;
}

:deep(.el-menu-item .el-icon), :deep(.el-sub-menu__title .el-icon) {
  font-size: 20px !important;
  margin-right: 10px !important;
  color: #64748b !important;
  flex-shrink: 0 !important;
}

:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  background-color: #f1f5f9 !important;
  color: #1e293b !important;
}

.mobile-bottom-bar {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-wrapper {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100vw !important;
    height: 64px !important;
    flex-direction: row;
    border-right: none;
    border-top: 1px solid #e2e8f0;
    background-color: #ffffff;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    z-index: 999;
  }

  .sidebar-header {
    display: none;
  }

  .desktop-menu-only {
    display: none !important;
  }

  .mobile-bottom-bar {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: space-around;
    padding: 0 6px;
  }

  .m-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: 100%;
    color: #64748b;
    cursor: pointer;
    transition: color 0.2s;
  }

  .m-nav-item span {
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 64px;
  }

  .m-nav-item .el-icon {
    font-size: 22px;
  }

  .m-nav-item:hover, .m-nav-item.active {
    color: #2563eb;
  }
}
</style>
