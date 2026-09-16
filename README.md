# 📝 TodoCraft — Modern Team Task & Reminder Platform

**TodoCraft** adalah aplikasi manajemen tugas (*Todo & Task Management*) modern berbasis tim yang dilengkapi dengan fitur kolaborasi, pengingat otomatis ala *Google Calendar*, serta sistem **In-App Notifications** interaktif secara real-time.

Aplikasi ini dibangun menggunakan arsitektur monolitik modern berbasis **Laravel**, **Inertia.js v3**, **React 19**, **TypeScript**, dan **Tailwind CSS v4**.

---

## ✨ Fitur Utama

### 👥 1. Manajemen Tim & Kolaborasi (*Multi-Tenant*)
- **Pembuatan & Perpindahan Tim**: Pengguna dapat membuat beberapa tim dan beralih antar tim (*Team Switcher*).
- **Manajemen Anggota**: Daftar anggota tim berbasis *Database Querying* dengan fitur pencarian instan (*Debounced 350ms*), filter peran, pengurutan kolom, dan paginasi.
- **Sistem Peran & Izin**: Peran hirarkis (*Owner*, *Admin*, *Member*) menggunakan `spatie/laravel-permission`.
- **Undangan Tim & Modal Interaktif**: Fitur kirim undangan via email dan modal konfirmasi gabung tim (*Pending Invitations Modal*).

### 📋 2. Manajemen Tugas & Todo
- **Status & Prioritas**: Pengelolaan status (*Pending*, *In Progress*, *Completed*, *Archived*) dan prioritas (*Low*, *Medium*, *High*, *Urgent*).
- **Pengingat Ala Google Calendar**: Set pengingat fleksibel (pada saat tenggat, 15 menit, 30 menit, 1 jam, 1 hari, 2 hari, atau 1 minggu sebelum deadline).
- **Penanggung Jawab & Kategori**: Penugasan tugas ke anggota tim tertentu serta pengelompokan kategori dengan warna dan ikon kustom.
- **Subtugas & Lampiran Berkas**: Checklist item subtugas dan *presigned file uploads* (Spatie MediaLibrary / AWS S3).
- **Keyboard Shortcuts**: Pintasan keyboard (misal: tombol `c` untuk membuka modal pembuatan todo).

### 🔔 3. Sistem Notifikasi In-App & Pengingat Otomatis
- **Pengiriman Pengingat Otomatis**: Artisan Command `todos:send-reminders` yang berjalan setiap menit via scheduler untuk memeriksa dan mengirim notifikasi pengingat ke pengguna.
- **Bell Top Bar & Lonceng Interaktif**: Lonceng notifikasi di header utama aplikasi dengan *unread count badge*, pembaruan berkala, serta aksi cepat *Tandai Semua Dibaca*.
- **Integrasi Modal Langsung**: Mengklik notifikasi undangan tim akan langsung memunculkan modal persetujuan bergabung.
- **Pusat Notifikasi (`/notifications`)**: Halaman khusus untuk mengelola seluruh notifikasi dengan filter tab (*Semua*, *Belum Dibaca*), penanda dibaca, dan penghapusan.

### 🔐 4. Autentikasi & Keamanan Tingkat Tinggi
- **Laravel Fortify**: Login, Registrasi, Lupa Password, Verifikasi Email, dan Konfirmasi Password.
- **Google Socialite**: Autentikasi mudah menggunakan akun Google.
- **Two-Factor Authentication (2FA)**: Kode QR 2FA dan recovery codes.
- **Passkeys (WebAuthn)**: Autentikasi modern berbasis biometrik/hardware passkey.

---

## 🛠️ Teknologi Utama (*Tech Stack*)

- **Backend Framework**: [Laravel 11 / 13](https://laravel.com) (PHP 8.3+)
- **Frontend SPA Integration**: [Inertia.js v3](https://inertiajs.com) (React 19, TypeScript)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com), [Radix UI Components](https://www.radix-ui.com), [Framer Motion](https://www.framer.com/motion/), Lucide Icons
- **Autentikasi**: Laravel Fortify, Laravel Socialite, Laravel Passkeys
- **Routing & Types**: [Laravel Wayfinder](https://github.com/laravel/wayfinder) (Auto-generated TypeScript functions for Laravel routes)
- **Database & Query**: MySQL / PostgreSQL / SQLite, `spatie/laravel-query-builder`, `spatie/laravel-permission`
- **Pengujian & Formatter**: [Pest PHP 5](https://pestphp.com), [Laravel Pint](https://laravel.com/docs/pint)

---

## 📋 Prasyarat Sistem

Pastikan perangkat Anda telah terpasang kebutuhan berikut:
- **PHP** `>= 8.3` (dengan ekstensi `pdo`, `mbstring`, `openssl`, `bcmath`, `curl`)
- **Composer** `>= 2.6`
- **Node.js** `>= 20.x` & **npm** `>= 10.x`
- **Database Server**: MySQL 8.x / PostgreSQL 15+ / SQLite3

---

## ⚙️ Panduan Instalasi & Pengoperasian Lokal

### 1. Clone Repository & Masuk ke Direktori Project
```bash
git clone https://github.com/semmidev/todo-craft.git
cd todo-craft
```

### 2. Install Dependensi PHP & JavaScript
```bash
composer install
npm install
```

### 3. Salin File Konfigurasi Environment & Generate Key
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi Database pada `.env`
Buka file `.env` dan sesuaikan kredensial database Anda (contoh untuk MySQL):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=todo_craft
DB_USERNAME=root
DB_PASSWORD=
```
*(Jika menggunakan SQLite, buat file `database/database.sqlite` dan atur `DB_CONNECTION=sqlite`)*.

### 5. Jalankan Migrasi & Database Seeder
```bash
php artisan migrate:fresh --seed
```

### 6. Build Asset Frontend & Jalankan Development Server
Untuk menjalankan seluruh layanan secara bersamaan (Vite Dev Server + Laravel HTTP Server):
```bash
npm run dev
# ATAU jalankan perintah bawaan Laravel Artisan Dev:
php artisan dev
```

Aplikasi dapat diakses melalui browser di: `http://localhost:8000` (atau URL yang ditampilkan pada terminal).

---

## ⏰ Konfigurasi Scheduler Cron (Pengingat Todo)

Untuk menguji fitur pengingat tugas ala *Google Calendar*:

### Jalankan Command Pengingat Manual:
```bash
php artisan todos:send-reminders
```

### Jalankan Scheduler Laravel dalam Mode Dev:
```bash
php artisan schedule:work
```
*(Scheduler akan secara otomatis mengeksekusi `todos:send-reminders` setiap menit untuk mengecek tugas yang telah memasuki waktu pengingat)*.

---

## 🧪 Pengujian & Kualitas Kode

Aplikasi ini dilengkapi dengan suite pengujian otomatis berbasis **Pest PHP** dan pemformat kode **Laravel Pint**.

### Menjalankan Automated Feature & Unit Tests:
```bash
php artisan test --compact
# ATAU menggunakan pest secara langsung:
vendor/bin/pest
```

### Memeriksa dan Memperbaiki Format Kode PHP:
```bash
vendor/bin/pint --dirty --format agent
```

### Memeriksa Type Safety TypeScript:
```bash
npm run types:check
```

### Membangun Production Bundle Asset:
```bash
npm run build
```

---

## 📁 Struktur Direktori Utama

```text
todo-craft/
├── app/
│   ├── Console/Commands/       # Artisan Commands (SendTodoReminders.php)
│   ├── Data/                   # Spatie Laravel Data Objects
│   ├── Http/Controllers/       # Controller API & Inertia Controllers
│   ├── Models/                 # Eloquent Models (Todo, Team, User, Notification)
│   └── Notifications/          # Laravel Notification Classes (TodoReminder, TeamInvitation)
├── database/
│   ├── migrations/             # Database Schema Migrations
│   ├── factories/              # Model Factories untuk Testing
│   └── seeders/                # Database Seeders
├── resources/
│   └── js/
│       ├── actions/            # Typed Wayfinder Action Handlers
│       ├── components/         # Komponen UI React (NotificationDropdown, SearchableSelect, dll)
│       ├── layouts/            # App & Auth Layouts
│       ├── pages/              # Halaman-halaman Inertia React (todos, notifications, teams)
│       └── routes/             # Typed Wayfinder Route Helpers
├── routes/
│   ├── console.php             # Console Scheduler Routes (everyMinute)
│   └── web.php                 # Web Application Routes
└── tests/
    └── Feature/                # Pest Automated Feature Tests
```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE).
