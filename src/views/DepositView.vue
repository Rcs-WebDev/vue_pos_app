<template>
  <div class="deposit-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('depositTitle') }}</h2>
      <el-button type="primary" :icon="Plus" @click="openAddDepositModal">{{ langStore.t('topUpDepositBtn') }}</el-button>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 1. Saldo Deposit Pelanggan -->
      <el-tab-pane :label="langStore.t('tabCustDeposit')" name="customer-deposit">
        <el-table :data="depositAccounts" style="width: 100%" stripe>
          <el-table-column prop="custName" :label="langStore.t('customerNameCol')" min-width="160" font-weight="bold" />
          <el-table-column prop="phone" :label="langStore.t('phoneCol')" width="150" />
          <el-table-column prop="balance" label="Saldo Deposit (Rp)" width="160" align="right">
            <template #default="scope">
              <span class="text-green font-bold">{{ formatRp(scope.row.balance) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="lastUsed" :label="langStore.t('lastUsed')" width="160" />
          <el-table-column :label="langStore.t('actions')" width="160" align="center">
            <template #default="scope">
              <el-button size="small" type="success" plain @click="topUp(scope.row)">Top Up</el-button>
              <el-button size="small" type="primary" plain @click="history(scope.row)">{{ langStore.t('history') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 2. Tipe Spesial Produk -->
      <el-tab-pane :label="langStore.t('tabSpecialTypes')" name="special-types">
        <div class="special-types-header">
          <span>{{ langStore.t('manageSpecialTypesHint') }}</span>
          <el-button type="success" size="small" :icon="Plus">{{ langStore.t('addSpecialType') }}</el-button>
        </div>

        <el-table :data="specialTypes" style="width: 100%" stripe class="mt-4">
          <el-table-column prop="name" :label="langStore.t('modifierName')" min-width="160" font-weight="bold" />
          <el-table-column prop="options" :label="langStore.t('variantOptions')" min-width="220" />
          <el-table-column prop="extraPrice" :label="langStore.t('extraFee')" width="140" align="right">
            <template #default="scope">
              <span>+ {{ formatRp(scope.row.extraPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="appliedProducts" :label="langStore.t('appliedTo')" min-width="180" />
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- Top Up Modal -->
    <el-dialog v-model="isTopUpOpen" :title="langStore.t('topUpModalTitle')" width="420px">
      <el-form label-width="140px">
        <el-form-item :label="langStore.t('customer')">
          <el-select v-model="selectedCust" :placeholder="langStore.t('selectCustomer')" style="width: 100%;">
            <el-option v-for="c in depositAccounts" :key="c.custName" :label="c.custName" :value="c.custName" />
          </el-select>
        </el-form-item>
        <el-form-item :label="langStore.t('topUpAmount')">
          <el-input-number v-model="topUpAmount" :min="10000" :step="50000" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isTopUpOpen = false">{{ langStore.t('cancel') }}</el-button>
        <el-button type="success" @click="confirmTopUp">{{ langStore.t('confirmTopUp') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';

const langStore = useLangStore();
const activeTab = ref('customer-deposit');
const isTopUpOpen = ref(false);
const selectedCust = ref('Ahmad Subagja');
const topUpAmount = ref(100000);

const depositAccounts = ref([
  { custName: 'Ahmad Subagja', phone: '081233445566', balance: 450000, lastUsed: '15-Aug-2026 12:10' },
  { custName: 'Diana Putri', phone: '081988776655', balance: 200000, lastUsed: '14-Aug-2026 18:30' },
  { custName: 'Rudi Hermawan', phone: '081377889900', balance: 75000, lastUsed: '10-Aug-2026 09:45' }
]);

const specialTypes = ref([
  { name: 'Level Pedas Kuah', options: 'Level 1, Level 2, Level 3, Pedas Mampus', extraPrice: 2000, appliedProducts: 'Baso Aci, Mie Ayam' },
  { name: 'Extra Topping Telur', options: 'Telur Ceplok, Telur Dadar, Telur Rebus', extraPrice: 4000, appliedProducts: 'Nasi Goreng, Ayam Goreng' },
  { name: 'Opsi Es / Manis Kopi', options: 'Less Ice, Extra Shot, Normal Ice', extraPrice: 0, appliedProducts: 'Kopi Susu Gula Aren, Es Teh' }
]);

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const openAddDepositModal = () => {
  isTopUpOpen.value = true;
};

const topUp = (row) => {
  selectedCust.value = row.custName;
  isTopUpOpen.value = true;
};

const history = (row) => {
  ElNotification({ title: 'Deposit History', message: `Menampilkan riwayat deposit ${row.custName}`, type: 'info' });
};

const confirmTopUp = () => {
  const account = depositAccounts.value.find(a => a.custName === selectedCust.value);
  if (account) {
    account.balance += topUpAmount.value;
  }
  isTopUpOpen.value = false;
  ElNotification({ title: 'Top Up Deposit', message: `Top up Rp ${topUpAmount.value} berhasil ditambahkan!`, type: 'success' });
};
</script>

<style scoped>
.deposit-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.special-types-header {
  background-color: #fafafa;
  border: 1px solid #e8e8e8;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
}

.text-green { color: #52c41a; }
.font-bold { font-weight: bold; }
.mt-4 { margin-top: 16px; }
</style>
