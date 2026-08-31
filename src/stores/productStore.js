import { defineStore } from 'pinia';

const STORED_PRODUCTS_KEY = 'bien_pos_products';

const defaultMockProducts = [
  {
    id: 1,
    category_id: 1,
    name: 'Baso Aci',
    variant: 'Spesial Kuah Pedas',
    sku: 'MAKAN-001',
    barcode: '8991001001',
    stock_qty: 150,
    unit: 'Porsi',
    cost_price: 8000,
    sell_price: 13000,
    online_price: 13000,
    available_online_date: '2026-08-15',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 2,
    category_id: 1,
    name: 'Ayam Goreng Sambal Ijo',
    variant: 'Dada / Paha',
    sku: 'MAKAN-002',
    barcode: '8991001002',
    stock_qty: 85,
    unit: 'Porsi',
    cost_price: 15000,
    sell_price: 25000,
    online_price: 27000,
    available_online_date: '2026-08-15',
    image_url: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 3,
    category_id: 1,
    name: 'Nasi Goreng Spesial',
    variant: 'Komplit Telur + Sosis',
    sku: 'MAKAN-003',
    barcode: '8991001003',
    stock_qty: 120,
    unit: 'Porsi',
    cost_price: 12000,
    sell_price: 22000,
    online_price: 24000,
    available_online_date: '2026-08-15',
    image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 4,
    category_id: 2,
    name: 'Kopi Susu Gula Aren',
    variant: 'Less Ice',
    sku: 'MINUM-001',
    barcode: '8991002001',
    stock_qty: 200,
    unit: 'Gelas',
    cost_price: 8000,
    sell_price: 18000,
    online_price: 20000,
    available_online_date: '2026-08-15',
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 5,
    category_id: 2,
    name: 'Es Teh Manis',
    variant: 'Dingin',
    sku: 'MINUM-002',
    barcode: '8991002002',
    stock_qty: 300,
    unit: 'Gelas',
    cost_price: 1500,
    sell_price: 5000,
    online_price: 6000,
    available_online_date: '2026-08-15',
    image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 6,
    category_id: 3,
    name: 'Roti Bakar Coklat Keju',
    variant: 'Porsi Besar',
    sku: 'CEMIL-001',
    barcode: '8991003001',
    stock_qty: 95,
    unit: 'Porsi',
    cost_price: 10000,
    sell_price: 16000,
    online_price: 18000,
    available_online_date: '2026-08-15',
    image_url: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bff?auto=format&fit=crop&w=400&q=80'
  }
];

export const useProductStore = defineStore('product', {
  state: () => {
    let savedProducts = null;
    try {
      savedProducts = JSON.parse(localStorage.getItem(STORED_PRODUCTS_KEY));
    } catch (e) {
      savedProducts = null;
    }

    return {
      products: savedProducts && savedProducts.length ? savedProducts : defaultMockProducts,
      categories: [
        { id: 'all', name: 'Semua Kategori' },
        { id: 1, name: 'makanan', label: 'Makanan', slug: 'makanan', itemCount: 3 },
        { id: 2, name: 'minuman', label: 'Minuman', slug: 'minuman', itemCount: 2 },
        { id: 3, name: 'cemilan', label: 'Cemilan', slug: 'cemilan', itemCount: 1 },
        { id: 4, name: 'paket-hemat', label: 'Paket Hemat', slug: 'paket-hemat', itemCount: 2 }
      ],
      packages: [
        { id: 1, name: 'Paket Baso Aci + Es Teh', items: 'Baso Aci, Es Teh Manis', price: 16000, discount: 2000, status: 'Aktif' },
        { id: 2, name: 'Paket Ayam Sambal Ijo + Kopi', items: 'Ayam Goreng Sambal Ijo, Kopi Susu Gula Aren', price: 38000, discount: 5000, status: 'Aktif' }
      ],
      addons: [
        { id: 1, name: 'Ekstra Telur Ceplok', category: 'Makanan', price: 4000, status: 'Tersedia' },
        { id: 2, name: 'Toping Keju Parut', category: 'Cemilan & Minuman', price: 3000, status: 'Tersedia' },
        { id: 3, name: 'Shot Espresso Tambahan', category: 'Minuman', price: 5000, status: 'Tersedia' }
      ],
      brands: [
        { id: 1, name: 'Bien Resto Original', code: 'BIEN-ORIG', itemCount: 4, logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=100&q=80' },
        { id: 2, name: 'Kopi Nusantara', code: 'KOPI-NUS', itemCount: 2, logo: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=100&q=80' }
      ],
      specifications: [
        { id: 1, name: 'Level Pedas (Cabai)', options: 'Level 0, Level 1, Level 2, Level 3', category: 'Makanan' },
        { id: 2, name: 'Kadar Gula (Sugar Level)', options: 'Normal, Less Sugar, No Sugar', category: 'Minuman' },
        { id: 3, name: 'Kadar Es (Ice Level)', options: 'Normal Ice, Less Ice, No Ice', category: 'Minuman' }
      ],
      selectedCategory: 'all',
      searchQuery: ''
    };
  },

  getters: {
    filteredProducts: (state) => {
      return state.products.filter(product => {
        const matchesCategory = state.selectedCategory === 'all' || product.category_id === state.selectedCategory || (typeof state.selectedCategory === 'string' && state.selectedCategory !== 'all' && state.categories.find(c => c.name === state.selectedCategory)?.id === product.category_id);
        const matchesSearch = !state.searchQuery || 
          product.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          product.barcode.includes(state.searchQuery);
        return matchesCategory && matchesSearch;
      });
    }
  },

  actions: {
    saveProducts() {
      localStorage.setItem(STORED_PRODUCTS_KEY, JSON.stringify(this.products));
    },

    async fetchProducts() {
      const saved = localStorage.getItem(STORED_PRODUCTS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.length) {
            this.products = parsed;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length && !saved) {
            this.products = data;
            this.saveProducts();
          }
        }
      } catch (err) {
        this.saveProducts();
      }
    },

    setCategory(catId) {
      this.selectedCategory = catId;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    },

    async updateProduct(id, updatedData) {
      const idx = this.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.products[idx] = {
          ...this.products[idx],
          ...updatedData
        };
        this.saveProducts();
      }
      try {
        await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });
      } catch (err) {
        console.warn('API updateProduct offline, saved locally', err);
      }
    },

    async adjustStock(id, newQty) {
      const p = this.products.find(item => item.id === id);
      if (p) {
        p.stock_qty = Math.max(0, Number(newQty));
        this.saveProducts();
      }
      try {
        await fetch(`/api/products/${id}/stock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock_qty: Math.max(0, Number(newQty)) })
        });
      } catch (err) {
        console.warn('API adjustStock offline, saved locally', err);
      }
    },

    async deductStock(cartItems) {
      if (!cartItems || !cartItems.length) return;
      cartItems.forEach(async (item) => {
        const prod = this.products.find(p => p.id === item.id || p.name.toLowerCase() === item.name.toLowerCase());
        if (prod) {
          prod.stock_qty = Math.max(0, prod.stock_qty - (item.qty || 1));
          try {
            await fetch(`/api/products/${prod.id}/stock`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ stock_qty: prod.stock_qty })
            });
          } catch (err) {}
        }
      });
      this.saveProducts();
    },

    async deleteProduct(id) {
      this.products = this.products.filter(product => product.id !== id);
      this.saveProducts();
      try {
        await fetch(`/api/products/${id}`, {
          method: 'DELETE'
        });
      } catch (err) {
        console.warn('API deleteProduct offline, deleted locally', err);
      }
    },

    async addProduct(newProduct) {
      const id = Date.now();
      const productObj = { id, ...newProduct };
      this.products.push(productObj);
      this.saveProducts();
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productObj)
        });
      } catch (err) {
        console.warn('API addProduct offline, saved locally', err);
      }
    },

    async reorderProducts(orderedProducts) {
      this.products = [...orderedProducts];
      this.saveProducts();
      try {
        await fetch('/api/products/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedIds: orderedProducts.map(p => p.id) })
        });
      } catch (err) {
        console.warn('API reorderProducts offline, reordered locally', err);
      }
    },

    moveProductUp(id) {
      const index = this.products.findIndex(p => p.id === id);
      if (index > 0) {
        const temp = this.products[index];
        this.products[index] = this.products[index - 1];
        this.products[index - 1] = temp;
        this.saveProducts();
      }
    },

    moveProductDown(id) {
      const index = this.products.findIndex(p => p.id === id);
      if (index >= 0 && index < this.products.length - 1) {
        const temp = this.products[index];
        this.products[index] = this.products[index + 1];
        this.products[index + 1] = temp;
        this.saveProducts();
      }
    },

    addCategory(cat) {
      const id = this.categories.length + 1;
      this.categories.push({ id, itemCount: 0, ...cat });
    },

    addPackage(pkg) {
      const id = this.packages.length + 1;
      this.packages.push({ id, status: 'Aktif', ...pkg });
    },

    addAddon(addon) {
      const id = this.addons.length + 1;
      this.addons.push({ id, status: 'Tersedia', ...addon });
    },

    addBrand(brand) {
      const id = this.brands.length + 1;
      this.brands.push({ id, itemCount: 0, ...brand });
    },

    addSpecification(spec) {
      const id = this.specifications.length + 1;
      this.specifications.push({ id, ...spec });
    }
  }
});
