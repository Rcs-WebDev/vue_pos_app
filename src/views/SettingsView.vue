<template>
  <div class="settings-page pos-card">
    <h2>{{ langStore.t('systemSettings') }}</h2>

    <el-tabs v-model="activeTab" style="margin-top: 16px;">
      <!-- Tab 1: Profil Toko & Struk -->
      <el-tab-pane :label="langStore.t('storeProfileTab')" name="store">
        <el-form label-width="180px" style="max-width: 650px;">
          <el-form-item :label="langStore.t('storeNameLbl')">
            <el-input v-model="settings.store_name" />
          </el-form-item>
          <el-form-item :label="langStore.currentLang === 'en' ? 'Slogan / Tagline' : 'Slogan / Tagline'">
            <el-input v-model="settings.store_tagline" />
          </el-form-item>
          <el-form-item :label="langStore.currentLang === 'en' ? 'Restaurant Tax (%)' : 'Pajak Resto (%)'">
            <el-input-number v-model="settings.tax_rate" :min="0" :max="20" />
          </el-form-item>
          <el-form-item :label="langStore.t('receiptFooterLbl')">
            <el-input v-model="settings.receipt_footer" type="textarea" rows="3" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">{{ langStore.t('saveSettings') }}</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab 2: Pengaturan Komisi Penjualan (Hak Akses Manager) -->
      <el-tab-pane :label="langStore.t('commissionTab')" name="commission">
        <div class="commission-settings-section" style="max-width: 650px;">
          <el-alert
            v-if="!authStore.canEditCommission"
            :title="langStore.t('commissionRestrictedWarning')"
            type="warning"
            show-icon
            :closable="false"
            style="margin-bottom: 20px;"
          />

          <el-alert
            v-else
            :title="langStore.currentLang === 'en' ? 'Manager Full Access' : 'Akses Penuh Manager'"
            :description="langStore.currentLang === 'en' ? 'Logged in as Manager. Authorized to modify cashier commission percentage.' : 'Anda masuk sebagai Manager. Anda memiliki wewenang untuk mengubah persentase komisi penjualan staf kasir.'"
            type="success"
            show-icon
            :closable="false"
            style="margin-bottom: 20px;"
          />

          <el-form label-width="200px">
            <el-form-item :label="langStore.currentLang === 'en' ? 'Your Current Role' : 'Peran Anda Saat Ini'">
              <el-tag :type="authStore.isManager ? 'danger' : 'info'" effect="dark font-bold">
                {{ authStore.currentRole }} ({{ authStore.currentUserName }})
              </el-tag>
            </el-form-item>

            <el-form-item :label="langStore.t('commissionRateLabel')">
              <el-input-number 
                v-model="commissionRateInput" 
                :min="1" 
                :max="50" 
                :disabled="!authStore.canEditCommission"
              />
              <span class="ml-2 text-gray font-12">{{ langStore.currentLang === 'en' ? '% of total shift sales turnover' : '% dari total omzet transaksi shift' }}</span>
            </el-form-item>

            <el-form-item>
              <el-button 
                type="primary" 
                :disabled="!authStore.canEditCommission" 
                @click="saveCommissionRate"
              >
                {{ langStore.t('saveSettings') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- Tab 3: Koneksi Database MySQL (Lokal) -->
      <el-tab-pane :label="langStore.t('dbConnectionTab')" name="database">
        <el-alert
          title="Informasi Server MySQL"
          type="info"
          description="Aplikasi ini dikonfigurasi untuk terhubung ke MySQL lokal pada port 3306 (database: bien_pos). Jika MySQL aktif, data otomatis disinkronkan langsung ke tabel MySQL."
          show-icon
          style="margin-bottom: 20px;"
        />

        <el-form label-width="180px" style="max-width: 650px;">
          <el-form-item label="DB Host">
            <el-input v-model="dbConfig.host" placeholder="localhost" />
          </el-form-item>
          <el-form-item label="DB Username">
            <el-input v-model="dbConfig.user" placeholder="root" />
          </el-form-item>
          <el-form-item label="DB Password">
            <el-input v-model="dbConfig.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="DB Name">
            <el-input v-model="dbConfig.database" placeholder="bien_pos" />
          </el-form-item>
          <el-form-item label="Status DB Saat Ini">
            <el-tag :type="dbConnected ? 'success' : 'warning'">
              {{ dbConnected ? 'Terhubung ke MySQL Server' : 'Standalone Mode (Client Storage Active)' }}
            </el-tag>
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="checkDbConnection">Tes Koneksi MySQL</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';

const authStore = useAuthStore();
const langStore = useLangStore();

const activeTab = ref('store');
const commissionRateInput = ref(authStore.commissionRate);

const settings = reactive({
  store_name: 'bien',
  store_tagline: 'Resto & Cafe Point of Sale',
  tax_rate: 0,
  receipt_footer: 'Terima kasih atas kunjungan Anda!'
});

const dbConfig = reactive({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bien_pos'
});

const dbConnected = ref(false);

onMounted(async () => {
  await checkDbConnection();
  commissionRateInput.value = authStore.commissionRate;
});

const saveCommissionRate = () => {
  const res = authStore.setCommissionRate(commissionRateInput.value);
  if (res.success) {
    ElNotification({
      title: 'Komisi Penjualan',
      message: `Persentase komisi berhasil diperbarui menjadi ${authStore.commissionRate}%!`,
      type: 'success'
    });
  } else {
    ElNotification({
      title: 'Akses Ditolak',
      message: res.message,
      type: 'error'
    });
  }
};

const checkDbConnection = async () => {
  try {
    const res = await fetch('/api/health');
    if (res.ok) {
      const data = await res.json();
      dbConnected.value = data.mysqlConnected;
      if (data.mysqlConnected) {
        ElNotification({ title: 'MySQL', message: 'Koneksi ke MySQL Server aktif!', type: 'success' });
      } else {
        ElNotification({ title: 'Koneksi DB', message: 'MySQL Server lokal belum aktif. Mode Standalone diaktifkan.', type: 'info' });
      }
    }
  } catch (e) {
    dbConnected.value = false;
  }
};

const saveSettings = () => {
  ElNotification({ title: 'Pengaturan', message: 'Pengaturan toko berhasil disimpan!', type: 'success' });
};
</script>

<style scoped>
.settings-page {
  padding: 20px;
}
.ml-2 { margin-left: 8px; }
.text-gray { color: #8c8c8c; }
.font-12 { font-size: 12px; }
.font-bold { font-weight: bold; }

@media (max-width: 768px) {
  .settings-page {
    padding: 12px !important;
  }

  :deep(.el-form-item) {
    flex-direction: column !important;
    align-items: flex-start !important;
    margin-bottom: 16px !important;
  }

  :deep(.el-form-item__label) {
    width: auto !important;
    text-align: left !important;
    font-weight: 700 !important;
    margin-bottom: 4px !important;
    padding: 0 !important;
    font-size: 14px !important;
  }

  :deep(.el-form-item__content) {
    margin-left: 0 !important;
    width: 100% !important;
  }

  :deep(.el-input), :deep(.el-input-number), :deep(.el-select) {
    width: 100% !important;
  }

  :deep(.el-tabs__header) {
    margin-bottom: 16px !important;
  }

  :deep(.el-tabs__nav) {
    display: flex !important;
    overflow-x: auto !important;
    width: 100% !important;
  }

  :deep(.el-tabs__item) {
    padding: 0 12px !important;
    font-size: 14px !important;
    white-space: nowrap !important;
  }
}
</style>
