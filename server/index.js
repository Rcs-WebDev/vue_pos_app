import express from 'express';
import cors from 'cors';
import { pool, isConnected } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Fallback Seed Data when MySQL is offline
let mockCategories = [
  { id: 1, name: 'Makanan', slug: 'makanan' },
  { id: 2, name: 'Minuman', slug: 'minuman' },
  { id: 3, name: 'Cemilan', slug: 'cemilan' },
  { id: 4, name: 'Paket Hemat', slug: 'paket-hemat' }
];

let mockProducts = [
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

let mockTransactions = [];
let transactionCounter = 1;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mysqlConnected: isConnected,
    timestamp: new Date().toISOString()
  });
});

// Categories
app.get('/api/categories', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
      return res.json(rows);
    } catch (e) {
      console.error(e);
    }
  }
  res.json(mockCategories);
});

// Products
app.get('/api/products', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        ORDER BY p.id ASC
      `);
      return res.json(rows);
    } catch (e) {
      console.error(e);
    }
  }
  res.json(mockProducts);
});

app.post('/api/products', async (req, res) => {
  const productData = req.body;
  if (isConnected) {
    try {
      const [result] = await pool.query(
        `INSERT INTO products (category_id, name, variant, sku, barcode, stock_qty, unit, cost_price, sell_price, online_price, available_online_date, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.category_id || 1,
          productData.name,
          productData.variant || '',
          productData.sku || '',
          productData.barcode || '',
          productData.stock_qty || 0,
          productData.unit || 'Pcs',
          productData.cost_price || 0,
          productData.sell_price || 0,
          productData.online_price || 0,
          productData.available_online_date || null,
          productData.image_url || ''
        ]
      );
      return res.status(201).json({ id: result.insertId, ...productData });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const newProduct = {
    id: mockProducts.length + 1,
    ...productData
  };
  mockProducts.push(newProduct);
  res.status(201).json(newProduct);
});

// Update Product Details
app.put('/api/products/:id', async (req, res) => {
  const prodId = parseInt(req.params.id);
  const data = req.body;
  if (isConnected) {
    try {
      await pool.query(
        `UPDATE products SET 
          category_id=?, name=?, variant=?, sku=?, barcode=?, stock_qty=?, unit=?, 
          cost_price=?, sell_price=?, online_price=?, image_url=? 
         WHERE id=?`,
        [
          data.category_id || 1,
          data.name,
          data.variant || '',
          data.sku || '',
          data.barcode || '',
          data.stock_qty || 0,
          data.unit || 'Pcs',
          data.cost_price || 0,
          data.sell_price || 0,
          data.online_price || 0,
          data.image_url || '',
          prodId
        ]
      );
      return res.json({ id: prodId, ...data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const idx = mockProducts.findIndex(p => p.id === prodId);
  if (idx !== -1) {
    mockProducts[idx] = { ...mockProducts[idx], ...data };
    return res.json(mockProducts[idx]);
  }
  res.status(404).json({ error: 'Product not found' });
});

// Update Product Stock Qty
app.put('/api/products/:id/stock', async (req, res) => {
  const prodId = parseInt(req.params.id);
  const { stock_qty } = req.body;
  if (isConnected) {
    try {
      await pool.query('UPDATE products SET stock_qty=? WHERE id=?', [stock_qty, prodId]);
      return res.json({ id: prodId, stock_qty });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const prod = mockProducts.find(p => p.id === prodId);
  if (prod) {
    prod.stock_qty = stock_qty;
    return res.json(prod);
  }
  res.status(404).json({ error: 'Product not found' });
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  const prodId = parseInt(req.params.id);
  if (isConnected) {
    try {
      await pool.query('DELETE FROM products WHERE id=?', [prodId]);
      return res.json({ success: true, id: prodId });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const idx = mockProducts.findIndex(p => p.id === prodId);
  if (idx !== -1) {
    mockProducts.splice(idx, 1);
    return res.json({ success: true, id: prodId });
  }
  res.status(404).json({ error: 'Product not found' });
});

// Reorder Products
app.post('/api/products/reorder', async (req, res) => {
  const { orderedIds } = req.body;
  if (Array.isArray(orderedIds)) {
    if (isConnected) {
      try {
        for (let i = 0; i < orderedIds.length; i++) {
          await pool.query('UPDATE products SET id=? WHERE id=?', [orderedIds[i], orderedIds[i]]);
        }
      } catch (e) {
        console.warn('Reorder DB error:', e.message);
      }
    }

    // Reorder mock array to match
    const newMockList = [];
    orderedIds.forEach(id => {
      const item = mockProducts.find(p => p.id === id);
      if (item) newMockList.push(item);
    });
    // append any missing items
    mockProducts.forEach(item => {
      if (!newMockList.find(p => p.id === item.id)) {
        newMockList.push(item);
      }
    });
    mockProducts = newMockList;
  }
  res.json({ success: true, products: mockProducts });
});


let mockEmployees = [
  { id: 1, name: 'bien', role: 'Supervisor / Manager', email: 'bien@pos-store.id', phone: '081234567890', branch: 'Kantor Cabang Yogyakarta', status: 'Aktif' },
  { id: 2, name: 'Riky', role: 'POS Staff', email: 'riky@pos-store.id', phone: '081298765432', branch: 'Kantor Cabang Yogyakarta', status: 'Aktif' },
  { id: 3, name: 'Bambang', role: 'POS Staff', email: 'bambang@pos-store.id', phone: '081311223344', branch: 'Outlet Utama', status: 'Aktif' },
  { id: 4, name: 'Rina', role: 'POS Staff Senior', email: 'rina@pos-store.id', phone: '081344556677', branch: 'Outlet Utama', status: 'Aktif' }
];

let mockAttendances = [
  { id: 1, employee_id: 1, employee_name: 'Arif Rahman', check_in: '2026-08-15 08:55:00', status: 'Masuk', location: 'Kantor Cabang Yogyakarta', created_at: '2026-08-15 08:55:00' }
];

let mockInventoryMovements = [
  { id: 1, product_id: 1, sku: 'MAKAN-001', product_name: 'Baso Aci Kuah Pedas', movement_type: 'Masuk (Stok Masuk)', qty_change: 50, balance_after: 150, ref_no: 'IN22031500000182', created_at: '2026-08-15 12:00:00' },
  { id: 2, product_id: 1, sku: 'MAKAN-001', product_name: 'Baso Aci Kuah Pedas', movement_type: 'Keluar (Penjualan Kasir)', qty_change: -3, balance_after: 147, ref_no: '8FC126081500000001', created_at: '2026-08-15 18:20:00' }
];

let mockShiftClosings = [
  { id: 1, shift_no: 'SHIFT-20260815-01', employee_name: 'Riky', start_time: '2026-08-15 08:00:00', end_time: '2026-08-15 16:00:00', total_sales: 12500000, cash_sales: 7500000, qris_sales: 5000000, transfer_sales: 0, tax_amount: 1250000, void_count: 1, void_total: 39000, commission_earned: 1250000, created_at: '2026-08-15 16:00:00' }
];

// Employees API
app.get('/api/employees', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM employees ORDER BY id ASC');
      return res.json(rows);
    } catch (e) { console.error(e); }
  }
  res.json(mockEmployees);
});

app.post('/api/employees', async (req, res) => {
  const { name, role, email, phone, branch, status } = req.body;
  if (isConnected) {
    try {
      const [result] = await pool.query(
        'INSERT INTO employees (name, role, email, phone, status) VALUES (?, ?, ?, ?, ?)',
        [name, role || 'Kasir', email || '', phone || '', status || 'Aktif']
      );
      return res.status(201).json({ id: result.insertId, ...req.body });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  const newEmp = { id: mockEmployees.length + 1, name, role: role || 'Kasir', email: email || '', phone: phone || '', branch: branch || 'Outlet Utama', status: status || 'Aktif' };
  mockEmployees.push(newEmp);
  res.status(201).json(newEmp);
});

app.put('/api/employees/:id', async (req, res) => {
  const empId = parseInt(req.params.id);
  const { name, role, email, phone, branch, status } = req.body;
  if (isConnected) {
    try {
      await pool.query(
        'UPDATE employees SET name=?, role=?, email=?, phone=?, status=? WHERE id=?',
        [name, role, email, phone, status, empId]
      );
      return res.json({ id: empId, ...req.body });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  const idx = mockEmployees.findIndex(e => e.id === empId);
  if (idx !== -1) {
    mockEmployees[idx] = { ...mockEmployees[idx], name, role, email, phone, branch, status };
    return res.json(mockEmployees[idx]);
  }
  res.status(404).json({ error: 'Employee not found' });
});

// Attendances API
app.get('/api/attendances', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM attendances ORDER BY id DESC');
      return res.json(rows);
    } catch (e) { console.error(e); }
  }
  res.json(mockAttendances);
});

app.post('/api/attendances', async (req, res) => {
  const { employee_id, employee_name, check_in, status, photo_url, location } = req.body;
  if (isConnected) {
    try {
      const [result] = await pool.query(
        'INSERT INTO attendances (employee_id, employee_name, check_in, status, photo_url, location) VALUES (?, ?, ?, ?, ?, ?)',
        [employee_id || 1, employee_name, check_in || new Date(), status || 'Masuk', photo_url || '', location || 'Kantor Cabang Yogyakarta']
      );
      return res.status(201).json({ id: result.insertId, ...req.body });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  const newAtt = { id: mockAttendances.length + 1, employee_id: employee_id || 1, employee_name, check_in: check_in || new Date().toISOString(), status: status || 'Masuk', photo_url: photo_url || '', location: location || 'Kantor Cabang Yogyakarta', created_at: new Date().toISOString() };
  mockAttendances.unshift(newAtt);
  res.status(201).json(newAtt);
});

// Inventory Movements API
app.get('/api/inventory/movements', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM inventory_movements ORDER BY id DESC LIMIT 100');
      return res.json(rows);
    } catch (e) { console.error(e); }
  }
  res.json(mockInventoryMovements);
});

app.post('/api/inventory/movements', async (req, res) => {
  const { product_id, sku, product_name, movement_type, qty_change, balance_after, ref_no } = req.body;
  if (isConnected) {
    try {
      const [result] = await pool.query(
        'INSERT INTO inventory_movements (product_id, sku, product_name, movement_type, qty_change, balance_after, ref_no) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [product_id, sku || '', product_name, movement_type, qty_change, balance_after, ref_no || '']
      );
      return res.status(201).json({ id: result.insertId, ...req.body });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  const newMvt = { id: mockInventoryMovements.length + 1, product_id, sku: sku || '', product_name, movement_type, qty_change, balance_after, ref_no: ref_no || '', created_at: new Date().toISOString() };
  mockInventoryMovements.unshift(newMvt);
  res.status(201).json(newMvt);
});

// Shift Closings API
app.get('/api/shift-closings', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM shift_closings ORDER BY id DESC');
      return res.json(rows);
    } catch (e) { console.error(e); }
  }
  res.json(mockShiftClosings);
});

app.post('/api/shift-closings', async (req, res) => {
  const closingData = req.body;
  if (isConnected) {
    try {
      const [result] = await pool.query(
        `INSERT INTO shift_closings (shift_no, employee_name, start_time, end_time, total_sales, cash_sales, qris_sales, transfer_sales, tax_amount, void_count, void_total, commission_earned, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          closingData.shift_no || `SHIFT-${Date.now()}`,
          closingData.employee_name || 'bien',
          closingData.start_time || new Date(),
          closingData.end_time || new Date(),
          closingData.total_sales || 0,
          closingData.cash_sales || 0,
          closingData.qris_sales || 0,
          closingData.transfer_sales || 0,
          closingData.tax_amount || 0,
          closingData.void_count || 0,
          closingData.void_total || 0,
          closingData.commission_earned || 0,
          closingData.notes || ''
        ]
      );
      return res.status(201).json({ id: result.insertId, ...closingData });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
  const newClosing = { id: mockShiftClosings.length + 1, ...closingData, created_at: new Date().toISOString() };
  mockShiftClosings.unshift(newClosing);
  res.status(201).json(newClosing);
});

// Transactions Checkout Endpoint
app.post('/api/transactions', async (req, res) => {
  const {
    order_type,
    items,
    subtotal,
    discount,
    shipping_fee,
    tax,
    total_amount,
    payment_method,
    tendered_amount,
    change_amount,
    cashier_name
  } = req.body;

  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randNum = String(transactionCounter++).padStart(9, '0');
  const transaction_no = `8FC${dateStr}${randNum}`;

  if (isConnected) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [txResult] = await conn.query(
        `INSERT INTO transactions (transaction_no, cashier_name, order_type, total_items, subtotal, discount, shipping_fee, tax, total_amount, payment_method, tendered_amount, change_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          transaction_no,
          cashier_name || 'Bien',
          order_type || 'DINE-IN (1 Pax)',
          items.reduce((sum, i) => sum + i.qty, 0),
          subtotal,
          discount || 0,
          shipping_fee || 0,
          tax || 0,
          total_amount,
          payment_method,
          tendered_amount,
          change_amount
        ]
      );

      const txId = txResult.insertId;

      for (const item of items) {
        await conn.query(
          `INSERT INTO transaction_items (transaction_id, product_id, product_name, price, qty, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [txId, item.id, item.name, item.sell_price, item.qty, item.sell_price * item.qty]
        );

        // Deduct product stock
        await conn.query(
          `UPDATE products SET stock_qty = GREATEST(0, stock_qty - ?) WHERE id = ?`,
          [item.qty, item.id]
        );

        // Fetch remaining balance for movement log
        const [[pRow]] = await conn.query('SELECT stock_qty, sku FROM products WHERE id = ?', [item.id]);
        const remQty = pRow ? pRow.stock_qty : 0;
        const pSku = pRow ? pRow.sku : '';

        // Record stock movement
        await conn.query(
          `INSERT INTO inventory_movements (product_id, sku, product_name, movement_type, qty_change, balance_after, ref_no)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [item.id, pSku, item.name, 'Keluar (Penjualan Kasir)', -item.qty, remQty, transaction_no]
        );
      }

      await conn.commit();
      conn.release();

      return res.status(201).json({
        id: txId,
        transaction_no,
        total_amount,
        tendered_amount,
        change_amount,
        payment_method,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      await conn.rollback();
      conn.release();
      return res.status(500).json({ error: e.message });
    }
  }

  // Fallback Mock Transaction
  const newTx = {
    id: mockTransactions.length + 1,
    transaction_no,
    cashier_name: cashier_name || 'Bien',
    order_type: order_type || 'DINE-IN (1 Pax)',
    total_items: items.reduce((sum, i) => sum + i.qty, 0),
    subtotal,
    discount: discount || 0,
    shipping_fee: shipping_fee || 0,
    tax: tax || 0,
    total_amount,
    payment_method,
    tendered_amount,
    change_amount,
    items,
    created_at: new Date().toISOString()
  };

  // Reduce mock stock & create movement entry
  items.forEach(item => {
    const prod = mockProducts.find(p => p.id === item.id);
    if (prod) {
      prod.stock_qty = Math.max(0, prod.stock_qty - item.qty);
      mockInventoryMovements.unshift({
        id: mockInventoryMovements.length + 1,
        product_id: item.id,
        sku: prod.sku || '',
        product_name: item.name,
        movement_type: 'Keluar (Penjualan Kasir)',
        qty_change: -item.qty,
        balance_after: prod.stock_qty,
        ref_no: transaction_no,
        created_at: new Date().toISOString()
      });
    }
  });

  mockTransactions.unshift(newTx);
  res.status(201).json(newTx);
});

// Transactions list
app.get('/api/transactions', async (req, res) => {
  if (isConnected) {
    try {
      const [rows] = await pool.query('SELECT * FROM transactions ORDER BY id DESC LIMIT 100');
      return res.json(rows);
    } catch (e) {
      console.error(e);
    }
  }
  res.json(mockTransactions);
});

app.listen(PORT, () => {
  console.log(`[Bien POS API] Server running on http://localhost:${PORT}`);
});

