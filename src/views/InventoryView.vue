<template>
  <div class="inventory-master-page">
    <!-- Sub-navigation Tabs (Image #5 Match) -->
    <div class="sub-tabs-bar">
      <div 
        v-for="tab in subTabs" 
        :key="tab.id"
        class="sub-tab-item"
        :class="{ active: activeSubTab === tab.id }"
        @click="activeSubTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- TAB 1: STOK MASUK -->
    <div class="inventory-card pos-card" v-if="activeSubTab === 'in'">
      <div class="filter-action-row">
        <div class="left-tools">
          <button class="icon-tool-btn"><el-icon><Setting /></el-icon></button>
          <el-button class="import-btn" size="default">Import</el-button>
          <el-input v-model="searchKey" :placeholder="langStore.t('searchProductPlaceholder')" :prefix-icon="Search" style="width: 320px;" clearable />
        </div>
        <div class="right-tools">
          <el-button type="success" :icon="Plus" @click="isAddStockInOpen = true">{{ langStore.t('addStockIn') }}</el-button>
        </div>
      </div>

      <el-table :data="filteredStockIn" style="width: 100%" stripe size="default">
        <el-table-column label="No." width="170" prop="no">
          <template #default="scope">
            <span class="tx-link-code">{{ scope.row.no }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="langStore.t('supplierName')" min-width="140" prop="supplier" />
        <el-table-column :label="langStore.t('dateCol')" width="140" prop="date" />
        <el-table-column :label="langStore.t('notesLbl')" min-width="160" prop="notes" />
        <el-table-column :label="langStore.t('receivedBy')" min-width="180" prop="received_by" />
        <el-table-column :label="langStore.t('statusLbl')" width="120" prop="status">
          <template #default="scope">
            <span class="status-pill" :class="scope.row.status.toLowerCase()">{{ scope.row.status }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Post laba rugi" width="110" align="center">
          <template #default="scope">
            <el-button v-if="scope.row.status === 'Posted'" type="primary" size="small" class="post-btn">Post</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-pagination-footer">
        <div class="page-size-selector">
          <el-select v-model="pageSize" size="small" style="width: 100px;">
            <el-option label="15 baris" :value="15" />
            <el-option label="30 baris" :value="30" />
          </el-select>
          <span class="total-text">Total {{ stockInRecords.length }} Data</span>
        </div>
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" layout="prev, pager, next" :total="stockInRecords.length" />
      </div>
    </div>

    <!-- TAB 2: STOK KELUAR -->
    <div class="inventory-card pos-card" v-else-if="activeSubTab === 'out'">
      <div class="filter-action-row">
        <div class="left-tools">
          <el-input v-model="searchKey" :placeholder="langStore.currentLang === 'en' ? 'Search Stock Out / Reason' : 'Cari Stok Keluar / Alasan'" :prefix-icon="Search" style="width: 320px;" clearable />
        </div>
        <div class="right-tools">
          <el-button type="warning" :icon="Plus" @click="isAddStockOutOpen = true">{{ langStore.t('addStockOut') }}</el-button>
        </div>
      </div>

      <el-table :data="stockOutRecords" style="width: 100%" stripe>
        <el-table-column prop="no" :label="langStore.currentLang === 'en' ? 'Expense No.' : 'No. Pengeluaran'" width="170" font-weight="bold" />
        <el-table-column prop="date" :label="langStore.t('dateCol')" width="140" />
        <el-table-column prop="reason" :label="langStore.t('notesLbl')" min-width="160" />
        <el-table-column prop="item" :label="langStore.t('productCol')" min-width="160" />
        <el-table-column :label="langStore.currentLang === 'en' ? 'Available Stock' : 'Stok Tersedia Saat Ini'" width="160" align="right">
          <template #default="scope">
            <el-tag type="info" font-weight="bold">{{ getAvailableStock(scope.row.item) }} Pcs</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qty" :label="langStore.t('qtyCol')" width="120" align="right">
          <template #default="scope">
            <span class="text-orange font-bold">- {{ scope.row.qty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pic" :label="langStore.t('operatorCol')" width="150" />
      </el-table>
    </div>

    <!-- TAB 3: PRODUKSI STOK -->
    <div class="inventory-card pos-card" v-else-if="activeSubTab === 'production'">
      <div class="filter-action-row">
        <h3>{{ langStore.currentLang === 'en' ? 'Stock Production & Recipe Manufacturing' : 'Produksi Stok & Manufaktur Resep Resto' }}</h3>
        <el-button type="success" :icon="Plus" @click="isAddProductionOpen = true">{{ langStore.currentLang === 'en' ? '+ New Production Batch' : '+ Buat Batch Produksi Baru' }}</el-button>
      </div>

      <el-table :data="productionBatches" style="width: 100%" stripe class="mt-4">
        <el-table-column prop="batchNo" :label="langStore.t('batchNo')" width="180" font-weight="bold" />
        <el-table-column prop="date" :label="langStore.t('productionDate')" width="140" />
        <el-table-column prop="product" :label="langStore.t('productCol')" min-width="180" />
        <el-table-column prop="yieldQty" :label="langStore.t('qtyCol')" width="130" align="right" />
        <el-table-column prop="cost" :label="langStore.t('costPrice')" width="150" align="right">
          <template #default="scope">
            <span>{{ formatRp(scope.row.cost) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" :label="langStore.t('statusLbl')" width="130">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- TAB 4: STOK OPNAME -->
    <div class="inventory-card pos-card" v-else-if="activeSubTab === 'opname'">
      <div class="filter-action-row">
        <h3>Audit Stok Opname Fisik vs Sistem</h3>
        <el-button type="primary" :icon="Plus" @click="isAddOpnameOpen = true">+ Mulai Audit Opname</el-button>
      </div>

      <el-table :data="opnameAuditRecords" style="width: 100%" stripe class="mt-4">
        <el-table-column prop="code" label="Kode Opname" width="150" font-weight="bold" />
        <el-table-column prop="date" label="Tanggal Audit" width="140" />
        <el-table-column prop="item" label="Nama Barang" min-width="160" />
        <el-table-column prop="systemQty" label="Stok Sistem" width="120" align="right" />
        <el-table-column prop="physicalQty" label="Stok Fisik" width="120" align="right" />
        <el-table-column prop="variance" label="Selisih" width="120" align="right">
          <template #default="scope">
            <span :class="scope.row.variance < 0 ? 'text-red font-bold' : 'text-green font-bold'">
              {{ scope.row.variance > 0 ? '+' : '' }}{{ scope.row.variance }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status Adjustment" width="140">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Selesai' ? 'success' : 'warning'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- TAB 5: STOK OUTSTANDING -->
    <div class="inventory-card pos-card" v-else-if="activeSubTab === 'outstanding'">
      <div class="filter-action-row">
        <h3>Stok Outstanding (Purchase Order Belum Tiba)</h3>
        <el-button type="primary" :icon="Plus" @click="openPoModal">+ Buat Purchase Order PO</el-button>
      </div>

      <el-table :data="outstandingOrders" style="width: 100%" stripe class="mt-4">
        <el-table-column prop="poNo" label="No. Purchase Order" width="170" font-weight="bold" />
        <el-table-column prop="supplier" label="Nama Supplier" min-width="160" />
        <el-table-column prop="poDate" label="Tanggal PO" width="140" />
        <el-table-column prop="expectedDate" label="Estimasi Tiba" width="140" />
        <el-table-column prop="totalAmount" label="Total PO (Rp)" width="150" align="right">
          <template #default="scope">
            <span>{{ formatRp(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status Pengiriman" width="160">
          <template #default="scope">
            <el-tag type="warning">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- TAB 6: PERGERAKAN STOK (STOCK LEDGER) -->
    <div class="inventory-card pos-card" v-else-if="activeSubTab === 'movement'">
      <div class="filter-action-row">
        <h3>Log Pergerakan Stok (Stock Ledger History)</h3>
        <el-input v-model="movementSearch" placeholder="Filter SKU / Nama Barang" style="width: 280px;" :prefix-icon="Search" />
      </div>

      <el-table :data="stockMovements" style="width: 100%" stripe class="mt-4">
        <el-table-column prop="datetime" label="Waktu" width="160" />
        <el-table-column prop="sku" label="SKU" width="130" />
        <el-table-column prop="item" label="Nama Barang" min-width="180" font-weight="bold" />
        <el-table-column prop="type" label="Tipe Pergerakan" width="150">
          <template #default="scope">
            <el-tag :type="scope.row.type.includes('Masuk') ? 'success' : 'danger'">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="qty" label="Perubahan Qty" width="130" align="right">
          <template #default="scope">
            <span :class="scope.row.qty.includes('+') ? 'text-green font-bold' : 'text-red font-bold'">{{ scope.row.qty }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="balanceAfter" label="Saldo Akhir" width="120" align="right" />
        <el-table-column prop="refNo" label="No. Referensi / Kasir" min-width="180" />
      </el-table>
    </div>

    <!-- TAB 7: EMAIL PERINGATAN STOK -->
    <div class="inventory-card pos-card p-4" v-else-if="activeSubTab === 'email'">
      <h3>Pengaturan Email Peringatan Stok Menipis & Kadaluarsa</h3>
      <p class="text-sub mt-1">Sistem akan secara otomatis mengirimkan notifikasi email ketika stok berada di bawah batas minimum.</p>

      <el-form label-width="220px" class="mt-4" style="max-width: 600px;">
        <el-form-item label="Status Peringatan Email">
          <el-switch v-model="emailAlertConfig.active" active-text="Aktif (Auto Send Alert)" />
        </el-form-item>
        <el-form-item label="Email Penerima Laporan">
          <el-input v-model="emailAlertConfig.recipient" placeholder="bien@pos-store.id" />
        </el-form-item>
        <el-form-item label="Batas Threshold Min. Stok">
          <el-input-number v-model="emailAlertConfig.minThreshold" :min="1" :max="100" />
          <span class="ml-2 font-12">Pcs / Porsi</span>
        </el-form-item>
        <el-form-item label="Frekuensi Notifikasi">
          <el-select v-model="emailAlertConfig.frequency" style="width: 100%;">
            <el-option label="Setiap Hari (Jam 08:00 Pagi)" value="daily" />
            <el-option label="Realtime Langsung Saat Stok Habis" value="realtime" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveEmailConfig">Simpan Pengaturan Email</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- MODAL TAMBAH STOK MASUK -->
    <el-dialog v-model="isAddStockInOpen" title="Tambah Stok Masuk" width="520px">
      <el-form :model="newStockIn" label-width="140px">
        <el-form-item label="Supplier">
          <el-select v-model="newStockIn.supplier" placeholder="Pilih Supplier" style="width: 100%;">
            <el-option label="Indofood" value="Indofood" />
            <el-option label="PT Sumber Daging" value="PT Sumber Daging" />
            <el-option label="CV Kopi Nusantara" value="CV Kopi Nusantara" />
          </el-select>
        </el-form-item>
        <el-form-item label="Catatan / No. PO">
          <el-input v-model="newStockIn.notes" placeholder="Misal: Penerimaan PO-9912" />
        </el-form-item>
        <el-form-item label="Diterima oleh">
          <el-input v-model="newStockIn.received_by" placeholder="johndoe@gmail.com" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isAddStockInOpen = false">Batal</el-button>
        <el-button type="success" @click="saveStockIn">Simpan Stok Masuk</el-button>
      </template>
    </el-dialog>

    <!-- MODAL CATAT STOK KELUAR -->
    <el-dialog v-model="isAddStockOutOpen" title="Catat Pengeluaran Stok Inventory" width="500px">
      <el-form :model="newStockOut" label-width="170px">
        <el-form-item label="Pilih Produk">
          <el-select v-model="newStockOut.product_id" placeholder="Pilih Produk" style="width: 100%;">
            <el-option 
              v-for="p in productStore.products" 
              :key="p.id" 
              :label="`${p.name} (Tersedia: ${p.stock_qty} ${p.unit || 'Pcs'})`" 
              :value="p.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Alasan Pengeluaran">
          <el-select v-model="newStockOut.reason" style="width: 100%;">
            <el-option label="Kerusakan / Rusak Kadaluarsa" value="Kerusakan / Rusak Kadaluarsa" />
            <el-option label="Penggunaan Dapur Resto" value="Penggunaan Dapur Resto" />
            <el-option label="Sample / Testing Quality" value="Sample / Testing Quality" />
          </el-select>
        </el-form-item>
        <el-form-item label="Jumlah Keluar (Qty)">
          <el-input-number v-model="newStockOut.qty" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="Penanggung Jawab">
          <el-input v-model="newStockOut.pic" placeholder="Nama Staf PIC" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isAddStockOutOpen = false">Batal</el-button>
        <el-button type="warning" @click="saveStockOut">Catat Stok Keluar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { usePosStore } from '@/stores/posStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Setting, Search, Plus } from '@element-plus/icons-vue';

const productStore = useProductStore();
const posStore = usePosStore();
const langStore = useLangStore();

const subTabs = computed(() => [
  { id: 'in', label: langStore.t('stockInTab') },
  { id: 'out', label: langStore.t('stockOutTab') },
  { id: 'production', label: langStore.t('productionTab') },
  { id: 'opname', label: langStore.currentLang === 'en' ? 'Stock Take (Opname)' : 'Stok opname' },
  { id: 'outstanding', label: langStore.currentLang === 'en' ? 'Outstanding Stock' : 'Stok Outstanding' },
  { id: 'movement', label: langStore.currentLang === 'en' ? 'Stock Movement' : 'Pergerakan stok' },
  { id: 'email', label: langStore.currentLang === 'en' ? 'Alert Email' : 'Email peringatan' }
]);

const activeSubTab = ref('in');
const searchKey = ref('');
const movementSearch = ref('');
const currentPage = ref(1);
const pageSize = ref(15);
const isAddStockInOpen = ref(false);
const isAddStockOutOpen = ref(false);
const isAddProductionOpen = ref(false);
const isAddOpnameOpen = ref(false);

const newStockIn = reactive({
  supplier: 'Indofood',
  notes: 'Penerimaan Stok Baru',
  received_by: 'bien@pos-store.id'
});

const newStockOut = reactive({
  product_id: 1,
  reason: 'Kerusakan / Rusak Kadaluarsa',
  qty: 1,
  pic: 'bien'
});

const emailAlertConfig = reactive({
  active: true,
  recipient: 'bien@pos-store.id',
  minThreshold: 10,
  frequency: 'realtime'
});

const stockInRecords = ref([
  { no: 'IN22031500000182', supplier: 'Indofood', date: '12 Maret 2022', notes: '"Nggak ada sih"', received_by: 'johndoe@gmail.com', status: 'Draft' },
  { no: 'IN22031500000182', supplier: 'Indofood', date: '12 Maret 2022', notes: '-', received_by: '-', status: 'Draft' },
  { no: 'IN22031500000182', supplier: 'Indofood', date: '12 Maret 2022', notes: '-', received_by: '-', status: 'Dibatalkan' },
  { no: 'IN22031500000182', supplier: 'Indofood', date: '12 Maret 2022', notes: '-', received_by: '-', status: 'Posted' }
]);

const filteredStockIn = computed(() => {
  if (!searchKey.value) return stockInRecords.value;
  return stockInRecords.value.filter(r => r.no.toLowerCase().includes(searchKey.value.toLowerCase()) || r.supplier.toLowerCase().includes(searchKey.value.toLowerCase()));
});

const stockOutRecords = ref([
  { no: 'OUT-20260815-01', date: '15-Aug-2026', reason: 'Kerusakan / Rusak Kadaluarsa', item: 'Baso Aci', qty: 5, pic: 'Siti Rahma' },
  { no: 'OUT-20260815-02', date: '15-Aug-2026', reason: 'Penggunaan Dapur Resto', item: 'Ayam Goreng Sambal Ijo', qty: 2, pic: 'Budi Santoso' }
]);

const productionBatches = ref([
  { batchNo: 'BATCH-20260815-A', date: '15-Aug-2026', product: 'Kuah Baso Aci Spesial 50L', yieldQty: '50 Liter', cost: 180000, status: 'Selesai' },
  { batchNo: 'BATCH-20260815-B', date: '15-Aug-2026', product: 'Bumbu Sambal Ijo 10kg', yieldQty: '10 Kg', cost: 120000, status: 'Selesai' }
]);

const opnameAuditRecords = ref([
  { code: 'OPN-20260815', date: '15-Aug-2026', item: 'Baso Aci Kuah Pedas', systemQty: 150, physicalQty: 148, variance: -2, status: 'Selesai' },
  { code: 'OPN-20260815', date: '15-Aug-2026', item: 'Es Teh Manis Gelas', systemQty: 300, physicalQty: 305, variance: 5, status: 'Selesai' }
]);

const outstandingOrders = ref([
  { poNo: 'PO-20260815-99', supplier: 'PT Sumber Daging Nusantara', poDate: '15-Aug-2026', expectedDate: '17-Aug-2026', totalAmount: 2500000, status: 'Dalam Pengiriman' }
]);

onMounted(() => {
  productStore.fetchProducts();
});

const getAvailableStock = (itemName) => {
  const match = productStore.products.find(p => p.name.toLowerCase() === itemName.toLowerCase() || itemName.toLowerCase().includes(p.name.toLowerCase()));
  return match ? match.stock_qty : 100;
};

const stockMovements = computed(() => {
  const list = [
    { datetime: '15-Aug-2026 12:00', sku: 'MAKAN-001', item: 'Baso Aci Kuah Pedas', type: 'Masuk (Stok Masuk)', qty: '+50 Pcs', balanceAfter: 150, refNo: 'IN22031500000182' }
  ];

  // Append real-time cashier sales from posStore
  posStore.transactionsHistory.forEach(tx => {
    if (tx.items) {
      tx.items.forEach(item => {
        const prod = productStore.products.find(p => p.id === item.id);
        list.push({
          datetime: tx.created_at || '15-Aug-2026',
          sku: prod?.sku || 'SKU-POS',
          item: item.name,
          type: 'Keluar (Penjualan Kasir)',
          qty: `-${item.qty} Pcs`,
          balanceAfter: prod ? prod.stock_qty : 90,
          refNo: tx.transaction_no
        });
      });
    }
  });

  if (movementSearch.value) {
    return list.filter(m => m.item.toLowerCase().includes(movementSearch.value.toLowerCase()) || m.sku.toLowerCase().includes(movementSearch.value.toLowerCase()));
  }
  return list;
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const saveStockIn = () => {
  const randNo = 'IN' + Math.floor(10000000000000 + Math.random() * 90000000000000);
  stockInRecords.value.unshift({
    no: randNo,
    supplier: newStockIn.supplier,
    date: new Date().toLocaleDateString('id-ID'),
    notes: newStockIn.notes,
    received_by: newStockIn.received_by,
    status: 'Posted'
  });
  isAddStockInOpen.value = false;
  ElNotification({ title: 'Stok Masuk', message: `Penerimaan stok ${randNo} berhasil disimpan!`, type: 'success' });
};

const saveStockOut = () => {
  const prod = productStore.products.find(p => p.id === newStockOut.product_id);
  const prodName = prod ? prod.name : 'Baso Aci';
  if (prod) {
    prod.stock_qty = Math.max(0, prod.stock_qty - newStockOut.qty);
  }
  stockOutRecords.value.unshift({
    no: `OUT-${Date.now()}`,
    date: new Date().toLocaleDateString('id-ID'),
    reason: newStockOut.reason,
    item: prodName,
    qty: newStockOut.qty,
    pic: newStockOut.pic
  });
  isAddStockOutOpen.value = false;
  ElNotification({ title: 'Stok Keluar', message: `Stok keluar ${prodName} (-${newStockOut.qty}) dicatat!`, type: 'warning' });
};

const saveEmailConfig = () => {
  ElNotification({ title: 'Email Alert', message: 'Pengaturan notifikasi stok berhasil disimpan!', type: 'success' });
};

const openPoModal = () => {
  ElNotification({ title: 'Purchase Order', message: 'Form pembuatan Purchase Order supplier dibuka.', type: 'info' });
};
</script>

<style scoped>
.inventory-master-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sub-tabs-bar {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  overflow-x: auto;
}

.sub-tab-item {
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 500;
  color: #595959;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.sub-tab-item:hover { color: #1890ff; }
.sub-tab-item.active {
  color: #1890ff;
  font-weight: 700;
  border-bottom-color: #1890ff;
  background-color: #e6f7ff;
}

.inventory-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-tool-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.tx-link-code { color: #1890ff; font-weight: bold; cursor: pointer; }

.status-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.status-pill.draft { border: 1px solid #fa8c16; color: #fa8c16; background-color: #fff7e6; }
.status-pill.dibatalkan { border: 1px solid #ff4d4f; color: #ff4d4f; background-color: #fff1f0; }
.status-pill.posted { border: 1px solid #52c41a; color: #52c41a; background-color: #f6ffed; }

.post-btn { background-color: #0088ff; border-color: #0088ff; border-radius: 16px; padding: 2px 16px; }

.table-pagination-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.page-size-selector { display: flex; align-items: center; gap: 12px; }
.total-text { font-size: 12px; color: #8c8c8c; }

.text-orange { color: #fa8c16; }
.text-red { color: #ff4d4f; }
.text-green { color: #52c41a; }
.font-bold { font-weight: bold; }
.mt-4 { margin-top: 16px; }
.mt-1 { margin-top: 4px; }
.ml-2 { margin-left: 8px; }
.font-12 { font-size: 12px; color: #8c8c8c; }
.p-4 { padding: 16px; }
</style>
