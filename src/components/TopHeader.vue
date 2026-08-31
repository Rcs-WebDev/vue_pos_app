<template>
  <div class="top-header">
    <div class="left-section">
      <el-button 
        class="toggle-btn" 
        type="text" 
        :icon="isCollapsed ? Expand : Fold" 
        @click="$emit('toggle-sidebar')"
      />
      <div class="brand-logo" @click="$router.push('/')">
        <el-icon class="brand-icon"><Shop /></el-icon>
        <span class="brand-name">BIEN POS</span>
      </div>
      <div class="page-title">
        <span class="title-main">{{ currentTitle }}</span>
      </div>
    </div>

    <div class="right-section">
      <!-- Search input -->
      <div class="header-search">
        <el-input
          v-model="searchKey"
          :placeholder="langStore.t('searchPlaceholder')"
          :prefix-icon="Search"
          size="default"
          clearable
        />
      </div>

      <!-- Action Icons -->
      <div class="action-icons">
        <el-tooltip :content="langStore.t('promoAndRewards')" placement="bottom">
          <div class="icon-item" @click="isPromoDrawerOpen = true"><el-icon><Present /></el-icon></div>
        </el-tooltip>
        <el-tooltip :content="langStore.t('shoppingCart')" placement="bottom">
          <div class="icon-item" @click="$router.push('/cashier')"><el-icon><ShoppingBag /></el-icon></div>
        </el-tooltip>
        <el-tooltip :content="langStore.t('orderNotifications')" placement="bottom">
          <div class="icon-item badge-item" @click="isNotifDrawerOpen = true">
            <el-badge :value="3" class="item">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </div>
        </el-tooltip>
      </div>

      <!-- Language Switcher Dropdown in Navbar -->
      <el-dropdown trigger="click" @command="handleLangChange">
        <div class="lang-switcher-badge">
          <el-icon class="globe-icon"><Connection /></el-icon>
          <span>{{ langStore.currentLang === 'id' ? 'ID 🇮🇩' : 'EN 🇬🇧' }}</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="id">🇮🇩 {{ langStore.t('indonesian') }}</el-dropdown-item>
            <el-dropdown-item command="en">🇬🇧 {{ langStore.t('english') }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- User Profile Badge -->
      <el-dropdown trigger="click">
        <div class="user-profile-badge">
          <el-icon class="user-icon"><User /></el-icon>
          <span class="profile-name">{{ authStore.currentRole }}</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$router.push('/settings')">{{ langStore.t('storeProfile') }}</el-dropdown-item>
            <el-dropdown-item @click="openSettingsModal">{{ langStore.t('cashierSettings') }}</el-dropdown-item>
            <el-dropdown-item @click="openShiftCloseModal">{{ langStore.t('logoutShiftClose') }}</el-dropdown-item>
            <el-dropdown-item divided style="color: #ef4444; font-weight: bold;" @click="handleLogout">
              {{ langStore.currentLang === 'en' ? 'Logout' : 'Keluar / Logout' }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- Notification Drawer -->
    <el-drawer v-model="isNotifDrawerOpen" :title="langStore.t('orderNotifications')" size="360px">
      <div class="notif-list">
        <div class="notif-card pos-card mb-2">
          <div class="n-head text-blue font-bold">Stok Hampir Habis!</div>
          <div class="n-body font-12">Produk <strong>Baso Aci Kuah Pedas</strong> tersisa 15 porsi. Silakan lakukan restok.</div>
          <div class="n-time font-10 text-gray">Baru saja</div>
        </div>
        <div class="notif-card pos-card mb-2">
          <div class="n-head text-green font-bold">Transaksi Berhasil</div>
          <div class="n-body font-12">Transaksi #8FC126081500000002 QRIS BCA sebesar Rp 43.000 sukses.</div>
          <div class="n-time font-10 text-gray">10 menit yang lalu</div>
        </div>
      </div>
    </el-drawer>

    <!-- Shift Closing & Commission Modal -->
    <el-dialog v-model="isShiftModalOpen" title="Penutupan Shift Kasir & Audit Komisi" width="500px">
      <div class="shift-closing-summary" v-if="closingPreview">
        <el-alert title="Informasi Penutupan Tugas & Pelacakan Komisi" type="warning" show-icon :closable="false" class="mb-3" />
        <div class="sc-row"><span>Nama Kasir:</span><strong>{{ closingPreview.employee_name }}</strong></div>
        <div class="sc-row"><span>No. Shift:</span><strong class="text-blue">{{ closingPreview.shift_no }}</strong></div>
        <div class="sc-row"><span>Total Penjualan Shift:</span><strong class="text-green font-18">Rp {{ formatNumber(closingPreview.total_sales) }}</strong></div>
        <div class="sc-row"><span>Komisi Terakumulasi ({{ authStore.commissionRate }}%):</span><strong class="text-green font-18">Rp {{ formatNumber(closingPreview.commission_earned) }}</strong></div>
        <el-form-item label="Catatan Serah Terima / Ganti Shift" class="mt-3">
          <el-input v-model="shiftNotes" type="textarea" placeholder="Misal: Sisa kas laci Rp 500.000, serah terima ke Riky" />
        </el-form-item>
      </div>
      <template #footer>
        <el-button @click="isShiftModalOpen = false">Batal</el-button>
        <el-button type="danger" @click="confirmShiftClose">Konfirmasi Shift & Logout</el-button>
      </template>
    </el-dialog>

    <!-- Settings Modal -->
    <el-dialog v-model="isSettingsModalOpen" :title="langStore.t('cashierSettings')" width="480px">
      <el-form label-width="170px">
        <el-form-item label="Nama Kasir Aktif">
          <el-input v-model="posStore.cashierName" />
        </el-form-item>
        <el-form-item label="Mode Cetak Struk">
          <el-select v-model="printMode" style="width: 100%;">
            <el-option label="Cetak Otomatis Thermal 80mm" value="auto80" />
            <el-option label="Cetak Otomatis Thermal 58mm" value="auto58" />
            <el-option label="Konfirmasi Manual" value="manual" />
          </el-select>
        </el-form-item>

        <!-- Commission Rate Field Protected by Role -->
        <el-form-item :label="langStore.t('commissionRateLabel')">
          <el-input-number 
            v-model="commissionRate" 
            :min="1" 
            :max="50" 
            :disabled="!authStore.canEditCommission" 
          />
        </el-form-item>
        
        <el-alert
          v-if="!authStore.canEditCommission"
          :title="langStore.t('commissionRestrictedWarning')"
          type="warning"
          show-icon
          :closable="false"
          style="margin-bottom: 12px;"
        />
      </el-form>

      <template #footer>
        <el-button @click="isSettingsModalOpen = false">Batal</el-button>
        <el-button type="primary" @click="saveSettings">{{ langStore.t('saveSettings') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePosStore } from '@/stores/posStore';
import { useAuthStore } from '@/stores/authStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import {
  Fold,
  Expand,
  Search,
  Present,
  ShoppingBag,
  Bell,
  CaretBottom,
  Shop,
  Connection,
  User
} from '@element-plus/icons-vue';

defineProps({
  isCollapsed: Boolean
});

defineEmits(['toggle-sidebar']);

const posStore = usePosStore();
const authStore = useAuthStore();
const langStore = useLangStore();
const router = useRouter();
const route = useRoute();

const searchKey = ref('');
const isNotifDrawerOpen = ref(false);
const isPromoDrawerOpen = ref(false);
const isShiftModalOpen = ref(false);
const isSettingsModalOpen = ref(false);
const closingPreview = ref(null);
const shiftNotes = ref('');
const printMode = ref('auto80');
const commissionRate = ref(authStore.commissionRate);

const handleLangChange = (lang) => {
  langStore.setLanguage(lang);
  ElNotification({
    title: 'Bahasa / Language',
    message: lang === 'id' ? 'Bahasa diubah ke Bahasa Indonesia' : 'Language switched to English',
    type: 'info'
  });
};

const openSettingsModal = () => {
  commissionRate.value = authStore.commissionRate;
  isSettingsModalOpen.value = true;
};

const saveSettings = () => {
  if (authStore.canEditCommission) {
    authStore.setCommissionRate(commissionRate.value);
  }
  isSettingsModalOpen.value = false;
  ElNotification({
    title: langStore.t('cashierSettings'),
    message: 'Pengaturan kasir berhasil disimpan!',
    type: 'success'
  });
};

const handleLogout = () => {
  authStore.logout();
  ElNotification({
    title: 'Logout',
    message: 'Anda telah keluar dari aplikasi POS.',
    type: 'info'
  });
  router.push('/login');
};

const currentTitle = computed(() => {
  switch (route.path) {
    case '/cashier': return langStore.t('cashier');
    case '/products': return langStore.t('productCatalog');
    case '/inventory': return langStore.t('inventoryAndStock');
    case '/dashboard': return langStore.t('dashboard');
    case '/reports': return langStore.t('reportsBookkeeping');
    case '/employees': return langStore.t('employees');
    case '/settings': return langStore.t('systemSettings');
    default: return 'Bien Point of Sale';
  }
});

const formatNumber = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

const openShiftCloseModal = async () => {
  closingPreview.value = await posStore.closeShiftAndTrackCommission('Penutupan Shift');
  isShiftModalOpen.value = true;
};

const confirmShiftClose = () => {
  isShiftModalOpen.value = false;
  handleLogout();
};
</script>

<style scoped>
.top-header {
  height: 64px;
  background-color: #ffffff;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid #e2e8f0;
  z-index: 90;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toggle-btn {
  color: #475569 !important;
  font-size: 22px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-right: 8px;
}

.brand-icon {
  font-size: 26px;
  color: #2563eb;
}

.brand-name {
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.5px;
  color: #1e1b4b;
}

.page-title {
  font-weight: 600;
  font-size: 15px;
  color: #64748b;
}

@media (max-width: 768px) {
  .top-header-container {
    padding: 0 10px !important;
    height: 56px !important;
  }

  .left-section {
    gap: 8px !important;
  }

  .brand-logo {
    gap: 6px !important;
    margin-right: 0 !important;
  }

  .brand-icon {
    font-size: 20px !important;
  }

  .brand-name {
    font-size: 15px !important;
    font-weight: 800 !important;
    line-height: 20px !important;
  }

  .page-title, .toggle-btn, .header-search, .badge-item {
    display: none !important;
  }

  .right-section {
    gap: 6px !important;
  }

  .lang-switcher-badge, .user-profile-badge {
    padding: 5px 8px !important;
    font-size: 12px !important;
    gap: 4px !important;
  }

  .profile-name {
    font-size: 11px !important;
    max-width: 70px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-search {
  width: 220px;
}

@media (max-width: 640px) {
  .header-search {
    display: none;
  }
}

:deep(.header-search .el-input__wrapper) {
  border-radius: 20px;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  box-shadow: none;
}

:deep(.header-search .el-input__inner) {
  color: #1e293b;
  font-size: 14px;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-item {
  font-size: 20px;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  transition: background 0.2s;
}

.icon-item:hover {
  background-color: #f1f5f9;
  color: #2563eb;
}

.lang-switcher-badge, .user-profile-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #eef2ff;
  border: 1px solid #e0e7ff;
  padding: 8px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  color: #1e1b4b;
  transition: background 0.2s, border-color 0.2s;
}

.lang-switcher-badge:hover, .user-profile-badge:hover {
  background-color: #dbeafe;
  border-color: #bfdbfe;
}

.globe-icon, .user-icon {
  font-size: 16px;
  color: #2563eb;
}

.profile-name {
  font-size: 13px;
  font-weight: 600;
}

.sc-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.text-blue { color: #2563eb; }
.text-green { color: #10b981; }
.font-18 { font-size: 18px; }
.font-bold { font-weight: bold; }
.mb-3 { margin-bottom: 12px; }
.mt-3 { margin-top: 12px; }
</style>
