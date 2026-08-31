-- Initial Data Seed for Bien POS

USE bien_pos;

-- Insert Categories
INSERT INTO categories (id, name, slug) VALUES
(1, 'Makanan', 'makanan'),
(2, 'Minuman', 'minuman'),
(3, 'Cemilan', 'cemilan'),
(4, 'Paket Hemat', 'paket-hemat')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Initial Products (including Baso Aci matching screenshot)
INSERT INTO products (id, category_id, name, variant, sku, barcode, stock_qty, unit, cost_price, sell_price, online_price, available_online_date, image_url) VALUES
(1, 1, 'Baso Aci', 'Spesial Kuah Pedas', 'MAKAN-001', '8991001001', 150, 'Porsi', 8000.00, 13000.00, 13000.00, '2026-08-15', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80'),
(2, 1, 'Ayam Goreng Sambal Ijo', 'Dada / Paha', 'MAKAN-002', '8991001002', 85, 'Porsi', 15000.00, 25000.00, 27000.00, '2026-08-15', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80'),
(3, 1, 'Nasi Goreng Spesial', 'Komplit Telur + Sosis', 'MAKAN-003', '8991001003', 120, 'Porsi', 12000.00, 22000.00, 24000.00, '2026-08-15', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=400&q=80'),
(4, 2, 'Kopi Susu Gula Aren', 'Less Ice', 'MINUM-001', '8991002001', 200, 'Gelas', 8000.00, 18000.00, 20000.00, '2026-08-15', 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80'),
(5, 2, 'Es Teh Manis', 'Dingin', 'MINUM-002', '8991002002', 300, 'Gelas', 1500.00, 5000.00, 6000.00, '2026-08-15', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=400&q=80'),
(6, 3, 'Roti Bakar Coklat Keju', 'Porsi Besar', 'CEMIL-001', '8991003001', 95, 'Porsi', 10000.00, 16000.00, 18000.00, '2026-08-15', 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bff?auto=format&fit=crop&w=400&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert Sample Employees
INSERT INTO employees (id, name, role, email, phone, status) VALUES
(1, 'Bien', 'Pemilik / Manager', 'bien@pos-store.id', '081234567890', 'Aktif'),
(2, 'Siti Rahma', 'Kasir Senior', 'siti@pos-store.id', '081298765432', 'Aktif'),
(3, 'Budi Santoso', 'Staf Dapur', 'budi@pos-store.id', '081311223344', 'Aktif')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Insert System Settings
INSERT INTO settings (setting_key, setting_value) VALUES
('store_name', 'bien'),
('store_tagline', 'Resto & Cafe Point of Sale'),
('tax_rate', '0'),
('currency', 'Rp'),
('receipt_footer', 'Terima kasih atas kunjungan Anda!')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);
