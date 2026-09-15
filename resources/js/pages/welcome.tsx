import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    KeyRound,
    ShieldCheck,
    Tag,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard, login, register } from '@/routes';

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam ? dashboard(currentTeam.slug) : '/dashboard';

    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

    const sampleTasks = [
        {
            id: 1,
            title: 'Desain Tampilan & Panduan Gaya Aplikasi',
            category: 'Desain',
            color: '#d97757',
            priority: 'mendesak',
            completed: true,
            assignee: 'Sammidev',
        },
        {
            id: 2,
            title: 'Pengaturan Peran & Tanggung Jawab Anggota',
            category: 'Manajemen Tim',
            color: '#3b82f6',
            priority: 'tinggi',
            completed: false,
            assignee: 'Alex R.',
        },
        {
            id: 3,
            title: 'Pemeriksaan Keamanan & Akses Akun Tim',
            category: 'Keamanan',
            color: '#10b981',
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
            <Head title="TodoCraft - Kelola Tugas & Proyek Tim Lebih Mudah" />

            <div className="min-h-screen bg-[#f8f8f6] font-sans text-[#121212] selection:bg-[#d97757]/20 selection:text-[#d97757] dark:bg-[#121212] dark:text-[#f8f8f6]">
                {/* Navigasi Header */}
                <header className="sticky top-0 z-40 w-full border-b border-[#e7e6e1] bg-[#f8f8f6]/80 backdrop-blur-md dark:border-[#2f2f2c] dark:bg-[#121212]/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        {/* Logo Brand */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#121212] text-[#f8f8f6] shadow-sm transition-transform group-hover:scale-105 dark:bg-[#f8f8f6] dark:text-[#121212]">
                                <CheckCircle2 className="h-5 w-5 text-[#d97757]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-serif text-xl font-normal tracking-tight">
                                    TodoCraft<span className="inline-block h-2 w-2 rounded-full bg-[#d97757] ml-0.5"></span>
                                </span>
                            </div>
                        </Link>

                        {/* Tautan Navigasi */}
                        <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-[#373734] dark:text-[#9c9a92]">
                            <a href="#features" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Fitur Utama
                            </a>
                            <a href="#security" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Keamanan Akun
                            </a>
                            <a href="#teams" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Kerjasama Tim
                            </a>
                            <a href="#faq" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Pertanyaan Umum
                            </a>
                        </nav>

                        {/* Tombol Autentikasi */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#121212] px-4 py-2 text-sm font-medium text-[#f8f8f6] shadow-sm transition-all hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Buka Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-[#373734] transition-colors hover:text-[#121212] dark:text-[#9c9a92] dark:hover:text-[#f8f8f6]"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#121212] px-4 py-2 text-sm font-medium text-[#f8f8f6] shadow-sm transition-all hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                    >
                                        Mulai Sekarang
                                        <ArrowRight className="h-4 w-4 text-[#d97757]" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Bagian Hero */}
                <section className="relative overflow-hidden px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
                    <div className="mx-auto max-w-5xl text-center">
                        {/* Lencana Atas */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#e7e6e1] bg-[#efeeeb] px-3.5 py-1 text-xs font-medium text-[#373734] dark:border-[#2f2f2c] dark:bg-[#1c1c1a] dark:text-[#9c9a92]">
                            <span className="h-2 w-2 rounded-full bg-[#d97757] animate-pulse" />
                            <span>RUANG KERJA KOLABORASI TIM</span>
                        </div>

                        {/* Judul Utama */}
                        <h1 className="mt-6 font-serif text-4xl font-normal tracking-tight text-[#121212] sm:text-6xl sm:leading-[1.15] dark:text-[#f8f8f6]">
                            Kelola pekerjaan tim bersama <br className="hidden sm:inline" />
                            <span className="italic">secara rapi, jelas, dan serba cepat.</span>
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base text-[#7b7974] sm:text-lg dark:text-[#9c9a92]">
                            Satu tempat untuk mencatat daftar tugas, membagi tanggung jawab anggota tim, mengatur prioritas kerja, dan menyelesaikan proyek bersama tanpa hambatan.
                        </p>

                        {/* Tombol Aksi */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Buka Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Buat Ruang Kerja Tim Gratis
                                    <ArrowRight className="h-4 w-4 text-[#d97757]" />
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#e7e6e1] bg-white px-6 py-3.5 text-sm font-medium text-[#121212] shadow-xs transition-colors hover:bg-[#efeeeb] dark:border-[#2f2f2c] dark:bg-[#1c1c1a] dark:text-[#f8f8f6] dark:hover:bg-[#282826]"
                            >
                                Pelajari Lebih Lanjut
                            </a>
                        </div>
                    </div>

                    {/* Container Mockup Interaktif */}
                    <div className="mx-auto mt-14 max-w-5xl">
                        <div className="overflow-hidden rounded-2xl border border-[#e7e6e1] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-6 dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                            {/* Bar Header Jendela Aplikasi */}
                            <div className="flex items-center justify-between border-b border-[#e7e6e1] pb-4 dark:border-[#2f2f2c]">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-[#ef4444]/80" />
                                    <div className="h-3 w-3 rounded-full bg-[#f59e0b]/80" />
                                    <div className="h-3 w-3 rounded-full bg-[#10b981]/80" />
                                    <span className="ml-2 font-mono text-xs text-[#7b7974] dark:text-[#9c9a92]">
                                        TodoCraft — Ruang Kerja Utama
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                            activeTab === 'all'
                                                ? 'bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]'
                                                : 'text-[#7b7974] hover:bg-[#efeeeb] dark:text-[#9c9a92] dark:hover:bg-[#282826]'
                                        }`}
                                    >
                                        Semua Tugas
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                            activeTab === 'pending'
                                                ? 'bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]'
                                                : 'text-[#7b7974] hover:bg-[#efeeeb] dark:text-[#9c9a92] dark:hover:bg-[#282826]'
                                        }`}
                                    >
                                        Belum Selesai
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                            activeTab === 'completed'
                                                ? 'bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]'
                                                : 'text-[#7b7974] hover:bg-[#efeeeb] dark:text-[#9c9a92] dark:hover:bg-[#282826]'
                                        }`}
                                    >
                                        Selesai
                                    </button>
                                </div>
                            </div>

                            {/* Pratinjau Daftar Tugas */}
                            <div className="mt-4 space-y-3">
                                {filteredTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#e7e6e1] bg-[#f8f8f6] p-4 transition hover:border-[#d97757]/40 dark:border-[#2f2f2c] dark:bg-[#282826]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                                                    task.completed
                                                        ? 'border-[#10b981] bg-[#10b981] text-white'
                                                        : 'border-[#b7b7b5] bg-white dark:border-[#7b7974] dark:bg-[#121212]'
                                                }`}
                                            >
                                                {task.completed && <CheckCircle2 className="h-4 w-4" />}
                                            </div>
                                            <span
                                                className={`text-sm font-medium ${
                                                    task.completed
                                                        ? 'line-through text-[#7b7974] dark:text-[#9c9a92]'
                                                        : 'text-[#121212] dark:text-[#f8f8f6]'
                                                }`}
                                            >
                                                {task.title}
                                            </span>
                                        </div>

                                        <div className="mt-3 sm:mt-0 flex flex-wrap items-center gap-2 text-xs">
                                            <span
                                                className="rounded-md px-2 py-0.5 font-semibold text-white"
                                                style={{ backgroundColor: task.color }}
                                            >
                                                {task.category}
                                            </span>
                                            <span className="rounded-md border border-[#e7e6e1] bg-white px-2 py-0.5 uppercase font-medium text-[#373734] dark:border-[#373734] dark:bg-[#121212] dark:text-[#9c9a92]">
                                                {task.priority}
                                            </span>
                                            <span className="text-[#7b7974] dark:text-[#9c9a92]">
                                                {task.assignee}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bagian Fitur */}
                <section id="features" className="border-t border-[#e7e6e1] bg-white py-20 dark:border-[#2f2f2c] dark:bg-[#161615]">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="font-serif text-3xl font-normal text-[#121212] sm:text-4xl dark:text-[#f8f8f6]">
                                Dirancang untuk kemudahan kerja tim Anda.
                            </h2>
                            <p className="mt-4 text-base text-[#7b7974] dark:text-[#9c9a92]">
                                Semua fitur yang Anda butuhkan agar proyek selalu teratur, anggota tim saling terhubung, dan alur kerja lebih jelas.
                            </p>
                        </div>

                        {/* Grid 3x2 */}
                        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Fitur 1 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Users className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Ruang Kerja Khusus Tim
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Beralih dengan mudah antara ruang kerja pribadi Anda dan berbagai tim kerja tanpa khawatir data tertukar.
                                </p>
                            </div>

                            {/* Fitur 2 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <ShieldCheck className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Pengaturan Peran & Akses
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Atur tanggung jawab setiap anggota tim (Pemilik, Admin, Anggota) sesuai kebutuhan dan alur kerja.
                                </p>
                            </div>

                            {/* Fitur 3 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Tag className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Label & Prioritas Kerja
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Kelompokkan tugas berdasarkan warna, tingkat prioritas (Mendesak, Tinggi, Sedang, Rendah), dan daftar centang pekerjaan.
                                </p>
                            </div>

                            {/* Fitur 4 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Activity className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Riwayat & Laporan Aktivitas
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Pantau perkembangan proyek, perubahan status tugas, serta aktivitas penting tim secara langsung.
                                </p>
                            </div>

                            {/* Fitur 5 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <KeyRound className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Perlindungan Akun Berlapis
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Amankan akun Anda dengan verifikasi dua langkah dan masuk praktis menggunakan sidik jari atau pemindaian wajah.
                                </p>
                            </div>

                            {/* Fitur 6 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Zap className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Pencarian & Penyaringan Cepat
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Temukan tugas berdasarkan kategori, status, prioritas, tenggat waktu, atau penanggung jawab secara instan.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Show-case Keunggulan */}
                <section className="border-t border-[#e7e6e1] bg-[#f8f8f6] py-16 dark:border-[#2f2f2c] dark:bg-[#121212]">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    99,9%
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Selalu Siap Diakses
                                </div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Instan
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Super Cepat & Responsif
                                </div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    100%
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Privasi Data Terjamin
                                </div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Praktis
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Langsung Pakai
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bagian Call to Action Bawah */}
                <section className="border-t border-[#e7e6e1] bg-white py-20 dark:border-[#2f2f2c] dark:bg-[#161615]">
                    <div className="mx-auto max-w-4xl text-center px-6">
                        <h2 className="font-serif text-3xl font-normal text-[#121212] sm:text-5xl dark:text-[#f8f8f6]">
                            Siap mengubah cara tim Anda bekerja?
                        </h2>
                        <p className="mt-4 text-base text-[#7b7974] dark:text-[#9c9a92]">
                            Mulai kelola tugas dan proyek Anda dengan TodoCraft hari ini. Gratis untuk semua tim.
                        </p>
                        <div className="mt-8 flex justify-center">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Buka Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Mulai Sekarang
                                    <ArrowRight className="h-4 w-4 text-[#d97757]" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Baris Footer */}
                <footer className="bg-[#000000] text-[#9c9a92] py-12">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-[#2f2f2c] pb-8">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#282826] text-white">
                                    <CheckCircle2 className="h-4 w-4 text-[#d97757]" />
                                </div>
                                <span className="font-serif text-lg font-normal text-white">
                                    TodoCraft
                                </span>
                            </div>
                            <div className="flex gap-6 text-xs">
                                <a href="#features" className="hover:text-white transition">Fitur Utama</a>
                                <a href="#security" className="hover:text-white transition">Keamanan</a>
                                <a href="#teams" className="hover:text-white transition">Kerjasama Tim</a>
                                <a href="#faq" className="hover:text-white transition">Pertanyaan Umum</a>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                            <p>© {new Date().getFullYear()} TodoCraft Inc. Hak cipta dilindungi undang-undang.</p>
                            <p className="flex items-center gap-1">
                                Solusi Manajemen Tugas Tim Modern
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
