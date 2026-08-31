<template>
  <div class="customers-master-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('customersTitle') }}</h2>
      <el-button type="primary" :icon="Plus" @click="openAddCustomerDialog">{{ langStore.t('addCustomerBtn') }}</el-button>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 1. Daftar Pelanggan & Loyalty Point -->
      <el-tab-pane :label="langStore.currentLang === 'en' ? 'Customer List & Loyalty Points' : 'Daftar Pelanggan & Loyalty Point'" name="customers">
        <div class="loyalty-header-box">
          <div class="sync-info">
            <el-icon class="blue-icon"><Connection /></el-icon>
            <span>{{ langStore.currentLang === 'en' ? 'Customer membership data synchronization active.' : 'Sinkronisasi data pelanggan (membership) antara toko & data loyalty point aktif.' }}</span>
          </div>
          <el-button type="success" size="small" :icon="Ticket">{{ langStore.currentLang === 'en' ? 'Manage Loyalty Program' : 'Kelola Program Loyalty Point' }}</el-button>
        </div>

        <el-table :data="customersList" style="width: 100%" stripe class="mt-4">
          <el-table-column prop="name" :label="langStore.t('customerNameCol')" min-width="160" font-weight="bold" />
          <el-table-column prop="phone" :label="langStore.t('phoneCol')" width="150" />
          <el-table-column prop="email" label="Email" width="180" />
          <el-table-column prop="points" :label="langStore.t('pointsCol')" width="130" align="right">
            <template #default="scope">
              <el-tag type="warning" effect="dark" round>{{ scope.row.points }} Pts</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="tier" :label="langStore.t('memberTierCol')" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.tier === 'Gold' ? 'danger' : 'primary'">{{ scope.row.tier }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="langStore.t('actionCol')" width="140" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" plain @click="redeemReward(scope.row)">{{ langStore.currentLang === 'en' ? 'Redeem Points' : 'Tukar Point' }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 2. Kepuasan Pelanggan -->
      <el-tab-pane :label="langStore.currentLang === 'en' ? 'Customer Satisfaction (Feedback)' : 'Kepuasan Pelanggan (Feedback)'" name="satisfaction">
        <div class="satisfaction-summary-card">
          <div class="rating-big-box">
            <span class="score">4.9</span>
            <el-rate v-model="avgRating" disabled text-color="#ff9900" />
            <span class="total-reviews">{{ langStore.currentLang === 'en' ? 'Based on 128 Reviews' : 'Berdasarkan 128 Feedback Ulasan' }}</span>
          </div>

          <div class="emoji-breakdown">
            <div class="emoji-box">
              <span class="emoji font-24">😍</span>
              <span class="count">85 Sangat Puas</span>
            </div>
            <div class="emoji-box">
              <span class="emoji font-24">😃</span>
              <span class="count">32 Puas</span>
            </div>
            <div class="emoji-box">
              <span class="emoji font-24">😐</span>
              <span class="count">8 Cukup</span>
            </div>
            <div class="emoji-box">
              <span class="emoji font-24">😔</span>
              <span class="count">3 Perlu Perbaikan</span>
            </div>
          </div>
        </div>

        <el-table :data="feedbackList" style="width: 100%" stripe class="mt-4">
          <el-table-column prop="date" label="Tanggal & Waktu" width="160" />
          <el-table-column prop="customer" label="Pelanggan" width="150" font-weight="bold" />
          <el-table-column prop="rating" label="Rating" width="150">
            <template #default="scope">
              <el-rate v-model="scope.row.rating" disabled />
            </template>
          </el-table-column>
          <el-table-column prop="emoji" label="Kepuasan" width="100">
            <template #default="scope">
              <span class="font-20">{{ scope.row.emoji }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="comment" label="Pesan Ulasan & Catatan" min-width="220" />
        </el-table>
      </el-tab-pane>

      <!-- 3. Daftar Supplier -->
      <el-tab-pane label="Daftar Pemasok / Supplier" name="suppliers">
        <el-table :data="suppliers" style="width: 100%" stripe>
          <el-table-column prop="name" label="Nama Perusahaan Supplier" min-width="180" font-weight="bold" />
          <el-table-column prop="phone" label="No. Telepon / WA" width="150" />
          <el-table-column prop="category" label="Kategori Pasokan" width="150" />
          <el-table-column prop="address" label="Alamat" min-width="200" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Dialog Tambah Pelanggan -->
    <el-dialog v-model="isAddCustomerOpen" title="Tambah Pelanggan Baru" width="450px">
      <el-form :model="newCust" label-width="120px">
        <el-form-item label="Nama Lengkap">
          <el-input v-model="newCust.name" placeholder="Misal: Ahmad Subagja" />
        </el-form-item>
        <el-form-item label="No. Handphone">
          <el-input v-model="newCust.phone" placeholder="0812..." />
        </el-form-item>
        <el-form-item label="Email">
          <el-input v-model="newCust.email" placeholder="ahmad@gmail.com" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isAddCustomerOpen = false">Batal</el-button>
        <el-button type="primary" @click="saveCustomer">Simpan Pelanggan</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLangStore } from '@/stores/langStore';
import { ElNotification, ElMessageBox } from 'element-plus';
import { Plus, Connection, Ticket } from '@element-plus/icons-vue';

const route = useRoute();
const langStore = useLangStore();
const activeTab = ref('customers');

const syncTab = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else if (route.path.includes('satisfaction')) {
    activeTab.value = 'satisfaction';
  } else if (route.path.includes('suppliers')) {
    activeTab.value = 'suppliers';
  } else {
    activeTab.value = 'customers';
  }
};

onMounted(syncTab);
watch(() => [route.path, route.query.tab], syncTab);
const avgRating = ref(4.9);
const isAddCustomerOpen = ref(false);

const newCust = reactive({
  name: '',
  phone: '',
  email: ''
});

const customersList = ref([
  { name: 'Ahmad Subagja', phone: '081233445566', email: 'ahmad@gmail.com', points: 350, tier: 'Gold' },
  { name: 'Diana Putri', phone: '081988776655', email: 'diana@gmail.com', points: 180, tier: 'Silver' },
  { name: 'Rudi Hermawan', phone: '081377889900', email: 'rudi@gmail.com', points: 90, tier: 'Bronze' }
]);

const feedbackList = ref([
  { date: '15-Aug-2026 14:10', customer: 'Ahmad Subagja', rating: 5, emoji: '😍', comment: 'Baso aci sangat lezat dan kuah pedas pas! Pelayanan kasir cepat.' },
  { date: '15-Aug-2026 13:00', customer: 'Diana Putri', rating: 5, emoji: '😃', comment: 'Kopi susu gula aren juara. Tempat bersih dan nyaman.' },
  { date: '14-Aug-2026 19:30', customer: 'Rudi Hermawan', rating: 4, emoji: '😃', comment: 'Pelayanan ramah, respon pesan online cepat.' }
]);

const suppliers = ref([
  { name: 'PT Sumber Daging Nusantara', phone: '021-5554321', category: 'Bahan Baku Daging', address: 'Jl. Raya Industri No. 45 Jakarta' },
  { name: 'CV Kopi Nusantara Utama', phone: '081122334455', category: 'Biji Kopi & Gula', address: 'Bandung, Jawa Barat' }
]);

const openAddCustomerDialog = () => {
  isAddCustomerOpen.value = true;
};

const saveCustomer = () => {
  if (!newCust.name) {
    ElNotification({ title: 'Error', message: 'Nama pelanggan wajib diisi!', type: 'error' });
    return;
  }
  customersList.value.unshift({
    name: newCust.name,
    phone: newCust.phone || '-',
    email: newCust.email || '-',
    points: 50,
    tier: 'Bronze'
  });
  isAddCustomerOpen.value = false;
  ElNotification({ title: 'Pelanggan', message: 'Pelanggan baru berhasil didaftarkan dengan bonus 50 poin!', type: 'success' });
};

const redeemReward = (cust) => {
  ElMessageBox.confirm(`Tukarkan 100 poin ${cust.name} dengan Voucher Diskon Rp 10.000?`, 'Penukaran Point Reward', {
    confirmButtonText: 'Tukarkan Poin',
    cancelButtonText: 'Batal',
    type: 'warning'
  }).then(() => {
    cust.points = Math.max(0, cust.points - 100);
    ElNotification({ title: 'Point Reward', message: 'Voucher diskon Rp 10.000 berhasil ditukarkan!', type: 'success' });
  }).catch(() => {});
};
</script>

<style scoped>
.customers-master-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.loyalty-header-box {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sync-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #0050b3;
}

.blue-icon {
  font-size: 18px;
  color: #1890ff;
}

.satisfaction-summary-card {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rating-big-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rating-big-box .score {
  font-size: 36px;
  font-weight: 800;
  color: #ff9900;
}

.total-reviews {
  font-size: 12px;
  color: #8c8c8c;
}

.emoji-breakdown {
  display: flex;
  gap: 20px;
}

.emoji-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
}

.font-24 { font-size: 24px; }
.font-20 { font-size: 20px; }
.mt-4 { margin-top: 16px; }
</style>
