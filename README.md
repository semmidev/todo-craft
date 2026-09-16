# Technical Documentation — TodoCraft

Dokumentasi teknis untuk pengoperasian, konfigurasi environment, pengujian, dan arsitektur aplikasi **TodoCraft**.

---

## 🛠️ Tech Stack

- **Backend**: PHP 8.3+, Laravel 11 / 13, Laravel Fortify, Laravel Socialite, Laravel Passkeys
- **Frontend**: React 19, Inertia.js v3, TypeScript, Tailwind CSS v4, Radix UI, Framer Motion, Lucide Icons
- **Routing & Types**: Laravel Wayfinder (`@/actions`, `@/routes`)
- **Database & Query**: MySQL / PostgreSQL / SQLite, `spatie/laravel-query-builder`, `spatie/laravel-permission`, `spatie/laravel-activitylog`, `spatie/laravel-medialibrary`
- **Testing & Quality**: Pest PHP 5, Laravel Pint, PHPStan / Larastan

---

## 📋 Prasyarat Sistem

- **PHP** `>= 8.3` (ekstensi: `pdo`, `mbstring`, `openssl`, `bcmath`, `curl`)
- **Composer** `>= 2.6`
- **Node.js** `>= 20.x` & **npm** `>= 10.x`
- **Database Server**: MySQL 8.x / PostgreSQL 15+ / SQLite3

---

## ⚙️ Setup Environment & Pengoperasian Lokal

### 1. Instalasi Dependensi
```bash
composer install
npm install
```

### 2. Konfigurasi File `.env` & Application Key
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Konfigurasi Database & Migrasi
Sesuaikan kredensial database pada `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=todo_craft
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migrasi database beserta seeder:
```bash
php artisan migrate:fresh --seed
```

### 4. Menjalankan Development Server
Perintah terpadu untuk menjalankan HTTP Server & Vite Dev Server:
```bash
php artisan dev
# ATAU
npm run dev
```

Aplikasi berjalan di: `http://localhost:8000`.

---

## ⏰ Background Scheduler & Task Runner

### Command Pengingat Todo:
```bash
php artisan todos:send-reminders
```

### Menjalankan Scheduler (Dev Mode):
```bash
php artisan schedule:work
```
*(Scheduler mengeksekusi `todos:send-reminders` setiap menit untuk memproses queue notifikasi pengingat)*.

---

## 🧪 Perintah Testing & Code Quality

### Automated Testing (Pest):
```bash
php artisan test --compact
# ATAU
vendor/bin/pest
```

### Code Formatting (Laravel Pint):
```bash
vendor/bin/pint --dirty --format agent
```

### Static Analysis & Type Checking:
```bash
# TypeScript Type Check
npm run types:check

# PHPStan Static Analysis
vendor/bin/phpstan analyse
```

### Build Production Assets:
```bash
npm run build
```

---

## 📁 Struktur Arsitektur Project

```text
todo-craft/
├── app/
│   ├── Console/Commands/       # Custom Artisan Commands (SendTodoReminders)
│   ├── Data/                   # Data Transfer Objects (Spatie Laravel Data)
│   ├── Enums/                  # Application Enums (TeamRole, TodoPriority, dll)
│   ├── Http/Controllers/       # API & Inertia Controllers
│   ├── Models/                 # Eloquent Models & Relationships
│   └── Notifications/          # Database & Mail Notifications
├── database/
│   ├── factories/              # Database Factories
│   ├── migrations/             # Schema Migrations
│   └── seeders/                # Database Seeders
├── resources/
│   └── js/
│       ├── actions/            # Wayfinder Controller Action Types
│       ├── components/         # Shared React Components & UI Primitives
│       ├── layouts/            # App Layouts & Sidebar Templates
│       ├── pages/              # Inertia React Page Components
│       └── routes/             # Wayfinder Route Functions
├── routes/
│   ├── console.php             # Scheduled Artisan Commands
│   └── web.php                 # Web & API Endpoint Definitions
└── tests/
    └── Feature/                # Pest Automated Tests
```
