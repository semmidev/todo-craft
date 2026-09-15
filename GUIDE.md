# Panduan Laravel Modern — Todo App

> **Untuk siapa?** Panduan ini ditulis khusus untuk kode yang ada di repository ini. Setiap contoh diambil langsung dari file nyata, bukan kode rekaan.

---

## Daftar Isi

1. [Struktur Folder](#1-struktur-folder)
2. [Urutan Eksekusi Request (Request Lifecycle)](#2-urutan-eksekusi-request)
3. [Service Provider — Jantung Aplikasi](#3-service-provider)
4. [Routing](#4-routing)
5. [Middleware](#5-middleware)
6. [Eloquent Model](#6-eloquent-model)
7. [Migrasi Database](#7-migrasi-database)
8. [Seeder & Factory](#8-seeder--factory)
9. [Policy & Otorisasi](#9-policy--otorisasi)
10. [Controller](#10-controller)
11. [Inertia.js + React (SPA tanpa API)](#11-inertiajs--react)
12. [Spatie Data — DTO Modern](#12-spatie-data)
13. [Spatie Permission — Role & Permission](#13-spatie-permission)
14. [Spatie MediaLibrary — Upload File](#14-spatie-medialibrary)
15. [Spatie ActivityLog — Audit Trail](#15-spatie-activitylog)
16. [Spatie QueryBuilder — Filter & Sort Otomatis](#16-spatie-querybuilder)
17. [Wayfinder — Type-safe Routes di Frontend](#17-wayfinder)
18. [PHP 8.x Modern Features](#18-php-8x-modern-features)
19. [Perintah Sehari-hari (Artisan & Makefile)](#19-perintah-sehari-hari)

---

## 1. Struktur Folder

```
todo-app/
├── app/                        ← Kode inti aplikasi kamu
│   ├── Actions/                ← Logika bisnis spesifik (Form Actions Fortify)
│   ├── Concerns/               ← PHP Trait yang reusable (GeneratesUniqueTeamSlugs)
│   ├── Console/                ← Artisan command custom
│   ├── Data/                   ← Spatie Data — DTO / transfer object (TodoData, CategoryData)
│   ├── Enums/                  ← PHP Enum modern (TeamRole, TeamPermission)
│   ├── Http/
│   │   ├── Controllers/        ← Controller HTTP
│   │   ├── Middleware/         ← Middleware (EnsureTeamMembership, HandleInertiaRequests)
│   │   ├── Requests/           ← Form Request (validasi terpusat)
│   │   └── Responses/          ← Custom response (mis. LoginResponse Fortify)
│   ├── Models/                 ← Eloquent Model (Todo, Category, Team, User, dll)
│   ├── Notifications/          ← Email / push notification
│   ├── Policies/               ← Otorisasi per-model (TodoPolicy, CategoryPolicy)
│   ├── Providers/              ← Service Provider (AppServiceProvider, FortifyServiceProvider)
│   └── Rules/                  ← Validasi custom
│
├── bootstrap/
│   ├── app.php                 ← Titik konfigurasi aplikasi (routing, middleware, exception)
│   └── providers.php           ← Daftar Service Provider yang aktif
│
├── config/                     ← File konfigurasi (horizon.php, permission.php, dll)
├── database/
│   ├── factories/              ← Factory untuk generate data testing
│   ├── migrations/             ← Skema database versi-terkontrol
│   └── seeders/                ← Data awal (RoleAndPermissionSeeder, TodoSeeder)
│
├── resources/
│   ├── css/                    ← Tailwind CSS
│   ├── js/
│   │   ├── actions/            ← AUTO-GENERATED oleh Wayfinder (jangan edit manual)
│   │   ├── components/         ← Komponen React reusable (AppSidebar, NavMain, dll)
│   │   ├── pages/              ← Halaman Inertia (todos/index.tsx, categories/index.tsx)
│   │   ├── routes/             ← AUTO-GENERATED oleh Wayfinder (jangan edit manual)
│   │   └── types/              ← TypeScript type definitions
│   └── views/
│       └── app.blade.php       ← Satu-satunya Blade template (shell untuk React)
│
├── routes/
│   ├── web.php                 ← Route utama aplikasi
│   ├── settings.php            ← Route pengaturan akun
│   └── console.php             ← Artisan scheduled commands
│
├── tests/
│   ├── Feature/                ← Test end-to-end (request → response)
│   └── Unit/                   ← Test unit logic terisolasi
│
├── vite.config.ts              ← Konfigurasi bundler frontend (Vite + plugins)
├── composer.json               ← Dependensi PHP
├── package.json                ← Dependensi JavaScript
└── Makefile                    ← Shortcut perintah developer
```

### Aturan penting

- **Jangan buat folder baru di root `app/`** tanpa diskusi — gunakan folder yang sudah ada.
- Folder `resources/js/actions/` dan `resources/js/routes/` di-_generate_ otomatis oleh Wayfinder — jangan edit manual.

---

## 2. Urutan Eksekusi Request

Ini adalah alur lengkap setiap kali browser mengirim request HTTP ke aplikasi:

```
Browser kirim request
        │
        ▼
  public/index.php          ← Entry point tunggal semua request
        │
        ▼
  bootstrap/app.php          ← Konfigurasi aplikasi dibaca:
                               - withRouting() → route web.php, console.php
                               - withMiddleware() → CSRF, web stack
                               - withExceptions() → error handling
        │
        ▼
  bootstrap/providers.php    ← Service Provider di-register & di-boot:
                               AppServiceProvider::register()
                               AppServiceProvider::boot()
                               FortifyServiceProvider::boot()
        │
        ▼
  routes/web.php             ← URL dicocokkan dengan route yang terdaftar
        │
        ▼
  Middleware Stack           ← Dijalankan secara berurutan:
  (Global → Group → Route)    1. HandleAppearance (tema dark/light)
                               2. HandleInertiaRequests (share data ke React)
                               3. AddLinkHeadersForPreloadedAssets
                               4. SetTeamUrlDefaults
                               5. auth (cek login)
                               6. verified (cek email verified)
                               7. EnsureTeamMembership (cek keanggotaan tim)
        │
        ▼
  Controller Method          ← Logika: authorize → query → return response
        │
        ▼
  Response                   ← Inertia::render() → kirim JSON ke React
                               atau redirect() → redirect ke URL lain
```

### Contoh nyata dari project ini

```
GET /{team-slug}/todos
        │
        ├─ Cocok dengan: Route::resource('todos', TodoController::class)
        ├─ Middleware: auth → verified → EnsureTeamMembership
        └─ Eksekusi: TodoController::index(Request $request, Team $currentTeam)
```

---

## 3. Service Provider

Service Provider adalah tempat kamu "mendaftarkan" dan "menginisialisasi" fitur aplikasi. Ada dua method utama:

- **`register()`** — Daftarkan binding ke Service Container. Dipanggil _sebelum_ semua provider lain di-boot.
- **`boot()`** — Inisialisasi setelah semua provider ter-register. Di sini kamu bisa menggunakan semua service yang sudah terdaftar.

### Contoh dari `AppServiceProvider.php`

```php
// app/Providers/AppServiceProvider.php

public function boot(): void
{
    // 1. Konfigurasi global defaults
    $this->configureDefaults();

    // 2. Setup S3 bucket lokal (RustFS)
    $this->ensureStorageBucketExists();
}
```

### Provider yang aktif di project ini

```php
// bootstrap/providers.php
return [
    AppServiceProvider::class,      // Konfigurasi utama app
    FortifyServiceProvider::class,  // Setup auth (login, register, 2FA)
];
```

> **Tip:** Ketika kamu install package baru lewat `composer require`, biasanya package otomatis mendaftarkan provider-nya sendiri via auto-discovery (lihat `composer.json` → `extra.laravel.dont-discover`).

---

## 4. Routing

### Dasar route

```php
// routes/web.php

// Route statis — langsung render halaman Inertia
Route::inertia('/', 'welcome')->name('home');

// Route dengan prefix + middleware + group
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {

        // Route resource otomatis buat 7 route sekaligus:
        // GET    /todos           → index
        // GET    /todos/create    → create
        // POST   /todos           → store
        // GET    /todos/{todo}    → show
        // GET    /todos/{todo}/edit → edit
        // PUT    /todos/{todo}    → update
        // DELETE /todos/{todo}    → destroy
        Route::resource('todos', TodoController::class);

        // Route resource terbatas — hanya index, store, update, destroy
        Route::resource('categories', CategoryController::class)
            ->except(['create', 'edit', 'show']);

        // Route custom di luar resource
        Route::patch('todos/{todo}/toggle-status', [TodoController::class, 'toggleStatus'])
            ->name('todos.toggle-status');
    });
```

### Route Model Binding

Laravel otomatis "resolve" model dari parameter URL. Jika URL mengandung `{todo}`, Laravel akan otomatis query `Todo::findOrFail($id)`.

Namun Team menggunakan `slug` bukan `id`:

```php
// app/Models/Team.php
public function getRouteKeyName(): string
{
    return 'slug'; // URL: /my-team/todos → query: Team::where('slug', 'my-team')->firstOrFail()
}
```

### Lihat semua route

```bash
php artisan route:list
php artisan route:list --name=todos  # filter berdasarkan nama
```

---

## 5. Middleware

Middleware adalah "penjaga" yang berjalan sebelum dan/atau sesudah request masuk ke controller.

### Middleware di project ini

| File                    | Fungsi                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `HandleInertiaRequests` | Share data global ke React (auth.user, currentTeam, teams) |
| `EnsureTeamMembership`  | Cek apakah user adalah anggota tim yang diakses            |
| `HandleAppearance`      | Simpan preferensi tema (dark/light) dari cookie            |
| `SetTeamUrlDefaults`    | Set default parameter `{current_team}` di semua route      |

### Cara kerja `EnsureTeamMembership`

```php
// app/Http/Middleware/EnsureTeamMembership.php

public function handle(Request $request, Closure $next, ?string $minimumRole = null): Response
{
    [$user, $team] = [$request->user(), $this->team($request)];

    // Jika user bukan anggota tim → 403 Forbidden
    abort_if(! $user || ! $team || ! $user->belongsToTeam($team), 403);

    // Cek role minimum jika ditentukan
    $this->ensureTeamMemberHasRequiredRole($user, $team, $minimumRole);

    // Jika user akses tim lain, switch currentTeam
    if ($request->route('current_team') && ! $user->isCurrentTeam($team)) {
        $user->switchTeam($team);
    }

    return $next($request);
}
```

### `HandleInertiaRequests` — jembatan PHP ke React

```php
// app/Http/Middleware/HandleInertiaRequests.php

public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'name'        => config('app.name'),         // Tersedia di semua halaman React
        'auth'        => ['user' => $user],           // Data user login
        'sidebarOpen' => ...,                         // State sidebar
        'currentTeam' => fn () => ...,                // Team aktif (lazy — hanya diload jika dipakai)
        'teams'       => fn () => ...,                // Semua tim user (lazy)
    ];
}
```

> **Penting:** Closure `fn () =>` di `share()` adalah **lazy prop** — hanya dieksekusi jika React benar-benar menggunakannya. Ini mencegah query database yang tidak perlu.

---

## 6. Eloquent Model

### Fillable vs Guarded

```php
// Cara 1: $fillable — whitelist kolom yang boleh diisi massal
protected $fillable = ['title', 'status', 'priority', 'due_date'];

// Cara 2: PHP 8 Attribute (dipakai di Team model)
#[Fillable(['name', 'slug', 'is_personal'])]
class Team extends Model { ... }

// Cara 3: $guarded = [] — izinkan semua kolom (hati-hati!)
protected $guarded = [];
```

### Casts — Konversi tipe otomatis

```php
// app/Models/Todo.php
protected function casts(): array
{
    return [
        'due_date'     => 'datetime',  // String DB → Carbon object
        'completed_at' => 'datetime',
    ];
}

// app/Models/Team.php
protected function casts(): array
{
    return [
        'is_personal' => 'boolean',  // 0/1 di DB → true/false di PHP
    ];
}
```

### Relasi Eloquent

```php
// app/Models/Todo.php

// Banyak Todo → satu Team
public function team(): BelongsTo
{
    return $this->belongsTo(Team::class);
}

// Satu Todo → banyak TodoItem
public function items(): HasMany
{
    return $this->hasMany(TodoItem::class)->orderBy('order');
}

// Todo → User (pembuat)
public function user(): BelongsTo
{
    return $this->belongsTo(User::class, 'user_id');
}

// Todo → User (yang di-assign, kolom berbeda)
public function assignee(): BelongsTo
{
    return $this->belongsTo(User::class, 'assigned_to_id');
}
```

### Many-to-Many dengan Pivot Custom

```php
// app/Models/Team.php

public function members(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'team_members', 'team_id', 'user_id')
        ->using(Membership::class)  // Pivot model custom
        ->withPivot(['role'])       // Include kolom 'role' dari tabel pivot
        ->withTimestamps();         // Include created_at, updated_at pivot
}
```

### Model Events & Hooks

```php
// app/Models/Team.php

protected static function boot(): void
{
    parent::boot();

    // Sebelum Team disimpan pertama kali → generate slug otomatis
    static::creating(function (Team $team) {
        if (empty($team->slug)) {
            $team->slug = static::generateUniqueTeamSlug($team->name);
        }
    });

    // Sebelum Team diupdate → regenerate slug jika nama berubah
    static::updating(function (Team $team) {
        if ($team->isDirty('name')) {
            $team->slug = static::generateUniqueTeamSlug($team->name, $team->id);
        }
    });
}
```

Event yang tersedia: `creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`, `restoring`, `restored`.

### Soft Delete

```php
use Illuminate\Database\Eloquent\SoftDeletes;

class Todo extends Model
{
    use SoftDeletes;
    // Kolom 'deleted_at' harus ada di migrasi (->softDeletes())
}

// Penggunaan:
$todo->delete();            // Set deleted_at, record masih ada di DB
$todo->forceDelete();       // Hapus permanen
Todo::withTrashed()->get(); // Include yang sudah dihapus
Todo::onlyTrashed()->get(); // Hanya yang sudah dihapus
$todo->restore();           // Kembalikan record
```

---

## 7. Migrasi Database

Migrasi adalah "version control" untuk skema database kamu.

```php
// database/migrations/2026_09_15_000002_create_todos_table.php

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('todos', function (Blueprint $table) {
            $table->id();                                          // bigint auto-increment PRIMARY KEY

            // Foreign key dengan constraint
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            // Artinya: kolom team_id INTEGER, referensi ke teams.id
            // cascadeOnDelete: jika team dihapus, todo ikut terhapus

            $table->foreignId('assigned_to_id')
                ->nullable()                // Boleh null
                ->constrained('users')      // Referensi ke tabel 'users' (bukan default)
                ->nullOnDelete();           // Jika user dihapus, set null (bukan hapus todo)

            $table->string('title');
            $table->text('description')->nullable();
            $table->string('status')->default('pending');
            $table->dateTime('due_date')->nullable();

            $table->timestamps();   // Tambah created_at dan updated_at
            $table->softDeletes();  // Tambah deleted_at (untuk soft delete)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('todos');
    }
};
```

### Perintah migrasi

```bash
php artisan migrate                 # Jalankan migrasi yang belum dijalankan
php artisan migrate:fresh           # DROP semua tabel lalu migrate ulang
php artisan migrate:fresh --seed    # Drop → migrate → seed (sering dipakai development)
php artisan migrate:rollback        # Batalkan migrasi terakhir
php artisan migrate:status          # Lihat status setiap migrasi
```

> ⚠️ **Di production, jangan pakai `migrate:fresh`** — data kamu akan hilang.
> Di production, Laravel sudah mencegah ini lewat `DB::prohibitDestructiveCommands(app()->isProduction())` di `AppServiceProvider`.

---

## 8. Seeder & Factory

### Seeder — data awal yang pasti ada

```php
// database/seeders/RoleAndPermissionSeeder.php

public function run(): void
{
    // Bersihkan cache permission Spatie
    app()[PermissionRegistrar::class]->forgetCachedPermissions();

    // Buat permission
    $permissions = ['view todos', 'create todos', 'edit todos', 'delete todos', ...];
    foreach ($permissions as $permission) {
        Permission::firstOrCreate(['name' => $permission]);
        // firstOrCreate: cari dulu, baru create jika belum ada → aman dijalankan berkali-kali
    }

    // Buat role dan assign permission
    $adminRole = Role::firstOrCreate(['name' => 'admin']);
    $adminRole->givePermissionTo(Permission::all());

    $memberRole = Role::firstOrCreate(['name' => 'member']);
    $memberRole->givePermissionTo(['view todos', 'create todos', 'edit todos']);
}
```

### Menjalankan seeder

```bash
php artisan db:seed                              # Jalankan DatabaseSeeder
php artisan db:seed --class=RoleAndPermissionSeeder  # Jalankan seeder tertentu
php artisan migrate:fresh --seed                 # Reset DB + seed ulang
```

### Factory — data acak untuk testing

Factory digunakan di test dan seeder untuk generate data realistis:

```php
// Contoh penggunaan di test
$user = User::factory()->create();
$team = Team::factory()->create();
$todo = Todo::factory()->count(10)->create(['team_id' => $team->id]);
```

---

## 9. Policy & Otorisasi

Policy adalah kelas PHP yang mengelompokkan semua logika otorisasi untuk satu model.

### Contoh dari `TodoPolicy`

```php
// app/Policies/TodoPolicy.php

class TodoPolicy
{
    // Siapa yang boleh melihat daftar todo?
    public function viewAny(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team)
            && $user->hasPermissionTo('view todos');
    }

    // Siapa yang boleh menghapus todo ini?
    public function delete(User $user, Todo $todo): bool
    {
        return $user->belongsToTeam($todo->team)
            && $user->hasPermissionTo('delete todos');
    }
}
```

### Cara pakai policy di controller

```php
// app/Http/Controllers/TodoController.php

public function index(Request $request, Team $currentTeam): Response
{
    // authorize(policy_method, [model_class, extra_param])
    $this->authorize('viewAny', [Todo::class, $currentTeam]);
    // Laravel otomatis cari TodoPolicy::viewAny($user, $currentTeam)
    // Jika return false → lempar 403 Forbidden
    ...
}

public function destroy(Team $currentTeam, Todo $todo): RedirectResponse
{
    // authorize(policy_method, model_instance)
    $this->authorize('delete', $todo);
    // Laravel otomatis cari TodoPolicy::delete($user, $todo)
    ...
}
```

> Laravel otomatis mendeteksi policy berdasarkan nama model. `TodoPolicy` → model `Todo`. Tidak perlu registrasi manual.

---

## 10. Controller

Controller di project ini **tidak punya constructor** dan **tidak inject dependency** — mengikuti pendekatan Laravel modern yang lean.

### Pola yang dipakai

```php
// app/Http/Controllers/TodoController.php

class TodoController extends Controller
{
    public function index(Request $request, Team $currentTeam): Response
    {
        // 1. Otorisasi — siapa yang boleh?
        $this->authorize('viewAny', [Todo::class, $currentTeam]);

        // 2. Query data dengan Spatie QueryBuilder
        $todos = QueryBuilder::for(Todo::class)
            ->where('team_id', $currentTeam->id)
            ->allowedFilters(...)
            ->allowedSorts(...)
            ->paginate(15)
            ->through(fn (Todo $todo) => TodoData::fromModel($todo));

        // 3. Return response Inertia
        return Inertia::render('todos/index', [
            'todos' => $todos,
            'stats' => [...],
        ]);
    }

    public function store(Request $request, Team $currentTeam): RedirectResponse
    {
        $this->authorize('create', [Todo::class, $currentTeam]);

        // Validasi lewat Spatie Data
        $data = TodoData::validate($request->all());

        $todo = Todo::create([...]);

        // Redirect kembali dengan flash message
        return back()->with('success', 'Todo created successfully.');
    }
}
```

### `back()` vs `redirect()->route()`

```php
return back();                          // Kembali ke halaman sebelumnya (Inertia-friendly)
return back()->with('success', '...');  // + flash message
return redirect()->route('todos.index', $currentTeam->slug);
return redirect()->back()->withErrors(['field' => 'Pesan error']);
```

---

## 11. Inertia.js + React

Inertia adalah "jembatan" antara Laravel (backend) dan React (frontend). Kamu **tidak membuat REST API** — Laravel langsung mengirim data ke React sebagai props.

### Cara kerja

```
1. Browser request /my-team/todos
2. Laravel (TodoController::index) → Inertia::render('todos/index', ['todos' => $todos])
3. Inertia kirim JSON: { component: 'todos/index', props: { todos: [...] } }
4. React render komponen todos/index dengan props tersebut
5. Navigasi berikutnya (klik link) → fetch JSON baru, React re-render
   (tanpa full page reload!)
```

### Render halaman dari PHP

```php
// Controller
return Inertia::render('todos/index', [
    'todos'       => $todos,
    'categories'  => $categories,
    'stats'       => $stats,
]);
// Komponen React: resources/js/pages/todos/index.tsx
```

### Komponen React menerima props

```tsx
// resources/js/pages/todos/index.tsx

interface Props {
    todos: PaginatedData<Todo>;
    categories: Category[];
    stats: { total: number; pending: number };
}

export default function TodosIndex({ todos, categories, stats }: Props) {
    return <div>...</div>;
}
```

### Navigasi dengan Inertia Link

```tsx
import { Link } from '@inertiajs/react';

<Link href="/my-team/todos">Lihat Todos</Link>;
// Tidak reload halaman penuh — hanya fetch props baru
```

### Submit form dengan Inertia

```tsx
import { useForm } from '@inertiajs/react';

const form = useForm({ title: '', status: 'pending' });

form.post('/my-team/todos', {
    onSuccess: () => form.reset(),
});
```

### Data global yang selalu tersedia (Shared Props)

Di `HandleInertiaRequests::share()`, beberapa data selalu dikirim ke semua halaman:

```tsx
// Akses di React via usePage()
import { usePage } from '@inertiajs/react';

const { auth, currentTeam, teams } = usePage().props;
// auth.user    → user yang sedang login
// currentTeam → tim yang sedang aktif
// teams       → semua tim user
```

---

## 12. Spatie Data

**Spatie Data** adalah pengganti array biasa untuk transfer data antara layer. Manfaatnya:

- **Validasi** bawaan dengan PHP Attribute
- **Type-safe** — IDE tahu struktur datanya
- **Transformasi** model Eloquent ke format yang siap kirim ke frontend

### Contoh dari `TodoData`

```php
// app/Data/TodoData.php

class TodoData extends Data
{
    public function __construct(
        public ?int $id,
        #[Required, Max(255)]                              // Validasi dengan Attribute
        public string $title,
        #[Required, In(['pending', 'in_progress', 'completed', 'archived'])]
        public string $status = 'pending',
        public ?CategoryData $category = null,             // Nested Data
        public ?string $due_date = null,
    ) {}

    // Factory method — ubah model Eloquent jadi TodoData
    public static function fromModel(Todo $todo): self
    {
        return new self(
            id: $todo->id,
            title: $todo->title,
            status: $todo->status,
            // Cek apakah relasi sudah di-load sebelum akses
            category: $todo->category ? CategoryData::fromModel($todo->category) : null,
            due_date: $todo->due_date?->toIso8601String(),  // Carbon → string ISO
        );
    }
}
```

### Validasi di controller

```php
// Validasi + parse request sekaligus
$data = TodoData::validate($request->all());
// Jika gagal validasi → otomatis redirect back dengan errors (layaknya Form Request)
```

---

## 13. Spatie Permission & Dynamic Team RBAC

Package ini mengelola **Role** dan **Permission** di database. Di aplikasi ini, Spatie Permission dikonfigurasi dengan fitur **Teams Scope (`'teams' => true`)**, sehingga role dan permission terisolasi secara dinamis per tim.

### Naming Convention Permission (Dot Notation — Best Practice)

Aplikasi ini menerapkan **Dot Notation (`resource.action`)** sebagai _best practice_ standar industri:

```php
// database/seeders/RoleAndPermissionSeeder.php

public const PERMISSIONS = [
    'todos.view',              // Akses membaca daftar & detail todo
    'todos.create',            // Akses membuat todo baru
    'todos.update',            // Akses mengubah todo
    'todos.delete',            // Akses menghapus todo
    'categories.manage',       // Akses mengelola kategori (create/edit/delete)
    'activity_log.view',       // Akses melihat audit trail
    'admin.dashboard.access',  // Akses fitur admin khusus
];
```

**Mengapa Dot Notation?**

- **Grouping otomatis di UI:** Mudah diparse di frontend (`permission.split('.')`) untuk halaman matriks permission role.
- **Sorting rapi di DB:** `todos.create`, `todos.delete`, `todos.update`, `todos.view` mengelompok secara otomatis saat disort alfabetis.
- **Konsisten dengan Laravel Policy:** Menyamakan aksi dengan nama method standar policy (`view`, `create`, `update`, `delete`).

### Dynamic Per-Team Roles (`CreateTeam` & `TeamRoleController`)

Role tidak lagi global/statis. Setiap kali tim baru dibuat (`CreateTeam` action), 3 role bawaan otomatis dibuat **khusus untuk tim tersebut** (`team_id`):

1. **Owner:** Semua permission (`RoleAndPermissionSeeder::PERMISSIONS`).
2. **Admin:** `todos.view`, `todos.create`, `todos.update`, `todos.delete`, `categories.manage`, `activity_log.view`.
3. **Member:** `todos.view`, `todos.create`, `todos.update`.

Pemilik tim (Owner) atau Admin juga dapat membuat role kustom baru per tim (mis. role _"Designer"_ atau _"Viewer"_) via `TeamRoleController`.

### Pengesetan Scope Team pada Middleware (`EnsureTeamMembership`)

Setiap request yang melewati middleware `EnsureTeamMembership` secara otomatis memasang scope tim aktif untuk Spatie Permission:

```php
// app/Http/Middleware/EnsureTeamMembership.php

setPermissionsTeamId($team->id);
```

### Penggunaan di Policy & Controller

```php
// Cek permission user (secara otomatis ter-scope ke team_id saat ini)
$user->hasPermissionTo('todos.view');

// Cek permission di Policy
public function create(User $user, Team $team): bool
{
    return $user->belongsToTeam($team) && $user->hasPermissionTo('todos.create');
}
```

### Caching permission

Spatie Permission meng-cache semua permission untuk performa. Jika kamu mengubah permission tanpa seeder:

```bash
php artisan permission:cache-reset
```

---

## 14. Spatie MediaLibrary

Package untuk upload dan manajemen file. File disimpan di storage (lokal / S3).

### Konfigurasi di model

```php
// app/Models/Todo.php

class Todo extends Model implements HasMedia  // ← implements HasMedia
{
    use InteractsWithMedia;  // ← gunakan trait ini

    // Definisikan koleksi media
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments');
    }

    // Definisikan konversi (resize, crop, dll)
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(300)
            ->nonQueued();  // Proses langsung, bukan lewat queue
    }
}
```

### Upload file di controller

```php
// app/Http/Controllers/TodoController.php

if ($request->hasFile('attachments')) {
    foreach ($request->file('attachments') as $file) {
        $todo->addMedia($file)
             ->toMediaCollection('attachments');
    }
}
```

### Akses file di Data/Response

```php
// app/Data/TodoData.php

$todo->getMedia('attachments')->map(function ($media) {
    return [
        'original_url' => $media->getUrl(),         // URL file asli
        'thumb_url'    => $media->getUrl('thumb'),   // URL thumbnail hasil konversi
    ];
});
```

---

## 15. Spatie ActivityLog

Package untuk mencatat setiap perubahan pada model secara otomatis.

### Konfigurasi di model

```php
// app/Models/Todo.php

use Spatie\Activitylog\Models\Concerns\HasActivity;
use Spatie\Activitylog\Support\LogOptions;

class Todo extends Model
{
    use HasActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'description', 'status', 'priority', ...])  // Kolom yang dicatat
            ->logOnlyDirty()          // Hanya catat jika ada yang berubah
            ->dontLogEmptyChanges();  // Skip jika tidak ada perubahan nyata
    }
}
```

Setelah ini, setiap `$todo->update([...])` otomatis mencatat perubahan ke tabel `activity_log`.

### Membaca activity log

```php
// Load activity log dengan relasi causer (siapa yang melakukan)
$todo->load(['activities.causer']);

// Akses
$todo->activities;            // Collection semua aktivitas
$activity->description;       // "updated"
$activity->causer->name;      // Nama user yang melakukan perubahan
$activity->properties;        // { old: {...}, attributes: {...} }
```

---

## 16. Spatie QueryBuilder

Package untuk filter, sort, dan include relasi dari query string URL secara aman.

### Contoh di `TodoController::index`

```php
$query = QueryBuilder::for(Todo::class)
    ->where('team_id', $currentTeam->id)
    ->allowedFilters(
        AllowedFilter::exact('status'),        // ?filter[status]=pending
        AllowedFilter::exact('priority'),      // ?filter[priority]=high
        AllowedFilter::callback('search', function ($query, $value) {
            $query->where(function ($q) use ($value) {
                $q->where('title', 'like', "%{$value}%")
                  ->orWhere('description', 'like', "%{$value}%");
            });
        }),                                    // ?filter[search]=keyword
    )
    ->allowedSorts('title', 'due_date', 'created_at')  // ?sort=due_date atau ?sort=-due_date
    ->defaultSort('-created_at')
    ->paginate(15);
```

**URL contoh yang valid:**

```
/my-team/todos?filter[status]=pending&filter[priority]=high&sort=-due_date
```

Tanpa package ini, kamu perlu tulis sendiri `if ($request->has('status'))` berkali-kali.

---

## 17. Wayfinder

Wayfinder men-_generate_ TypeScript functions dari route dan controller Laravel, sehingga kamu tidak perlu hardcode URL di frontend.

### Generate setelah perubahan route

```bash
php artisan wayfinder:generate
make wayfinder
```

### Penggunaan di React

```tsx
// Import dari @/routes (named routes) atau @/actions (controller actions)
import { dashboard } from '@/routes';
import { index } from '@/actions/TodoController';

// Gunakan sebagai href
<Link href={dashboard('my-team')}>Dashboard</Link>;

// Gunakan sebagai URL untuk form submit
form.post(index.url({ current_team: currentTeam.slug }));
```

> ⚠️ Jangan edit file di `resources/js/actions/` dan `resources/js/routes/` — akan tertimpa saat generate ulang.

---

## 19. PHP 8.x Modern Features

Project ini menggunakan banyak fitur PHP modern. Berikut yang sering muncul di kodebase:

### Constructor Property Promotion

```php
// Lama
class TodoData {
    public string $title;
    public function __construct(string $title) {
        $this->title = $title;
    }
}

// Baru (PHP 8.0+) — yang dipakai di project ini
class TodoData {
    public function __construct(
        public string $title,
        public ?string $description = null,
    ) {}
}
```

### Nullsafe Operator `?->`

```php
// Jika $todo->due_date adalah null, tidak throw error, langsung return null
$todo->due_date?->toIso8601String();

// Setara dengan:
$todo->due_date !== null ? $todo->due_date->toIso8601String() : null;
```

### Named Arguments

```php
// Posisi parameter tidak penting jika pakai nama
return new self(
    id: $todo->id,
    title: $todo->title,
    status: $todo->status,
);
```

### Match Expression

```php
// app/Enums/TeamRole.php
public function level(): int
{
    return match ($this) {
        self::Owner  => 3,
        self::Admin  => 2,
        self::Member => 1,
    };
}
// Match lebih strict dari switch — tidak ada fallthrough, wajib exhaustive
```

### Enums (PHP 8.1+)

```php
// app/Enums/TeamRole.php

enum TeamRole: string  // Backed enum — setiap case punya value string
{
    case Owner  = 'owner';
    case Admin  = 'admin';
    case Member = 'member';

    // Enum bisa punya method!
    public function label(): string
    {
        return ucfirst($this->value);
    }
}

// Penggunaan
$role = TeamRole::Owner;
$role->value;             // 'owner'
$role->label();           // 'Owner'
TeamRole::from('admin');  // TeamRole::Admin
TeamRole::tryFrom('x');   // null (tidak throw exception)
```

### PHP Attributes (Annotation modern)

```php
// Ganti phpdoc @annotation dengan #[Attribute]

#[Fillable(['name', 'slug', 'is_personal'])]   // Di Team model
class Team extends Model { ... }

#[Required, Max(255)]                            // Di Spatie Data
public string $title,
```

---

## 20. Perintah Sehari-hari

### Makefile shortcuts

```bash
make setup          # Setup project baru (install, migrate, seed, build)
make run            # Jalankan dev server (Laravel + Vite)
make migrate        # php artisan migrate
make fresh          # php artisan migrate:fresh --seed
make test           # php artisan test --compact
make lint           # vendor/bin/pint --format agent
make wayfinder      # php artisan wayfinder:generate
make clean          # Clear semua cache
```

### Artisan yang sering dipakai

```bash
# Generate file
php artisan make:model NamaModel -mfsc     # Model + migration + factory + seeder + controller
php artisan make:controller NamaController --resource
php artisan make:policy NamaPolicy --model=NamaModel
php artisan make:migration create_nama_table

# Inspect
php artisan route:list --except-vendor     # Lihat semua route kecuali vendor
php artisan model:show Todo                # Lihat struktur model + relasi
php artisan config:show database.default   # Lihat nilai config

# Cache
php artisan config:clear                  # Clear config cache
php artisan route:clear                   # Clear route cache
php artisan cache:clear                   # Clear application cache
php artisan view:clear                    # Clear compiled view

# Testing
php artisan test --compact                # Jalankan semua test
php artisan test --filter=TodoTest        # Jalankan test tertentu

# Tinker (REPL interaktif)
php artisan tinker
# >>> Todo::count()
# >>> User::first()->teams
```

---

## Tips Debugging

```bash
# Lihat log real-time
php artisan pail

# Cek query yang berjalan (tambahkan sementara di AppServiceProvider::boot)
DB::listen(function ($query) {
    logger($query->sql, $query->bindings);
});

# Dump & die
dd($variable);      // Dump satu variabel, stop eksekusi
dump($variable);    // Dump tanpa stop
```

---

_Guide ini ditulis berdasarkan kode nyata di repository ini. Setiap contoh bisa kamu temukan langsung di file yang disebutkan._
