<template>
  <div class="barcode-label-page pos-card">
    <div class="page-title-row">
      <h2>{{ langStore.t('barcodeTitle') }}</h2>
      <div class="actions-right">
        <el-input v-model="searchFilter" :placeholder="langStore.t('searchProductPlaceholder')" :prefix-icon="Search" style="width: 220px; margin-right: 12px;" clearable />
        <el-button type="primary" :icon="Printer" @click="printLabels">{{ langStore.t('printPreviewBtn') }}</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="label-tabs">
      <!-- 1. Cetak Barcode Produk -->
      <el-tab-pane :label="langStore.currentLang === 'en' ? 'Print Product Barcode' : 'Cetak Barcode Produk'" name="barcode">
        <div class="label-config-bar">
          <span class="label-title">{{ langStore.currentLang === 'en' ? 'Paper Size' : 'Ukuran Kertas' }}:</span>
          <el-select v-model="selectedLayout" :placeholder="langStore.currentLang === 'en' ? 'Paper Size' : 'Ukuran Kertas'" style="width: 260px;">
            <el-option :label="langStore.currentLang === 'en' ? '33x15mm Size (3 Column Thermal Roll)' : 'Ukuran 33x15mm (3 Kolom Roll Thermal)'" value="33x15" />
            <el-option :label="langStore.currentLang === 'en' ? '50x20mm Size (2 Column Thermal Roll)' : 'Ukuran 50x20mm (2 Kolom Roll Thermal)'" value="50x20" />
            <el-option :label="langStore.currentLang === 'en' ? 'A4 Sticker (40 Barcode / Sheet)' : 'A4 Sticker (40 Barcode / Lembar Stiker)'" value="A4" />
          </el-select>

          <span class="label-title ml-4">{{ langStore.currentLang === 'en' ? 'Print Copies' : 'Jumlah Salinan' }}:</span>
          <el-input-number v-model="copiesCount" :min="1" :max="100" />
        </div>

        <div class="products-selection-table mt-4">
          <el-table :data="filteredProductList" style="width: 100%" stripe @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" />
            <el-table-column prop="name" :label="langStore.t('productName')" min-width="180" font-weight="bold" />
            <el-table-column prop="sku" :label="langStore.t('skuCode')" width="140" />
            <el-table-column prop="barcode" :label="langStore.t('barcode')" width="160" />
            <el-table-column prop="sell_price" :label="langStore.t('sellPrice')" width="140" align="right">
              <template #default="scope">
                <span>{{ formatRp(scope.row.sell_price) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="langStore.currentLang === 'en' ? 'Barcode Preview' : 'Preview Barcode'" width="220" align="center">
              <template #default="scope">
                <div class="barcode-preview-pill">
                  <span class="b-store">bien resto</span>
                  <svg viewBox="0 0 100 30" width="130" height="30">
                    <rect x="5" y="2" width="2" height="20" fill="#000"/>
                    <rect x="9" y="2" width="1" height="20" fill="#000"/>
                    <rect x="12" y="2" width="3" height="20" fill="#000"/>
                    <rect x="17" y="2" width="2" height="20" fill="#000"/>
                    <rect x="21" y="2" width="4" height="20" fill="#000"/>
                    <rect x="27" y="2" width="1" height="20" fill="#000"/>
                    <rect x="30" y="2" width="2" height="20" fill="#000"/>
                    <rect x="34" y="2" width="3" height="20" fill="#000"/>
                    <rect x="39" y="2" width="1" height="20" fill="#000"/>
                    <rect x="42" y="2" width="4" height="20" fill="#000"/>
                    <rect x="48" y="2" width="2" height="20" fill="#000"/>
                    <rect x="52" y="2" width="1" height="20" fill="#000"/>
                    <rect x="55" y="2" width="3" height="20" fill="#000"/>
                    <rect x="60" y="2" width="2" height="20" fill="#000"/>
                    <rect x="64" y="2" width="4" height="20" fill="#000"/>
                    <rect x="70" y="2" width="1" height="20" fill="#000"/>
                    <rect x="73" y="2" width="2" height="20" fill="#000"/>
                    <rect x="77" y="2" width="3" height="20" fill="#000"/>
                    <rect x="82" y="2" width="1" height="20" fill="#000"/>
                    <rect x="85" y="2" width="4" height="20" fill="#000"/>
                    <rect x="91" y="2" width="2" height="20" fill="#000"/>
                  </svg>
                  <span class="b-code">{{ scope.row.barcode }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 2. Cetak Label Harga Rak -->
      <el-tab-pane :label="langStore.currentLang === 'en' ? 'Print Shelf Price Label' : 'Cetak Label Harga Rak'" name="price-label">
        <div class="label-config-bar">
          <span class="label-title">{{ langStore.currentLang === 'en' ? 'Shelf Tag Format' : 'Format Label Rak' }}:</span>
          <el-select v-model="shelfLayout" style="width: 260px;">
            <el-option :label="langStore.currentLang === 'en' ? 'Standard Shelf Tag 70x35mm' : 'Ukuran Standar Rak 70x35mm'" value="70x35" />
            <el-option :label="langStore.currentLang === 'en' ? 'Large Promo Tag 100x50mm' : 'Ukuran Promo Besar 100x50mm'" value="100x50" />
          </el-select>
          <span class="ml-4 font-12 text-gray">{{ langStore.currentLang === 'en' ? 'Shelf price tags ready for display shelves.' : 'Label harga rak siap dipasang di etalase/rak display resto.' }}</span>
        </div>

        <div class="price-tags-grid">
          <div v-for="prod in filteredProductList" :key="prod.id" class="shelf-tag-card pos-card">
            <div class="tag-header">bien RESTO & CAFE</div>
            <div class="tag-body">
              <span class="tag-title">{{ prod.name }}</span>
              <span class="tag-price">{{ formatRp(prod.sell_price) }}</span>
            </div>
            <div class="tag-footer">
              <span>SKU: {{ prod.sku }}</span>
              <span>BARCODE: {{ prod.barcode }}</span>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '@/stores/productStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification } from 'element-plus';
import { Printer, Search } from '@element-plus/icons-vue';

const route = useRoute();
const productStore = useProductStore();
const langStore = useLangStore();
const activeTab = ref('barcode');

const syncTab = () => {
  if (route.query.tab) {
    activeTab.value = route.query.tab;
  } else if (route.path.includes('print-label')) {
    activeTab.value = 'price-label';
  } else {
    activeTab.value = 'barcode';
  }
};

onMounted(syncTab);
watch(() => [route.path, route.query.tab], syncTab);
const selectedLayout = ref('33x15');
const shelfLayout = ref('70x35');
const copiesCount = ref(10);
const searchFilter = ref('');
const selectedProducts = ref([]);

const filteredProductList = computed(() => {
  if (!searchFilter.value) return productStore.products;
  return productStore.products.filter(p => 
    p.name.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchFilter.value.toLowerCase()) ||
    p.barcode.includes(searchFilter.value)
  );
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const handleSelectionChange = (val) => {
  selectedProducts.value = val;
};

const printLabels = () => {
  window.print();
  ElNotification({
    title: langStore.currentLang === 'en' ? 'Print Labels' : 'Cetak Barcode & Label',
    message: langStore.currentLang === 'en' ? `Preparing ${copiesCount.value} label copies...` : `Menyiapkan ${copiesCount.value} lembar barcode/label...`,
    type: 'success'
  });
};
</script>

<style scoped>
.barcode-label-page {
  padding: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.label-config-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: #fafafa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.barcode-preview-pill {
  border: 1px solid #000;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 140px;
  background-color: #ffffff;
  border-radius: 4px;
  margin: 0 auto;
}

.b-store { font-size: 9px; font-weight: bold; text-transform: uppercase; }
.b-code { font-size: 10px; font-weight: bold; font-family: monospace; }

.price-tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.shelf-tag-card {
  border: 2px solid #1890ff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #ffffff;
}

.tag-header {
  font-size: 12px;
  font-weight: 800;
  color: #1890ff;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 4px;
}

.tag-body {
  display: flex;
  flex-direction: column;
  margin: 12px 0;
}

.tag-title { font-size: 14px; font-weight: 700; color: #262626; }
.tag-price { font-size: 22px; font-weight: 800; color: #52c41a; }

.tag-footer {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #8c8c8c;
  border-top: 1px dashed #e8e8e8;
  padding-top: 4px;
}

.mt-4 { margin-top: 16px; }
</style>
