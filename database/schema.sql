-- Database Schema for Bien POS System (MySQL)

CREATE DATABASE IF NOT EXISTS bien_pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bien_pos;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  variant VARCHAR(100) DEFAULT '',
  sku VARCHAR(100) DEFAULT '',
  barcode VARCHAR(100) DEFAULT '',
  stock_qty INT DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'Pcs',
  cost_price DECIMAL(12, 2) DEFAULT 0.00,
  sell_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  online_price DECIMAL(12, 2) DEFAULT 0.00,
  available_online_date DATE DEFAULT NULL,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(100),
  points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'Kasir',
  email VARCHAR(100),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Transactions Header Table
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_no VARCHAR(100) NOT NULL UNIQUE,
  cashier_name VARCHAR(100) DEFAULT 'Bien',
  order_type VARCHAR(50) DEFAULT 'DINE-IN (1 Pax)',
  total_items INT NOT NULL DEFAULT 0,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(12, 2) DEFAULT 0.00,
  shipping_fee DECIMAL(12, 2) DEFAULT 0.00,
  tax DECIMAL(12, 2) DEFAULT 0.00,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) NOT NULL,
  tendered_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  change_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'SUKSES',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Transaction Items Table
CREATE TABLE IF NOT EXISTS transaction_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_id INT,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  subtotal DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. System Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Attendances Table
CREATE TABLE IF NOT EXISTS attendances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT,
  employee_name VARCHAR(150) NOT NULL,
  check_in DATETIME NOT NULL,
  check_out DATETIME DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'Masuk',
  photo_url TEXT,
  location VARCHAR(255) DEFAULT 'Kantor Cabang Utama',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Inventory Movements Table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  sku VARCHAR(100),
  product_name VARCHAR(255) NOT NULL,
  movement_type VARCHAR(100) NOT NULL,
  qty_change INT NOT NULL,
  balance_after INT NOT NULL,
  ref_no VARCHAR(100) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Employee Shift Closings & Commission Tracking Table
CREATE TABLE IF NOT EXISTS shift_closings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  shift_no VARCHAR(100) NOT NULL UNIQUE,
  employee_name VARCHAR(150) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  total_sales DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  cash_sales DECIMAL(12, 2) DEFAULT 0.00,
  qris_sales DECIMAL(12, 2) DEFAULT 0.00,
  transfer_sales DECIMAL(12, 2) DEFAULT 0.00,
  tax_amount DECIMAL(12, 2) DEFAULT 0.00,
  void_count INT DEFAULT 0,
  void_total DECIMAL(12, 2) DEFAULT 0.00,
  commission_earned DECIMAL(12, 2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

