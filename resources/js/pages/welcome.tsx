import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    CheckSquare,
    FolderKanban,
    KeyRound,
    ShieldCheck,
    Tag,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/dashboard';

    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

    const sampleTasks = [
        {
            id: 1,
            title: 'Desain Tampilan & Panduan Gaya Dub.co',
            category: 'Desain',
            color: '#ea580c',
            priority: 'mendesak',
            completed: true,
            assignee: 'Sammidev',
        },
        {
            id: 2,
            title: 'Pengaturan Peran & Tanggung Jawab Anggota Tim',
            category: 'Manajemen Tim',
            color: '#2563eb',
            priority: 'tinggi',
            completed: false,
            assignee: 'Alex R.',
        },
        {
            id: 3,
            title: 'Verifikasi Dua Langkah & Akses Passkey',
            category: 'Keamanan',
            color: '#16a34a',
            priority: 'sedang',
            completed: false,
            assignee: 'Sarah K.',
        },
    ];

    const filteredTasks = sampleTasks.filter((task) => {
        if (activeTab === 'pending') return !task.completed;
        if (activeTab === 'completed') return task.completed;
        return true;
    });

    return (
        <>
            <Head title="TodoCraft — Platform Manajemen Tugas & Proyek Tim Modern" />

            <div className="min-h-screen bg-white font-sans text-[#171717] selection:bg-[#2563eb]/20 selection:text-[#2563eb] dark:bg-[#0a0a0a] dark:text-[#f5f5f5]">
                {/* Header Navigasi Minimalis */}
                <header className="sticky top-0 z-40 w-full border-b border-[#e5e5e5] bg-white/90 backdrop-blur-md dark:border-[#262626] dark:bg-[#0a0a0a]/90">
                    <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
                        {/* Brand Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 p-1 transition-transform group-hover:scale-105 dark:bg-white/10">
                                <AppLogoIcon className="size-full object-contain" />
                            </div>
                            <span className="font-medium text-lg tracking-tight text-[#0a0a0a] dark:text-white">
                                TodoCraft
                            </span>
                        </Link>

                        {/* Ghost Nav Links */}
                        <nav className="hidden items-center gap-1 md:flex text-sm font-medium text-[#404040] dark:text-[#a3a3a3]">
                            <a href="#features" className="rounded-full px-4 py-1.5 transition-colors hover:bg-[#f5f5f5] hover:text-[#171717] dark:hover:bg-[#262626] dark:hover:text-white">
                                Fitur Utama
                            </a>
                            <a href="#security" className="rounded-full px-4 py-1.5 transition-colors hover:bg-[#f5f5f5] hover:text-[#171717] dark:hover:bg-[#262626] dark:hover:text-white">
                                Keamanan
                            </a>
                            <a href="#teams" className="rounded-full px-4 py-1.5 transition-colors hover:bg-[#f5f5f5] hover:text-[#171717] dark:hover:bg-[#262626] dark:hover:text-white">
                                Kolaborasi
                            </a>
                        </nav>

                        {/* Auth Buttons Cluster */}
                        <div className="flex items-center gap-2.5">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-4 py-2 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-lg border border-[#e5e5e5] bg-white px-4 py-1.5 text-sm font-medium text-[#171717] shadow-subtle transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#000000] px-4 py-1.5 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] active:scale-[0.98] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                    >
                                        Daftar Gratis
                                        <ArrowRight className="h-4 w-4 text-[#2563eb]" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Bagian Hero */}
                <section className="relative overflow-hidden bg-white bg-grid-pattern px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 dark:bg-[#0a0a0a]">
                    <div className="mx-auto max-w-[1200px] text-center">
                        {/* Floating Feature Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1 text-xs font-medium text-[#171717] shadow-subtle dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5]">
                                <span className="h-2 w-2 rounded-full bg-[#ea580c]" />
                                <span>Manajemen Tugas</span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1 text-xs font-medium text-[#171717] shadow-subtle dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5]">
                                <span className="h-2 w-2 rounded-full bg-[#16a34a]" />
                                <span>Ruang Kerja Tim</span>
                            </div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-white px-3.5 py-1 text-xs font-medium text-[#171717] shadow-subtle dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5]">
                                <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
                                <span>Aktivitas Real-time</span>
                            </div>
                        </div>

                        {/* Display Title - Satoshi 500 Style */}
                        <h1 className="mt-8 font-sans text-4xl font-medium tracking-tight text-[#0a0a0a] sm:text-6xl sm:leading-[1.1] dark:text-white">
                            Kelola pekerjaan tim bersama <br className="hidden sm:inline" />
                            <span className="text-[#2563eb]">secara rapi, jelas, dan serba cepat.</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base text-[#525252] sm:text-lg dark:text-[#a3a3a3]">
                            Satu tempat untuk mencatat daftar tugas, membagi tanggung jawab anggota tim, mengatur prioritas kerja, dan menyelesaikan proyek bersama tanpa hambatan.
                        </p>

                        {/* Hero CTA Cluster */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Buka Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] active:scale-[0.98] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Buat Ruang Kerja Gratis
                                    <ArrowRight className="h-4 w-4 text-[#2563eb]" />
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-6 py-3 text-sm font-medium text-[#171717] shadow-subtle transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                            >
                                Pelajari Fitur
                            </a>
                        </div>
                    </div>

                    {/* Asymmetric Product Preview Frame */}
                    <div className="mx-auto mt-16 max-w-[1000px]">
                        <div className="overflow-hidden rounded-t-2xl border border-[#e5e5e5] bg-white p-4 shadow-subtle-2 sm:p-6 dark:border-[#262626] dark:bg-[#171717]">
                            {/* Window Topbar */}
                            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4 dark:border-[#262626]">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-[#e5e5e5] dark:bg-[#262626]" />
                                    <div className="h-3 w-3 rounded-full bg-[#e5e5e5] dark:bg-[#262626]" />
                                    <div className="h-3 w-3 rounded-full bg-[#e5e5e5] dark:bg-[#262626]" />
                                    <span className="ml-2 font-mono text-xs text-[#737373] dark:text-[#a3a3a3]">
                                        todocraft.app/dashboard
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                            activeTab === 'all'
                                                ? 'bg-[#000000] text-white dark:bg-white dark:text-[#0a0a0a]'
                                                : 'text-[#525252] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#262626]'
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                            activeTab === 'pending'
                                                ? 'bg-[#000000] text-white dark:bg-white dark:text-[#0a0a0a]'
                                                : 'text-[#525252] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#262626]'
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                            activeTab === 'completed'
                                                ? 'bg-[#000000] text-white dark:bg-white dark:text-[#0a0a0a]'
                                                : 'text-[#525252] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#262626]'
                                        }`}
                                    >
                                        Selesai
                                    </button>
                                </div>
                            </div>

                            {/* Live Task Rows Preview */}
                            <div className="mt-4 space-y-2.5">
                                {filteredTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#e5e5e5] bg-white p-3.5 transition hover:border-[#2563eb]/40 dark:border-[#262626] dark:bg-[#0a0a0a]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                                                    task.completed
                                                        ? 'border-[#16a34a] bg-[#16a34a] text-white'
                                                        : 'border-[#d4d4d4] bg-white dark:border-[#404040] dark:bg-[#171717]'
                                                }`}
                                            >
                                                {task.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                                            </div>
                                            <span
                                                className={`text-sm font-medium ${
                                                    task.completed
                                                        ? 'line-through text-[#737373] dark:text-[#737373]'
                                                        : 'text-[#171717] dark:text-[#f5f5f5]'
                                                }`}
                                            >
                                                {task.title}
                                            </span>
                                        </div>

                                        <div className="mt-2.5 sm:mt-0 flex flex-wrap items-center gap-2 text-xs">
                                            <span
                                                className="rounded-full px-2.5 py-0.5 font-medium text-white"
                                                style={{ backgroundColor: task.color }}
                                            >
                                                {task.category}
                                            </span>
                                            <span className="rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-2.5 py-0.5 font-medium text-[#404040] dark:border-[#262626] dark:bg-[#171717] dark:text-[#a3a3a3]">
                                                {task.priority}
                                            </span>
                                            <span className="text-[#737373] dark:text-[#737373]">
                                                {task.assignee}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Desaturated Logo Cloud Section */}
                <section className="border-y border-[#e5e5e5] bg-[#f5f5f5] py-12 dark:border-[#262626] dark:bg-[#0a0a0a]">
                    <div className="mx-auto max-w-[1200px] px-6">
                        <p className="text-center text-xs font-medium uppercase tracking-wider text-[#737373] dark:text-[#737373]">
                            Dipercaya oleh tim pengembang & profesional modern
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-6 text-center md:grid-cols-4 lg:grid-cols-4 opacity-60">
                            <div className="flex items-center justify-center font-mono text-sm font-semibold tracking-wider text-[#404040] dark:text-[#a3a3a3]">
                                / PETS STACK
                            </div>
                            <div className="flex items-center justify-center font-mono text-sm font-semibold tracking-wider text-[#404040] dark:text-[#a3a3a3]">
                                / LARAVEL BOOST
                            </div>
                            <div className="flex items-center justify-center font-mono text-sm font-semibold tracking-wider text-[#404040] dark:text-[#a3a3a3]">
                                / INERTIA V3
                            </div>
                            <div className="flex items-center justify-center font-mono text-sm font-semibold tracking-wider text-[#404040] dark:text-[#a3a3a3]">
                                / WAYFINDER TS
                            </div>
                        </div>
                    </div>
                </section>

                {/* Fitur Utama - Grid 3x2 */}
                <section id="features" className="bg-white py-20 dark:bg-[#0a0a0a]">
                    <div className="mx-auto max-w-[1200px] px-6">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="text-3xl font-medium tracking-tight text-[#0a0a0a] sm:text-4xl dark:text-white">
                                Alur kerja yang intuitif dan terstruktur.
                            </h2>
                            <p className="mt-4 text-base text-[#525252] dark:text-[#a3a3a3]">
                                Berbagai fitur esensial yang mempermudah koordinasi tugas dan penyelesaian proyek bersama.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                    <Users className="h-5 w-5 text-[#2563eb]" />
                                </div>
                                <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                    Ruang Kerja Khusus Tim
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Beralih dengan praktis antara ruang kerja pribadi dan berbagai tim kerja tanpa kerancuan data.
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                    <ShieldCheck className="h-5 w-5 text-[#16a34a]" />
                                </div>
                                <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                    Manajemen Peran & Hak Akses
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Kelola otorisasi Pemilik, Admin, dan Anggota tim secara presisi.
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                    <Tag className="h-5 w-5 text-[#ea580c]" />
                                </div>
                                <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                    Kategori & Prioritas
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Kelompokkan tugas berdasarkan prioritas, warna penanda, dan tenggat waktu kerja.
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                    <Activity className="h-5 w-5 text-[#7c3aed]" />
                                </div>
                                <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                    Log Aktivitas Real-Time
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Pantau jejak perubahan status tugas dan riwayat kerja anggota secara transparan.
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                    <KeyRound className="h-5 w-5 text-[#2563eb]" />
                                </div>
                                <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                    Dukungan Passkey & 2FA
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Masuk cepat tanpa kata sandi dengan Touch ID / Face ID serta autentikasi 2FA.
                                </p>
                            </div>

                            <div className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-all hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                    <Zap className="h-5 w-5 text-[#ea580c]" />
                                </div>
                                <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                    Pencarian Instan
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Temukan tugas berdasarkan penanggung jawab, tag, status, atau kata kunci seketika.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action Banner */}
                <section className="border-t border-[#e5e5e5] bg-[#f5f5f5] py-20 dark:border-[#262626] dark:bg-[#0a0a0a]">
                    <div className="mx-auto max-w-[800px] text-center px-6">
                        <h2 className="text-3xl font-medium tracking-tight text-[#0a0a0a] sm:text-4xl dark:text-white">
                            Siap mengoptimalkan produktivitas tim Anda?
                        </h2>
                        <p className="mt-4 text-base text-[#525252] dark:text-[#a3a3a3]">
                            Mulai gunakan TodoCraft hari ini untuk pengalaman mengelola tugas yang lebih rapi dan efisien.
                        </p>
                        <div className="mt-8 flex justify-center">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Buka Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] active:scale-[0.98] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Mulai Sekarang
                                    <ArrowRight className="h-4 w-4 text-[#2563eb]" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Minimalist Footer */}
                <footer className="border-t border-[#e5e5e5] bg-white py-10 text-xs text-[#737373] dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#a3a3a3]">
                    <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black/5 p-0.5 dark:bg-white/10">
                                <AppLogoIcon className="size-full object-contain" />
                            </div>
                            <span className="font-medium text-sm text-[#0a0a0a] dark:text-white">
                                TodoCraft
                            </span>
                        </div>
                        <p>© {new Date().getFullYear()} TodoCraft. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

