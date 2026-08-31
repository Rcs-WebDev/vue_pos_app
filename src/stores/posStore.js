import { defineStore } from 'pinia';
import confetti from 'canvas-confetti';
import { useProductStore } from '@/stores/productStore';

export const usePosStore = defineStore('pos', {
  state: () => ({
    cart: [],
    orderType: 'DINE-IN (1 Pax)',
    orderNotes: '',
    discount: 0,
    shippingFee: 0,
    cashierName: 'bien',
    isPaymentModalOpen: false,
    isReceiptModalOpen: false,
    selectedPaymentMethod: 'CASH',
    tenderedAmount: 0,
    activeTransaction: null,
    
    // Persistent Storage for Transactions & Cash Flow
    transactionsHistory: JSON.parse(localStorage.getItem('bien_pos_transactions') || '[]'),
    cashFlowHistory: JSON.parse(localStorage.getItem('bien_pos_cashflow') || '[]'),

    paymentMethods: [
      { id: 'CASH', name: 'CASH', icon: 'Money', badge: '' },
      { id: 'QRIS_NETZME', name: 'QRIS Tap by Netzme', icon: 'QrCode', badge: '' },
      { id: 'QRIS_BCA', name: 'QRIS by BCA', icon: 'CreditCard', badge: '' },
      { id: 'QRIS_NETZME_INACTIVE', name: 'QRIS by Netzme (Belum Aktif)', icon: 'QrCode', badge: 'Belum Aktif', disabled: true },
      { id: 'OVO_INACTIVE', name: 'OVO (Belum Aktif)', icon: 'Cellphone', badge: 'Belum Aktif', disabled: true },
      { id: 'SHOPEEPAY_INACTIVE', name: 'ShopeePay (Belum Aktif)', icon: 'ShoppingBag', badge: 'Belum Aktif', disabled: true }
    ]
  }),

  getters: {
    totalItemsCount: (state) => state.cart.reduce((sum, item) => sum + item.qty, 0),
    subtotalAmount: (state) => state.cart.reduce((sum, item) => sum + (item.sell_price * item.qty), 0),
    totalAmount: (state) => {
      const sub = state.cart.reduce((sum, item) => sum + (item.sell_price * item.qty), 0);
      const afterDiscount = Math.max(0, sub - state.discount);
      return afterDiscount + state.shippingFee;
    },
    changeAmount: (state) => {
      const total = state.cart.reduce((sum, item) => sum + (item.sell_price * item.qty), 0) - state.discount + state.shippingFee;
      return Math.max(0, state.tenderedAmount - total);
    }
  },

  actions: {
    initDefaultHistory() {
      if (this.transactionsHistory.length === 0) {
        const today = new Date().toISOString().slice(0, 10);
        this.transactionsHistory = [
          {
            id: 1,
            transaction_no: '8FC126081500000001',
            cashier_name: 'bien',
            order_type: 'DINE-IN (1 Pax)',
            total_items: 3,
            subtotal: 39000,
            discount: 0,
            shipping_fee: 0,
            tax: 0,
            total_amount: 39000,
            payment_method: 'CASH',
            tendered_amount: 50000,
            change_amount: 11000,
            status: 'SUKSES',
            created_at: `${today} 14:20:11`,
            date_str: today,
            month_str: today.slice(0, 7),
            items: [{ id: 1, name: 'Baso Aci', sell_price: 13000, qty: 3 }]
          },
          {
            id: 2,
            transaction_no: '8FC126081500000002',
            cashier_name: 'Siti Rahma',
            order_type: 'TAKEAWAY',
            total_items: 2,
            subtotal: 43000,
            discount: 0,
            shipping_fee: 0,
            tax: 0,
            total_amount: 43000,
            payment_method: 'QRIS_BCA',
            tendered_amount: 43000,
            change_amount: 0,
            status: 'SUKSES',
            created_at: `${today} 16:45:00`,
            date_str: today,
            month_str: today.slice(0, 7),
            items: [
              { id: 2, name: 'Ayam Goreng Sambal Ijo', sell_price: 25000, qty: 1 },
              { id: 4, name: 'Kopi Susu Gula Aren', sell_price: 18000, qty: 1 }
            ]
          }
        ];
        this.saveTransactions();
      }

      if (this.cashFlowHistory.length === 0) {
        const today = new Date().toISOString().slice(0, 10);
        this.cashFlowHistory = [
          {
            id: 1,
            date: `${today} 09:00`,
            type: 'Kas Masuk',
            amount: 500000,
            cashier: 'bien',
            notes: 'Modal awal laci kasir (Float balance)',
            date_str: today,
            month_str: today.slice(0, 7)
          },
          {
            id: 2,
            date: `${today} 18:00`,
            type: 'Kas Keluar',
            amount: 50000,
            cashier: 'bien',
            notes: 'Beli galon air minum resto',
            date_str: today,
            month_str: today.slice(0, 7)
          }
        ];
        this.saveCashFlow();
      }
    },

    saveTransactions() {
      localStorage.setItem('bien_pos_transactions', JSON.stringify(this.transactionsHistory));
    },

    saveCashFlow() {
      localStorage.setItem('bien_pos_cashflow', JSON.stringify(this.cashFlowHistory));
    },

    addToCart(product) {
      const existing = this.cart.find(item => item.id === product.id);
      if (existing) {
        existing.qty += 1;
      } else {
        this.cart.push({ ...product, qty: 1 });
      }
    },

    updateQty(productId, delta) {
      const item = this.cart.find(i => i.id === productId);
      if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
          this.removeFromCart(productId);
        }
      }
    },

    removeFromCart(productId) {
      this.cart = this.cart.filter(i => i.id !== productId);
    },

    clearCart() {
      this.cart = [];
      this.discount = 0;
      this.shippingFee = 0;
      this.orderNotes = '';
    },

    setOrderType(type) {
      this.orderType = type;
    },

    openPaymentModal() {
      if (this.cart.length === 0) return;
      this.tenderedAmount = this.totalAmount;
      this.isPaymentModalOpen = true;
    },

    closePaymentModal() {
      this.isPaymentModalOpen = false;
    },

    setTenderedAmount(amount) {
      this.tenderedAmount = Number(amount);
    },

    appendNumpad(val) {
      const currentStr = String(this.tenderedAmount || 0);
      if (val === 'C') {
        this.tenderedAmount = 0;
      } else if (val === '00') {
        if (currentStr === '0') return;
        this.tenderedAmount = Number(currentStr + '00');
      } else {
        if (currentStr === '0') {
          this.tenderedAmount = Number(val);
        } else {
          this.tenderedAmount = Number(currentStr + val);
        }
      }
    },

    async submitPayment() {
      const now = new Date();
      const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
      const fullDateStr = now.toISOString().slice(0, 10);
      const fullMonthStr = now.toISOString().slice(0, 7);
      const randomId = Math.floor(100000000 + Math.random() * 900000000);
      const txNo = `8FC${dateStr}${randomId}`;

      const payload = {
        order_type: this.orderType,
        items: [...this.cart],
        subtotal: this.subtotalAmount,
        discount: this.discount,
        shipping_fee: this.shippingFee,
        total_amount: this.totalAmount,
        payment_method: this.selectedPaymentMethod,
        tendered_amount: this.tenderedAmount,
        change_amount: this.changeAmount,
        cashier_name: this.cashierName
      };

      let txData = null;

      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          txData = await response.json();
        }
      } catch (e) {
        console.warn('API Endpoint backend offline, menggunakan hasil transaksi lokal', e);
      }

      if (!txData) {
        txData = {
          id: Date.now(),
          transaction_no: txNo,
          ...payload,
          status: 'SUKSES',
          created_at: now.toLocaleString('id-ID'),
          date_str: fullDateStr,
          month_str: fullMonthStr
        };
      } else {
        txData.date_str = fullDateStr;
        txData.month_str = fullMonthStr;
      }

      // Append to persistent transactions history
      this.transactionsHistory.unshift(txData);
      this.saveTransactions();

      this.activeTransaction = txData;
      this.isPaymentModalOpen = false;
      this.isReceiptModalOpen = true;

      // Automatically deduct product stock quantity based on items sold
      const productStore = useProductStore();
      productStore.deductStock(this.cart);

      // Automatically clear cart items & reset cashier page state to initial condition
      this.clearCart();

      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (err) {}
    },

    addCashFlowEntry(entry) {
      const now = new Date();
      const fullDateStr = now.toISOString().slice(0, 10);
      const fullMonthStr = now.toISOString().slice(0, 7);

      const newEntry = {
        id: Date.now(),
        date: now.toLocaleString('id-ID'),
        date_str: fullDateStr,
        month_str: fullMonthStr,
        cashier: this.cashierName,
        ...entry
      };

      this.cashFlowHistory.unshift(newEntry);
      this.saveCashFlow();
    },

    async closeShiftAndTrackCommission(notes = '') {
      const now = new Date();
      const shiftNo = `SHIFT-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

      // Calculate shift metrics from today's transactions for this cashier
      const todayStr = now.toISOString().slice(0, 10);
      const shiftTx = this.transactionsHistory.filter(tx => (tx.cashier_name === this.cashierName || tx.cashier === this.cashierName) && (tx.date_str === todayStr || tx.created_at?.includes(todayStr)));

      const totalSales = shiftTx.reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
      const cashSales = shiftTx.filter(tx => tx.payment_method === 'CASH').reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
      const qrisSales = shiftTx.filter(tx => tx.payment_method?.includes('QRIS')).reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
      const transferSales = shiftTx.filter(tx => tx.payment_method === 'TRANSFER' || tx.payment_method === 'DEBIT').reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
      const taxAmount = shiftTx.reduce((sum, tx) => sum + (tx.tax || 0), 0);
      const voidCount = shiftTx.filter(tx => tx.status === 'VOID' || tx.status === 'DIBATALKAN').length;
      const voidTotal = shiftTx.filter(tx => tx.status === 'VOID' || tx.status === 'DIBATALKAN').reduce((sum, tx) => sum + (tx.total_amount || 0), 0);
      
      // Commission rate (10% of shift sales)
      const commissionEarned = Math.round(totalSales * 0.10);

      const closingData = {
        id: Date.now(),
        shift_no: shiftNo,
        employee_name: this.cashierName,
        start_time: `${todayStr} 08:00:00`,
        end_time: now.toLocaleString('id-ID'),
        total_sales: totalSales,
        cash_sales: cashSales,
        qris_sales: qrisSales,
        transfer_sales: transferSales,
        tax_amount: taxAmount,
        void_count: voidCount,
        void_total: voidTotal,
        commission_earned: commissionEarned,
        notes: notes || 'Penutupan Shift Reguler',
        created_at: now.toLocaleString('id-ID')
      };

      try {
        await fetch('/api/shift-closings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(closingData)
        });
      } catch (err) {
        console.warn('API shift-closings offline, saving locally');
      }

      // Save locally
      const savedClosings = JSON.parse(localStorage.getItem('bien_pos_shift_closings') || '[]');
      savedClosings.unshift(closingData);
      localStorage.setItem('bien_pos_shift_closings', JSON.stringify(savedClosings));

      return closingData;
    },

    startNewTransaction() {
      this.clearCart();
      this.isReceiptModalOpen = false;
      this.activeTransaction = null;
    }
  }
});

