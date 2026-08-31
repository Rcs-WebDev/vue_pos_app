<template>
  <div class="cashier-layout">
    <!-- Mobile Mode Tab Selector Bar (< 768px) -->
    <div class="mobile-cashier-header">
      <div 
        class="m-cashier-tab" 
        :class="{ active: mobileTab === 'products' }" 
        @click="mobileTab = 'products'"
      >
        <el-icon><Box /></el-icon>
        <span>{{ langStore.t('selectProducts') }}</span>
      </div>
      <div 
        class="m-cashier-tab" 
        :class="{ active: mobileTab === 'cart' }" 
        @click="mobileTab = 'cart'"
      >
        <el-icon><ShoppingBag /></el-icon>
        <span>{{ langStore.t('cartAndPay') }} ({{ posStore.totalItemsCount }})</span>
      </div>
    </div>

    <!-- Main Center Column: Product Selector & Category Pills Grid -->
    <div class="products-column" :class="{ 'hide-on-mobile': mobileTab !== 'products' }">
      <!-- Large Top Search Bar -->
      <div class="products-search-bar">
        <el-input
          v-model="productStore.searchQuery"
          :placeholder="langStore.t('searchProductPlaceholder') || 'Search Product, SKU, or Scan Barcode...'"
          :prefix-icon="Search"
          clearable
          class="large-search-input"
        >
          <template #suffix>
            <el-icon class="barcode-scan-icon" title="Scan Barcode" @click="openBarcodeDialog"><Camera /></el-icon>
          </template>
        </el-input>
      </div>

      <!-- Category Filter Pills Bar -->
      <div class="category-pills-bar">
        <div 
          v-for="cat in productStore.categories" 
          :key="cat.id"
          class="category-pill"
          :class="{ active: productStore.selectedCategory === cat.id }"
          @click="productStore.setCategory(cat.id)"
        >
          {{ getCategoryDisplayLabel(cat) }}
        </div>
      </div>

      <!-- Product Cards Grid -->
      <el-scrollbar class="products-grid-scroll">
        <div class="products-grid">
          <div 
            v-for="prod in productStore.filteredProducts" 
            :key="prod.id"
            class="product-card"
            @click="posStore.addToCart(prod)"
          >
            <div class="product-img-box">
              <img :src="prod.image_url" :alt="prod.name" />
              <span class="stock-badge-pill">Stock: {{ prod.stock_qty }}</span>
            </div>
            <div class="product-info-box">
              <div class="product-title">{{ prod.name }}</div>
              <div class="product-variant">{{ prod.variant || getCategoryName(prod.category_id) }}</div>
              <div class="product-price-row">
                <span class="price-val">Rp {{ formatNumberOnly(prod.sell_price) }}</span>
                <button class="add-btn-circle" title="Tambahkan ke Keranjang">
                  <el-icon><Plus /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- Right Column: Cart Panel -->
    <div class="cart-column" :class="{ 'hide-on-mobile': mobileTab !== 'cart' }">
      <!-- Dark Navy Cart Header -->
      <div class="cart-header-navy">
        <div class="cart-title-box">
          <el-icon class="cart-icon"><ShoppingBag /></el-icon>
          <span class="cart-title">Cart ({{ posStore.totalItemsCount }})</span>
        </div>
        <el-icon class="clear-cart-icon" title="Kosongkan Keranjang" @click="posStore.clearCart()"><Delete /></el-icon>
      </div>

      <!-- Order Dining Type Bar Pills -->
      <div class="order-type-bar">
        <div 
          class="type-pill" 
          :class="{ active: posStore.orderType.includes('DINE-IN') }"
          @click="selectOrderType('DINE-IN (1 Pax)')"
        >
          <span v-if="posStore.orderType.includes('DINE-IN')">✓ </span>DINE-IN (1 Pax)
        </div>
        <div 
          class="type-pill" 
          :class="{ active: posStore.orderType === 'TAKEAWAY' }"
          @click="selectOrderType('TAKEAWAY')"
        >
          <span v-if="posStore.orderType === 'TAKEAWAY'">✓ </span>TAKEAWAY
        </div>
        <div 
          class="type-pill" 
          :class="{ active: posStore.orderType.includes('ONLINE') || posStore.orderType.includes('DELIVERY') }"
          @click="selectOrderType('ONLINE DELIVERY')"
        >
          <span v-if="posStore.orderType.includes('ONLINE') || posStore.orderType.includes('DELIVERY')">✓ </span>ONLINE DELIVERY
        </div>
      </div>

      <!-- Cart Item List or Empty State -->
      <el-scrollbar class="cart-items-scroll">
        <div v-if="posStore.cart.length === 0" class="empty-cart-box">
          <el-icon class="empty-cart-icon"><ShoppingCart /></el-icon>
          <span class="empty-text">{{ langStore.t('emptyCartText') }}</span>
        </div>

        <div 
          v-else 
          v-for="item in posStore.cart" 
          :key="item.id"
          class="cart-item-row"
        >
          <div class="item-details">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price-each" v-if="item.qty > 1">@ Rp {{ formatNumberOnly(item.sell_price) }}</span>
          </div>

          <div class="item-qty-controls">
            <button class="qty-btn" @click="posStore.updateQty(item.id, -1)">-</button>
            <span class="qty-val">{{ item.qty }}</span>
            <button class="qty-btn" @click="posStore.updateQty(item.id, 1)">+</button>
          </div>

          <div class="item-subtotal">
            <span>Rp {{ formatNumberOnly(item.sell_price * item.qty) }}</span>
            <el-icon class="remove-icon" @click="posStore.removeFromCart(item.id)"><Delete /></el-icon>
          </div>
        </div>
      </el-scrollbar>

      <!-- Cart Quick Tools Toolbar -->
      <div class="cart-quick-toolbar">
        <div class="q-tool-btn" @click="openDiscountDialog">
          <el-icon><Discount /></el-icon>
          <span>{{ langStore.t('orderDiscount') }}</span>
        </div>
        <div class="q-tool-btn" @click="openShippingDialog">
          <el-icon><Van /></el-icon>
          <span>{{ langStore.t('shippingFee') }}</span>
        </div>
        <div class="q-tool-btn" @click="openNotesDialog">
          <el-icon><ChatDotSquare /></el-icon>
          <span>{{ langStore.t('orderNotes') }}</span>
        </div>
        <div class="q-tool-btn" @click="handleOtherAction">
          <el-icon><Menu /></el-icon>
          <span>{{ langStore.t('moreActions') }}</span>
        </div>
      </div>

      <!-- Cart Checkout Summary Footer -->
      <div class="cart-checkout-footer">
        <div class="summary-line">
          <span class="sum-lbl">Subtotal</span>
          <span class="sum-val">Rp {{ formatNumberOnly(posStore.subtotalAmount) }}</span>
        </div>
        <div class="summary-line grand-total-line">
          <span class="gt-lbl">Grand Total</span>
          <span class="gt-val">Rp {{ formatNumberOnly(posStore.totalAmount) }}</span>
        </div>

        <button 
          class="checkout-submit-button"
          :disabled="posStore.cart.length === 0"
          @click="posStore.openPaymentModal()"
        >
          <el-icon><ShoppingBag /></el-icon>
          <span>CHECKOUT NOW</span>
        </button>
      </div>
    </div>

    <!-- Mobile Floating Cart Bar (Appears when on Product catalog tab & cart has items) -->
    <div 
      v-if="mobileTab === 'products' && posStore.cart.length > 0" 
      class="mobile-floating-cart-bar"
      @click="mobileTab = 'cart'"
    >
      <div class="floating-cart-left">
        <el-icon><ShoppingBag /></el-icon>
        <span><strong>{{ posStore.totalItemsCount }} Item</strong> · Rp {{ formatNumberOnly(posStore.totalAmount) }}</span>
      </div>
      <div class="floating-cart-right">
        <span>{{ langStore.t('openCart') }}</span>
      </div>
    </div>

    <!-- Modals -->
    <el-dialog v-model="isBarcodeDialogOpen" title="Scan Barcode Produk / SKU" width="420px">
      <el-form label-width="120px">
        <el-form-item label="Kode Barcode">
          <el-input v-model="barcodeInput" placeholder="Masukkan atau Scan Barcode" autofocus @keyup.enter="scanBarcodeSubmit" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isBarcodeDialogOpen = false">Batal</el-button>
        <el-button type="primary" @click="scanBarcodeSubmit">Tambah ke Keranjang</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="isCustomDialogOpen" title="Tambah Produk Custom / Top Up Deposit" width="460px">
      <el-form :model="customItem" label-width="140px">
        <el-form-item label="Nama Item / Deposit">
          <el-input v-model="customItem.name" placeholder="Misal: Catering Event / Deposit Member" />
        </el-form-item>
        <el-form-item label="Harga Nominal (Rp)">
          <el-input-number v-model="customItem.sell_price" :min="1000" :step="5000" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="Jumlah (Qty)">
          <el-input-number v-model="customItem.qty" :min="1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isCustomDialogOpen = false">Batal</el-button>
        <el-button type="success" @click="saveCustomItem">Masukkan Keranjang</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="isInAwayDialogOpen" title="Pilihan Tipe Pesanan (In / Away)" width="380px">
      <div class="in-away-options">
        <el-button type="primary" size="large" style="width: 100%; margin-bottom: 10px;" @click="selectOrderType('DINE-IN (1 Pax)')">Dine-in (Makan di Tempat)</el-button>
        <el-button type="warning" size="large" style="width: 100%; margin-bottom: 10px;" @click="selectOrderType('TAKEAWAY')">Takeaway (Bawa Pulang)</el-button>
        <el-button type="success" size="large" style="width: 100%;" @click="selectOrderType('ONLINE DELIVERY')">Online Delivery / Away</el-button>
      </div>
    </el-dialog>

    <el-dialog v-model="isOtherActionsOpen" title="Menu Aksi Lainnya" width="400px">
      <div class="other-actions-list">
        <el-button type="info" plain style="width: 100%; margin-bottom: 10px;" @click="holdCart">Simpan Keranjang Sementara (Hold Cart)</el-button>
        <el-button type="primary" plain style="width: 100%; margin-bottom: 10px;" @click="splitBill">Bagi Tagihan (Split Bill)</el-button>
        <el-button type="warning" plain style="width: 100%;" @click="openDrawer">Buka Laci Kasir (Open Cash Drawer)</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import { usePosStore } from '@/stores/posStore';
import { useProductStore } from '@/stores/productStore';
import { useLangStore } from '@/stores/langStore';
import { ElMessageBox, ElNotification } from 'element-plus';
import {
  TakeawayBox,
  Notebook,
  Plus,
  Delete,
  Menu,
  Discount,
  Van,
  ChatDotSquare,
  CircleCloseFilled,
  Operation,
  Search,
  ShoppingBag,
  Camera,
  ShoppingCart
} from '@element-plus/icons-vue';

const posStore = usePosStore();
const productStore = useProductStore();
const langStore = useLangStore();

const mobileTab = ref('products');

const getCategoryDisplayLabel = (cat) => {
  if (!cat) return '';
  if (cat.id === 'all') return langStore.t('allCategories');
  if (langStore.currentLang === 'en') {
    const nameLower = (cat.name || cat.label || '').toLowerCase();
    if (nameLower.includes('makanan') || nameLower === 'food') return 'Food';
    if (nameLower.includes('minuman') || nameLower === 'beverages') return 'Beverages';
    if (nameLower.includes('cemilan') || nameLower === 'snacks') return 'Snacks';
    if (nameLower.includes('paket') || nameLower.includes('combo')) return 'Combo Deals';
  }
  return cat.label || cat.name;
};

const getCategoryName = (catId) => {
  const found = productStore.categories.find(c => c.id === catId);
  return found ? getCategoryDisplayLabel(found) : '';
};

const activeRightTab = ref('produk');
const isBarcodeDialogOpen = ref(false);
const isCustomDialogOpen = ref(false);
const isInAwayDialogOpen = ref(false);
const isOtherActionsOpen = ref(false);

const barcodeInput = ref('');
const customItem = reactive({
  name: 'Pesanan Custom',
  sell_price: 20000,
  qty: 1
});

onMounted(() => {
  productStore.fetchProducts();
});

const formatRp = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

const formatNumberOnly = (val) => {
  if (val === undefined || val === null) return '0';
  return new Intl.NumberFormat('id-ID').format(val);
};

const openBarcodeDialog = () => {
  activeRightTab.value = 'barcode';
  isBarcodeDialogOpen.value = true;
};

const scanBarcodeSubmit = () => {
  if (!barcodeInput.value) return;
  const match = productStore.products.find(p => p.barcode === barcodeInput.value || p.sku === barcodeInput.value);
  if (match) {
    posStore.addToCart(match);
    ElNotification({ title: 'Barcode Found', message: `${match.name} ditambahkan ke keranjang`, type: 'success' });
  } else {
    ElNotification({ title: 'Barcode Not Found', message: `Barcode ${barcodeInput.value} tidak ditemukan.`, type: 'warning' });
  }
  barcodeInput.value = '';
  isBarcodeDialogOpen.value = false;
};

const openCustomDepositDialog = () => {
  activeRightTab.value = 'custom';
  isCustomDialogOpen.value = true;
};

const saveCustomItem = () => {
  const customProd = {
    id: Date.now(),
    name: customItem.name,
    sell_price: customItem.sell_price,
    stock_qty: 999,
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
  };
  posStore.addToCart(customProd);
  isCustomDialogOpen.value = false;
  ElNotification({ title: 'Custom Item', message: `${customItem.name} dimasukkan ke keranjang`, type: 'success' });
};

const selectOrderType = (type) => {
  posStore.setOrderType(type);
  isInAwayDialogOpen.value = false;
  ElNotification({ title: 'Tipe Pesanan', message: `Tipe pesanan diubah ke ${type}`, type: 'info' });
};

const openDiscountDialog = () => {
  ElMessageBox.prompt('Masukkan Jumlah Diskon (Rp):', 'Diskon Pesanan', {
    confirmButtonText: 'Terapkan',
    cancelButtonText: 'Batal',
    inputType: 'number'
  }).then(({ value }) => {
    posStore.discount = Number(value || 0);
    ElNotification({ title: 'Diskon', message: `Diskon Rp ${value} berhasil diterapkan.`, type: 'success' });
  }).catch(() => {});
};

const openShippingDialog = () => {
  ElMessageBox.prompt('Masukkan Biaya Ongkir (Rp):', 'Ongkos Kirim', {
    confirmButtonText: 'Terapkan',
    cancelButtonText: 'Batal',
    inputType: 'number'
  }).then(({ value }) => {
    posStore.shippingFee = Number(value || 0);
    ElNotification({ title: 'Ongkir', message: `Ongkir Rp ${value} berhasil ditambahkan.`, type: 'success' });
  }).catch(() => {});
};

const openNotesDialog = () => {
  ElMessageBox.prompt('Masukkan Catatan Pesanan:', 'Catatan Pesanan', {
    confirmButtonText: 'Simpan',
    cancelButtonText: 'Batal'
  }).then(({ value }) => {
    posStore.orderNotes = value || '';
    ElNotification({ title: 'Catatan', message: 'Catatan pesanan berhasil disimpan.', type: 'info' });
  }).catch(() => {});
};

const handleOtherAction = () => {
  isOtherActionsOpen.value = true;
};

const holdCart = () => {
  isOtherActionsOpen.value = false;
  ElNotification({ title: 'Hold Cart', message: 'Keranjang berhasil disimpan sementara.', type: 'success' });
};

const splitBill = () => {
  isOtherActionsOpen.value = false;
  ElNotification({ title: 'Split Bill', message: 'Tagihan dibagi menjadi 2 struk.', type: 'info' });
};

const openDrawer = () => {
  isOtherActionsOpen.value = false;
  ElNotification({ title: 'Laci Kasir', message: 'Perintah buka laci kasir (Cash Drawer) terkirim.', type: 'success' });
};
</script>


<style scoped>
.cashier-layout {
  display: flex;
  height: calc(100vh - 64px);
  width: 100%;
  background-color: #f8fafc;
  overflow: hidden;
}

/* Left / Main Center Column: Products Grid */
.products-column {
  flex: 1;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;
}

.products-search-bar {
  margin-bottom: 16px;
}

:deep(.large-search-input .el-input__wrapper) {
  height: 52px !important;
  border-radius: 12px !important;
  background-color: #f1f5f9 !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: none !important;
  padding: 0 16px !important;
}

:deep(.large-search-input .el-input__inner) {
  font-size: 16px !important;
  color: #1e293b !important;
  font-weight: 500 !important;
}

.barcode-scan-icon {
  font-size: 22px;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
}

.barcode-scan-icon:hover {
  color: #2563eb;
}

/* Category Filter Pills Bar */
.category-pills-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.category-pill {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  padding: 10px 22px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.category-pill:hover {
  border-color: #bfdbfe;
  color: #2563eb;
  background-color: #eff6ff;
}

.category-pill.active {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

/* Product Cards Grid */
.products-grid-scroll {
  flex: 1;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding-bottom: 20px;
}

@media (max-width: 1400px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.product-card {
  background-color: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.product-img-box {
  position: relative;
  width: 100%;
  height: 190px;
  overflow: hidden;
  background-color: #f1f5f9;
}

.product-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img-box img {
  transform: scale(1.04);
}

.stock-badge-pill {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #0d9488;
  color: #ffffff;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.product-info-box {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: space-between;
}

.product-title {
  font-size: 17px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1.3;
}

.product-variant {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.price-val {
  font-size: 18px;
  font-weight: 800;
  color: #2563eb;
}

.add-btn-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: #3b82f6;
  color: #ffffff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.15s;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
}

.add-btn-circle:hover {
  background-color: #2563eb;
  transform: scale(1.08);
}

/* Right Column: Cart Panel */
.cart-column {
  width: 400px;
  background-color: #ffffff;
  border-left: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.mobile-cashier-header, .mobile-floating-cart-bar {
  display: none;
}

@media (max-width: 1024px) {
  .cart-column {
    width: 340px;
  }
}

@media (max-width: 768px) {
  .cashier-layout {
    flex-direction: column;
    height: calc(100vh - 128px);
    overflow: hidden;
    position: relative;
  }

  .mobile-cashier-header {
    display: flex !important;
    height: 48px;
    background-color: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  }

  .m-cashier-tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #64748b;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .m-cashier-tab.active {
    color: #2563eb;
    border-bottom-color: #2563eb;
    background-color: #eff6ff;
  }

  .hide-on-mobile {
    display: none !important;
  }

  .products-column {
    width: 100% !important;
    flex: 1 !important;
    padding: 10px !important;
    overflow-y: auto !important;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 10px !important;
    padding-bottom: 80px !important;
  }

  .product-card {
    border-radius: 12px !important;
  }

  .product-img-box {
    height: 120px !important;
  }

  .stock-badge-pill {
    top: 6px !important;
    right: 6px !important;
    padding: 2px 8px !important;
    font-size: 10px !important;
    border-radius: 8px !important;
  }

  .product-info-box {
    padding: 10px !important;
  }

  .product-title {
    font-size: 13px !important;
    font-weight: 700 !important;
    margin-bottom: 2px !important;
  }

  .product-variant {
    font-size: 11px !important;
    margin-bottom: 8px !important;
  }

  .price-val {
    font-size: 14px !important;
    font-weight: 800 !important;
  }

  .add-btn-circle {
    width: 30px !important;
    height: 30px !important;
    font-size: 14px !important;
  }

  .cart-column {
    width: 100% !important;
    flex: 1 !important;
    border-left: none !important;
    overflow-y: auto !important;
  }

  .mobile-floating-cart-bar {
    display: flex !important;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    bottom: 74px;
    left: 12px;
    right: 12px;
    height: 52px;
    background: linear-gradient(135deg, #1e1b4b, #2563eb);
    color: #ffffff;
    border-radius: 14px;
    padding: 0 16px;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
    z-index: 990;
    cursor: pointer;
  }

  .floating-cart-left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }

  .floating-cart-left .el-icon {
    font-size: 20px;
  }

  .floating-cart-right {
    font-size: 13px;
    font-weight: 800;
    background-color: rgba(255, 255, 255, 0.2);
    padding: 6px 12px;
    border-radius: 8px;
  }
}

/* Cart Header Dark Navy */
.cart-header-navy {
  background-color: #1e1b4b;
  color: #ffffff;
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-title-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-icon {
  font-size: 24px;
  color: #ffffff;
}

.cart-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.clear-cart-icon {
  font-size: 22px;
  color: #ef4444;
  cursor: pointer;
  transition: opacity 0.2s;
}

.clear-cart-icon:hover {
  opacity: 0.8;
}

/* Dining Type Pills Bar */
.order-type-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.type-pill {
  flex: 1;
  text-align: center;
  padding: 8px 4px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.type-pill.active {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}

/* Cart Items & Empty State */
.cart-items-scroll {
  flex: 1;
  padding: 12px 16px;
}

.empty-cart-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: #94a3b8;
  gap: 12px;
}

.empty-cart-icon {
  font-size: 64px;
  color: #cbd5e1;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
}

.cart-item-row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px dashed #e2e8f0;
  gap: 10px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.item-price-each {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.item-qty-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #f1f5f9;
  padding: 4px 8px;
  border-radius: 8px;
}

.qty-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #1e293b;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:hover {
  background-color: #e2e8f0;
}

.qty-val {
  font-size: 14px;
  font-weight: 800;
  min-width: 18px;
  text-align: center;
}

.item-subtotal {
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-icon {
  color: #ef4444;
  cursor: pointer;
  font-size: 16px;
}

/* Quick Tools Toolbar */
.cart-quick-toolbar {
  display: flex;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
  padding: 8px 12px;
  gap: 8px;
}

.q-tool-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  cursor: pointer;
  padding: 6px 4px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  gap: 2px;
}

.q-tool-btn:hover {
  background-color: #eff6ff;
}

.q-tool-btn .el-icon {
  font-size: 18px;
}

/* Cart Checkout Footer */
.cart-checkout-footer {
  padding: 20px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  color: #64748b;
  margin-bottom: 8px;
}

.sum-val {
  font-weight: 700;
  color: #1e293b;
}

.grand-total-line {
  margin-top: 12px;
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 800;
  color: #1e1b4b;
}

.gt-val {
  font-size: 24px;
  font-weight: 800;
  color: #2563eb;
}

.checkout-submit-button {
  width: 100%;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  font-size: 18px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  transition: all 0.2s;
}

.checkout-submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.checkout-submit-button:disabled {
  background: #cbd5e1;
  box-shadow: none;
  cursor: not-allowed;
}
</style>
