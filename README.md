# Bien Point of Sale (POS) App

Aplikasi Kasir (POS) modern berbasis Vue 3, Pinia, Element Plus, dan Express Backend.

## 🔐 Kredensial Rahasia & Hak Akses User (Authentication)

Berikut adalah daftar peran (roles) dan kata sandi (passwords) untuk masuk ke aplikasi POS:

| Peran (Role) | Username / Jabatan | Password | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Manager** | `manager` | `manager123` | **Akses Penuh** (Dapat mengubah persentase komisi di Pengaturan, manajemen karyawan, laporan, transaksi, dll.) |
| **Staff** | `staff` | `staff123` | **Akses Terbatas** (Dapat melakukan transaksi kasir, absensi, dll., **TIDAK BISA** mengubah persentase komisi di Pengaturan) |

---

## 🌐 Fitur Bahasa (Internationalization / i18n)

Aplikasi dilengkapi dengan pengubah bahasa cepat pada **Navbar** (Top Header) untuk:
- 🇮🇩 **Bahasa Indonesia (ID)**
- 🇬🇧 **English (EN)**

---

## 🚀 Memulai Aplikasi

```bash
# Install dependencies
npm install

# Jalankan Frontend Dev Server
npm run dev

# Jalankan Backend API Server (Opsional / Standalone Backend)
npm run server
```


