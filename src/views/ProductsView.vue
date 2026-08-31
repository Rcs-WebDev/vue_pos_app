<template>
  <div class="products-page">
    <!-- Sub-navigation Tabs -->
    <div class="sub-nav-tabs">
      <div 
        v-for="tab in subTabs" 
        :key="tab.id" 
        class="tab-link"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </div>
    </div>

    <!-- Filter Bar Header -->
    <div class="filter-header-card pos-card">
      <div class="filter-controls">
        <el-select v-model="filterCategory" :placeholder="langStore.t('category')" style="width: 140px;" clearable>
          <el-option :label="langStore.currentLang === 'en' ? 'Food' : 'Makanan'" value="makanan" />
          <el-option :label="langStore.currentLang === 'en' ? 'Beverages' : 'Minuman'" value="minuman" />
          <el-option :label="langStore.currentLang === 'en' ? 'Snacks' : 'Cemilan'" value="cemilan" />
        </el-select>

        <el-select v-model="filterBrand" placeholder="Brand" style="width: 140px;" clearable>
          <el-option label="Bien Resto" value="bien" />
        </el-select>

        <el-select v-model="filterCollection" :placeholder="langStore.currentLang === 'en' ? 'Collection' : 'Koleksi'" style="width: 140px;" clearable>
          <el-option :label="langStore.currentLang === 'en' ? 'All Collections' : 'Semua Koleksi'" value="all" />
        </el-select>

        <el-input
          v-model="productStore.searchQuery"
          :placeholder="langStore.t('searchProductPlaceholder')"
          :prefix-icon="Search"
          style="width: 280px;"
          clearable
        />
      </div>

      <div class="header-actions">
        <el-button type="success" :icon="Plus" @click="openAddDialog">
          {{ langStore.t('addProduct') }}
        </el-button>
      </div>
    </div>

    <!-- Main Products Data Table (TAB: Produk with Drag-and-Drop) -->
    <div class="table-card pos-card" v-if="activeTab === 'Produk'">
      <div class="reorder-info-hint p-2 bg-light-blue flex items-center gap-2 mb-2 font-12 text-blue">
        <span>↔️ {{ langStore.t('reorderHint') }}</span>
      </div>

      <!-- Desktop Table View -->
      <el-table 
        :data="productStore.filteredProducts" 
        style="width: 100%" 
        size="default"
        stripe
        class="products-table desktop-products-table"
        row-key="id"
      >
        <!-- Drag Handle Column -->
        <el-table-column width="45" align="center">
          <template #default>
            <el-icon class="drag-handle" title="Tarik untuk mengubah urutan produk"><Rank /></el-icon>
          </template>
        </el-table-column>

        <!-- Tombol Pindah Urutan (Atas / Bawah) Column -->
        <el-table-column :label="langStore.currentLang === 'en' ? 'Order' : 'Urutan'" width="85" align="center">
          <template #default="scope">
            <div class="flex justify-center gap-1">
              <el-button 
                size="small" 
                circle 
                type="primary" 
                plain
                title="Pindah ke Atas (Urutan Naik)"
                :disabled="productStore.products.findIndex(p => p.id === scope.row.id) === 0"
                @click="productStore.moveProductUp(scope.row.id)"
              >
                <el-icon><Top /></el-icon>
              </el-button>
              <el-button 
                size="small" 
                circle 
                type="primary" 
                plain
                title="Pindah ke Bawah (Urutan Turun)"
                :disabled="productStore.products.findIndex(p => p.id === scope.row.id) === productStore.products.length - 1"
                @click="productStore.moveProductDown(scope.row.id)"
              >
                <el-icon><Bottom /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column type="selection" width="45" />

        <!-- Foto -->
        <el-table-column :label="langStore.currentLang === 'en' ? 'Photo' : 'Foto'" width="70">
          <template #default="scope">
            <el-avatar shape="square" :size="44" :src="scope.row.image_url" class="product-thumb" />
          </template>
        </el-table-column>

        <!-- Nama Produk -->
        <el-table-column :label="langStore.t('productName')" min-width="180" sortable prop="name">
          <template #default="scope">
            <div class="product-name-col">
              <span class="p-name" @click="editProduct(scope.row)">{{ scope.row.name }}</span>
              <span class="p-category">{{ getCategoryName(scope.row.category_id) }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- Variant -->
        <el-table-column :label="langStore.t('variant')" width="130" prop="variant">
          <template #default="scope">
            <span>{{ scope.row.variant || '-' }}</span>
          </template>
        </el-table-column>

        <!-- SKU -->
        <el-table-column :label="langStore.t('skuCode')" width="110" prop="sku" />

        <!-- Barcode -->
        <el-table-column :label="langStore.t('barcode')" width="110" prop="barcode" />

        <!-- Qty Stok -->
        <el-table-column :label="langStore.t('stockQty')" width="100" align="right" prop="stock_qty" sortable>
          <template #default="scope">
            <el-tag :type="scope.row.stock_qty <= 20 ? 'danger' : 'success'" font-weight="bold">
              {{ scope.row.stock_qty }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Satuan -->
        <el-table-column :label="langStore.t('unitLbl')" width="80" prop="unit" />

        <!-- Harga Beli -->
        <el-table-column :label="langStore.t('costPrice')" width="110" align="right">
          <template #default="scope">
            <span>{{ formatRp(scope.row.cost_price) }}</span>
          </template>
        </el-table-column>

        <!-- Harga Jual di Toko -->
        <el-table-column :label="langStore.t('sellPrice')" width="130" align="right">
          <template #default="scope">
            <span class="price-highlight">{{ formatRp(scope.row.sell_price) }}</span>
          </template>
        </el-table-column>

        <!-- Harga Jual Online -->
        <el-table-column :label="langStore.t('onlinePrice')" width="130" align="right">
          <template #default="scope">
            <span>{{ formatRp(scope.row.online_price || scope.row.sell_price) }}</span>
          </template>
        </el-table-column>

        <!-- Action Column -->
        <el-table-column width="70" align="center" :label="langStore.t('actionCol')">
          <template #default="scope">
            <el-dropdown trigger="click">
              <el-icon class="action-dots"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="editProduct(scope.row)">✏️ {{ langStore.t('editProduct') }}</el-dropdown-item>
                  <el-dropdown-item @click="adjustStock(scope.row)">📦 {{ langStore.t('adjustStock') }}</el-dropdown-item>
                  <el-dropdown-item divided style="color: #ff4d4f; font-weight: bold;" @click="confirmDeleteProduct(scope.row)">
                    🗑️ {{ langStore.t('deleteProduct') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Mobile Products List View (< 768px) -->
      <div class="mobile-products-list">
        <div 
          v-for="prod in productStore.filteredProducts" 
          :key="prod.id"
          class="m-product-row"
        >
          <el-icon class="drag-handle" title="Tarik untuk reorder"><Rank /></el-icon>
          <el-avatar shape="square" :size="46" :src="prod.image_url" class="product-thumb" />
          <div class="m-product-info">
            <span class="m-p-name" @click="editProduct(prod)">{{ prod.name }}</span>
            <span class="m-p-sub">
              {{ getCategoryName(prod.category_id) }} · <strong class="text-blue">Rp {{ formatNumberOnly(prod.sell_price) }}</strong>
            </span>
          </div>
          <div class="m-product-right">
            <el-tag :type="prod.stock_qty <= 20 ? 'danger' : 'success'" size="small" class="m-stock-tag">
              Stok: {{ prod.stock_qty }}
            </el-tag>
            <el-dropdown trigger="click">
              <el-icon class="action-dots"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item disabled>
                    💰 {{ formatRp(prod.sell_price) }} · Stok: {{ prod.stock_qty }}
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="editProduct(prod)">✏️ {{ langStore.t('editProduct') }}</el-dropdown-item>
                  <el-dropdown-item @click="adjustStock(prod)">📦 {{ langStore.t('adjustStock') }}</el-dropdown-item>
                  <el-dropdown-item divided style="color: #ff4d4f; font-weight: bold;" @click="confirmDeleteProduct(prod)">
                    🗑️ {{ langStore.t('deleteProduct') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>

      <div class="table-pagination">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" layout="total, sizes, prev, pager, next" :total="productStore.products.length" />
      </div>
    </div>

    <!-- TAB: Kategori -->
    <div class="table-card pos-card" v-else-if="activeTab === 'Kategori'">
      <div class="p-3 border-b flex justify-between align-center">
        <h3>{{ langStore.currentLang === 'en' ? 'Product Categories Master Data' : 'Master Data Kategori Produk' }}</h3>
        <el-button type="success" size="small" @click="isAddCategoryOpen = true">+ {{ langStore.t('tabCategory') }}</el-button>
      </div>
      <el-table :data="productStore.categories" style="width: 100%" stripe>
        <el-table-column prop="name" :label="langStore.t('category')" min-width="180" font-weight="bold" />
        <el-table-column prop="label" :label="langStore.currentLang === 'en' ? 'Display Label' : 'Label Tampilan'" min-width="180" />
        <el-table-column prop="itemCount" :label="langStore.t('itemsCount')" width="130" align="right" />
      </el-table>
    </div>

    <!-- TAB: Brand -->
    <div class="table-card pos-card" v-else-if="activeTab === 'Brand'">
      <div class="p-3 border-b flex justify-between align-center">
        <h3>{{ langStore.currentLang === 'en' ? 'Brand & Trademark List' : 'Daftar Brand & Merek Dagang' }}</h3>
        <el-button type="success" size="small" @click="isAddBrandOpen = true">+ {{ langStore.t('tabBrand') }}</el-button>
      </div>
      <el-table :data="productStore.brands" style="width: 100%" stripe>
        <el-table-column label="Logo" width="80">
          <template #default="scope">
            <el-avatar shape="circle" :size="36" :src="scope.row.logo" />
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="langStore.currentLang === 'en' ? 'Brand Name' : 'Nama Brand'" min-width="180" font-weight="bold" />
        <el-table-column prop="code" :label="langStore.currentLang === 'en' ? 'Brand Code' : 'Kode Brand'" width="140" />
        <el-table-column prop="itemCount" :label="langStore.t('itemsCount')" width="130" align="right" />
      </el-table>
    </div>

    <!-- TAB: Spesifikasi -->
    <div class="table-card pos-card" v-else-if="activeTab === 'Spesifikasi'">
      <div class="p-3 border-b flex justify-between align-center">
        <h3>{{ langStore.currentLang === 'en' ? 'Product Variant Specifications / Attributes' : 'Spesifikasi / Atribut Varian Produk' }}</h3>
        <el-button type="success" size="small" @click="isAddSpecOpen = true">+ {{ langStore.t('tabSpec') }}</el-button>
      </div>
      <el-table :data="productStore.specifications" style="width: 100%" stripe>
        <el-table-column prop="name" :label="langStore.currentLang === 'en' ? 'Attribute / Spec Name' : 'Nama Atribut / Spesifikasi'" min-width="180" font-weight="bold" />
        <el-table-column prop="options" :label="langStore.t('variantOptions')" min-width="240" />
        <el-table-column prop="category" :label="langStore.t('appliedTo')" width="160" />
      </el-table>
    </div>

    <!-- Dialog Add Product -->
    <el-dialog v-model="isAddDialogOpen" :title="langStore.t('addProduct')" width="580px">
      <el-form :model="newProd" label-width="160px">
        <el-form-item :label="langStore.t('productName')"><el-input v-model="newProd.name" placeholder="Misal: Mie Ayam Jamur" /></el-form-item>
        <el-form-item :label="langStore.t('category')">
          <el-select v-model="newProd.category_id" style="width: 100%;">
            <el-option :label="langStore.currentLang === 'en' ? 'Food' : 'Makanan'" :value="1" />
            <el-option :label="langStore.currentLang === 'en' ? 'Beverages' : 'Minuman'" :value="2" />
            <el-option :label="langStore.currentLang === 'en' ? 'Snacks' : 'Cemilan'" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="langStore.t('variant')"><el-input v-model="newProd.variant" placeholder="Misal: Pedas / Spesial" /></el-form-item>
        <el-form-item :label="langStore.t('skuCode')"><el-input v-model="newProd.sku" placeholder="SKU-001" /></el-form-item>
        <el-form-item :label="langStore.t('barcode')"><el-input v-model="newProd.barcode" placeholder="899..." /></el-form-item>
        <el-form-item :label="langStore.t('stockQty')"><el-input-number v-model="newProd.stock_qty" :min="0" /></el-form-item>
        <el-form-item :label="langStore.t('unitLbl')"><el-input v-model="newProd.unit" placeholder="Porsi / Gelas / Pcs" /></el-form-item>
        <el-form-item :label="langStore.t('costPrice')"><el-input-number v-model="newProd.cost_price" :min="0" :step="1000" /></el-form-item>
        <el-form-item :label="langStore.t('sellPrice')"><el-input-number v-model="newProd.sell_price" :min="0" :step="1000" /></el-form-item>
        
        <!-- Add Photo: Upload Device or URL -->
        <el-form-item :label="langStore.t('photoUrl')">
          <input type="file" ref="addFileInput" accept="image/*" style="display: none;" @change="handleAddFileUpload" />
          <div class="upload-wrapper flex flex-col gap-2 width-100">
            <el-button type="primary" size="default" :icon="Upload" @click="triggerAddFileUpload">
              {{ langStore.t('uploadFromDevice') }}
            </el-button>
            <el-input v-model="newProd.image_url" :placeholder="langStore.t('orEnterUrl')" />
          </div>
          <div class="photo-preview mt-2 flex items-center gap-3" v-if="newProd.image_url">
            <el-avatar shape="square" :size="60" :src="newProd.image_url" class="border shadow-sm" />
            <span class="font-12 text-sub">Pratinjau Foto Produk Baru</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isAddDialogOpen = false">{{ langStore.t('cancel') }}</el-button>
        <el-button type="primary" @click="saveProduct">{{ langStore.t('saveChanges') }}</el-button>
      </template>
    </el-dialog>

    <!-- Dialog Edit Product (FULL FEATURE WITH DEVICE FILE UPLOAD) -->
    <el-dialog v-model="isEditDialogOpen" :title="langStore.t('editProduct')" width="580px">
      <el-form :model="editingProd" label-width="160px" v-if="editingProd">
        <el-form-item :label="langStore.t('productName')">
          <el-input v-model="editingProd.name" />
        </el-form-item>
        <el-form-item :label="langStore.t('category')">
          <el-select v-model="editingProd.category_id" style="width: 100%;">
            <el-option :label="langStore.currentLang === 'en' ? 'Food' : 'Makanan'" :value="1" />
            <el-option :label="langStore.currentLang === 'en' ? 'Beverages' : 'Minuman'" :value="2" />
            <el-option :label="langStore.currentLang === 'en' ? 'Snacks' : 'Cemilan'" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item :label="langStore.t('variant')">
          <el-input v-model="editingProd.variant" />
        </el-form-item>
        <el-form-item :label="langStore.t('skuCode')">
          <el-input v-model="editingProd.sku" />
        </el-form-item>
        <el-form-item :label="langStore.t('barcode')">
          <el-input v-model="editingProd.barcode" />
        </el-form-item>
        <el-form-item :label="langStore.t('stockQty')">
          <el-input-number v-model="editingProd.stock_qty" :min="0" />
        </el-form-item>
        <el-form-item :label="langStore.t('unitLbl')">
          <el-input v-model="editingProd.unit" />
        </el-form-item>
        <el-form-item :label="langStore.t('costPrice')">
          <el-input-number v-model="editingProd.cost_price" :min="0" :step="1000" />
        </el-form-item>
        <el-form-item :label="langStore.t('sellPrice')">
          <el-input-number v-model="editingProd.sell_price" :min="0" :step="1000" />
        </el-form-item>
        <el-form-item :label="langStore.t('onlinePrice')">
          <el-input-number v-model="editingProd.online_price" :min="0" :step="1000" />
        </el-form-item>

        <!-- Edit Photo Field: Upload Device + URL + Live Preview -->
        <el-form-item :label="langStore.t('photoUrl')">
          <input type="file" ref="editFileInput" accept="image/*" style="display: none;" @change="handleEditFileUpload" />
          <div class="upload-wrapper flex flex-col gap-2 width-100">
            <el-button type="primary" size="default" :icon="Upload" @click="triggerEditFileUpload">
              {{ langStore.t('uploadFromDevice') }}
            </el-button>
            <el-input v-model="editingProd.image_url" :placeholder="langStore.t('orEnterUrl')" />
          </div>

          <div class="photo-preview-container mt-3 flex items-center gap-3" v-if="editingProd.image_url">
            <el-avatar shape="square" :size="64" :src="editingProd.image_url" class="border shadow-sm" />
            <div class="preview-text-info">
              <span class="text-sub font-12 block">Pratinjau Foto Produk Saat Ini</span>
              <el-button type="danger" size="small" text style="padding: 0;" @click="editingProd.image_url = ''">
                Hapus / Hapus Foto
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="isEditDialogOpen = false">{{ langStore.t('cancel') }}</el-button>
        <el-button type="primary" @click="saveUpdateProduct">{{ langStore.t('saveChanges') }}</el-button>
      </template>
    </el-dialog>

    <!-- Dialog Adjust Stock (UBAH STOK) -->
    <el-dialog v-model="isStockDialogOpen" :title="langStore.t('adjustStock')" width="440px">
      <div v-if="stockEditingProd">
        <el-alert
          :title="`Mengubah Stok Produk: ${stockEditingProd.name}`"
          type="info"
          show-icon
          :closable="false"
          class="mb-3"
        />
        <el-form label-width="160px">
          <el-form-item :label="langStore.currentLang === 'en' ? 'Current Stock' : 'Stok Saat Ini'">
            <el-tag type="info" font-weight="bold">{{ stockEditingProd.stock_qty }} {{ stockEditingProd.unit }}</el-tag>
          </el-form-item>
          <el-form-item :label="langStore.currentLang === 'en' ? 'New Stock Quantity' : 'Kuantitas Stok Baru'">
            <el-input-number v-model="newStockValue" :min="0" style="width: 100%;" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="isStockDialogOpen = false">{{ langStore.t('cancel') }}</el-button>
        <el-button type="success" @click="saveStockAdjustment">{{ langStore.t('saveChanges') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { useProductStore } from '@/stores/productStore';
import { useLangStore } from '@/stores/langStore';
import { ElNotification, ElMessageBox } from 'element-plus';
import { Search, Plus, MoreFilled, Upload, Rank, Top, Bottom } from '@element-plus/icons-vue';
import Sortable from 'sortablejs';

const productStore = useProductStore();
const langStore = useLangStore();

const subTabs = computed(() => [
  { id: 'Produk', label: langStore.t('tabProducts') },
  { id: 'Kategori', label: langStore.t('tabCategory') },
  { id: 'Paket', label: langStore.t('tabPackage') },
  { id: 'Addon', label: langStore.t('tabAddon') },
  { id: 'Brand', label: langStore.t('tabBrand') },
  { id: 'Spesifikasi', label: langStore.t('tabSpec') }
]);
const activeTab = ref('Produk');

const getCategoryName = (catId) => {
  const c = productStore.categories.find(item => item.id === catId);
  if (!c) return 'makanan';
  if (langStore.currentLang === 'en') {
    const nameLower = (c.name || c.label || '').toLowerCase();
    if (nameLower.includes('makanan') || nameLower === 'food') return 'Food';
    if (nameLower.includes('minuman') || nameLower === 'beverages') return 'Beverages';
    if (nameLower.includes('cemilan') || nameLower === 'snacks') return 'Snacks';
    if (nameLower.includes('paket') || nameLower.includes('combo')) return 'Combo Deals';
  }
  return c.label || c.name;
};

const formatRp = (val) => {
  if (!val && val !== 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
};

const formatNumberOnly = (val) => {
  if (!val && val !== 0) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
};

const openAddDialog = () => {
  if (activeTab.value === 'Kategori') isAddCategoryOpen.value = true;
  else isAddDialogOpen.value = true;
};

const triggerEditFileUpload = () => {
  editFileInput.value?.click();
};

const triggerAddFileUpload = () => {
  addFileInput.value?.click();
};

const handleEditFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    ElNotification({ title: 'Upload Error', message: 'File yang dipilih harus berupa file gambar (JPG, PNG, WEBP, dll).', type: 'error' });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    if (editingProd.value) {
      editingProd.value.image_url = event.target.result;
    }
    ElNotification({ title: 'Upload Foto Sukses', message: `Berhasil memuat foto "${file.name}" dari perangkat!`, type: 'success' });
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};

const handleAddFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    ElNotification({ title: 'Upload Error', message: 'File yang dipilih harus berupa file gambar (JPG, PNG, WEBP, dll).', type: 'error' });
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    newProd.image_url = event.target.result;
    ElNotification({ title: 'Upload Foto Sukses', message: `Berhasil memuat foto "${file.name}" dari perangkat!`, type: 'success' });
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};

const saveProduct = async () => {
  if (!newProd.name) {
    ElNotification({ title: 'Error', message: 'Nama produk wajib diisi!', type: 'error' });
    return;
  }
  await productStore.addProduct({ ...newProd });
  isAddDialogOpen.value = false;
  ElNotification({ title: 'Sukses', message: 'Produk baru berhasil disimpan ke database!', type: 'success' });
};

const editProduct = (row) => {
  editingProd.value = { ...row };
  isEditDialogOpen.value = true;
};

const saveUpdateProduct = async () => {
  if (!editingProd.value || !editingProd.value.name) return;
  await productStore.updateProduct(editingProd.value.id, editingProd.value);
  isEditDialogOpen.value = false;
  ElNotification({
    title: langStore.t('editProduct'),
    message: `Detail produk dan foto ${editingProd.value.name} berhasil diperbarui di database!`,
    type: 'success'
  });
};

const adjustStock = (row) => {
  stockEditingProd.value = row;
  newStockValue.value = row.stock_qty;
  isStockDialogOpen.value = true;
};

const saveStockAdjustment = async () => {
  if (!stockEditingProd.value) return;
  await productStore.adjustStock(stockEditingProd.value.id, newStockValue.value);
  isStockDialogOpen.value = false;
  ElNotification({
    title: langStore.t('adjustStock'),
    message: `Kuantitas stok ${stockEditingProd.value.name} berhasil diubah menjadi ${newStockValue.value} di database!`,
    type: 'success'
  });
};

const confirmDeleteProduct = (row) => {
  ElMessageBox.confirm(
    `Apakah Anda yakin ingin menghapus produk "${row.name}" dari database?`,
    'Konfirmasi Hapus Produk',
    {
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      type: 'warning'
    }
  ).then(async () => {
    await productStore.deleteProduct(row.id);
    ElNotification({
      title: 'Hapus Produk',
      message: `Produk "${row.name}" berhasil dihapus dari database!`,
      type: 'success'
    });
  }).catch(() => {});
};

const saveCategory = () => {
  if (!newCat.label) return;
  productStore.addCategory({ name: newCat.label.toLowerCase(), label: newCat.label, slug: newCat.slug || newCat.label.toLowerCase() });
  isAddCategoryOpen.value = false;
  newCat.label = ''; newCat.slug = '';
  ElNotification({ title: 'Kategori', message: 'Kategori baru berhasil ditambahkan!', type: 'success' });
};
</script>

<style scoped>
.products-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sub-nav-tabs {
  display: flex;
  gap: 28px;
  background-color: #ffffff;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.tab-link {
  padding: 14px 6px;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab-link:hover {
  color: #2563eb;
}

.tab-link.active {
  color: #2563eb;
  font-weight: 800;
  border-bottom-color: #2563eb;
}

.filter-header-card {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-controls {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.product-name-col {
  display: flex;
  flex-direction: column;
}

.p-name {
  color: #2563eb;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
}

.p-name:hover {
  text-decoration: underline;
}

.p-category {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.price-highlight {
  font-weight: 800;
  color: #1e293b;
  font-size: 15px;
}

.date-text {
  font-size: 12px;
  color: #64748b;
}

.action-dots {
  cursor: pointer;
  color: #64748b;
  font-size: 20px;
}

.table-pagination {
  padding: 14px 20px;
  display: flex;
  justify-content: flex-end;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
}

.product-thumb {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.photo-preview-container {
  border: 1px dashed #cbd5e1;
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
}

.drag-handle {
  cursor: move;
  color: #2563eb;
  font-size: 20px;
}

.drag-handle:hover {
  color: #3b82f6;
}

.bg-light-blue {
  background-color: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
}

.text-blue { color: #2563eb; }
.width-100 { width: 100%; }
.text-sub { color: #64748b; }
.block { display: block; }
.font-12 { font-size: 12px; }
.font-13 { font-size: 13px; }
.font-bold { font-weight: bold; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.p-2 { padding: 10px 14px; }
.p-3 { padding: 14px; }
.border-b { border-bottom: 1px solid #e2e8f0; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.align-center { align-items: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.mobile-products-list {
  display: none !important;
}

@media (max-width: 768px) {
  .desktop-products-table {
    display: none !important;
  }

  .mobile-products-list {
    display: flex !important;
    flex-direction: column;
    gap: 10px;
    padding: 8px 0;
  }

  .m-product-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .m-product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .m-p-name {
    font-size: 15px;
    font-weight: 800;
    color: #1e293b;
    cursor: pointer;
    line-height: 1.3;
  }

  .m-p-sub {
    font-size: 12px;
    color: #64748b;
  }

  .m-product-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .m-stock-tag {
    font-size: 11px !important;
    font-weight: 700 !important;
  }

  .reorder-info-hint {
    font-size: 11px !important;
    padding: 8px 10px !important;
  }

  .sub-nav-tabs {
    gap: 16px;
    padding: 0 12px;
  }

  .filter-header-card {
    padding: 12px 14px;
    flex-direction: column;
    align-items: stretch;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .filter-controls .el-select,
  .filter-controls .el-input {
    width: 100% !important;
  }
}
</style>
