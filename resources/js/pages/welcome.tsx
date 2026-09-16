import { Head, Link, usePage } from "@inertiajs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    CheckCircle2,
    KeyRound,
    ShieldCheck,
    Tag,
    Users,
    Zap,
    Lock,
    UserCheck,
} from "lucide-react";
import { useState, useEffect } from "react";
import AppLogoIcon from "@/components/app-logo-icon";
import { dashboard, login, register } from "@/routes";

export default function Welcome() {
    const { auth, currentTeam } = usePage().props;
    const dashboardUrl = currentTeam
        ? dashboard(currentTeam.slug)
        : "/dashboard";

    const [activeTab, setActiveTab] = useState<"all" | "pending" | "completed">(
        "all",
    );
    const [activeSection, setActiveSection] = useState<string>("");

    useEffect(() => {
        const sections = ["features", "security", "teams"];
        const observerOptions = {
            root: null,
            rootMargin: "-20% 0px -50% 0px",
            threshold: 0.15,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach((id) => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const sampleTasks = [
        {
            id: 1,
            title: "Desain Tampilan & Panduan Gaya Dub.co",
            category: "Desain",
            color: "#ea580c",
            priority: "mendesak",
            completed: true,
            assignee: "Sammidev",
        },
        {
            id: 2,
            title: "Pengaturan Peran & Tanggung Jawab Anggota Tim",
            category: "Manajemen Tim",
            color: "#2563eb",
            priority: "tinggi",
            completed: false,
            assignee: "Alex R.",
        },
        {
            id: 3,
            title: "Verifikasi Dua Langkah & Akses Passkey",
            category: "Keamanan",
            color: "#16a34a",
            priority: "sedang",
            completed: false,
            assignee: "Sarah K.",
        },
    ];

    const filteredTasks = sampleTasks.filter((task) => {
        if (activeTab === "pending") return !task.completed;
        if (activeTab === "completed") return task.completed;
        return true;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05,
            },
        },
    };

    const fadeInUp = {
        hidden: { opacity: 0, y: 24 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] },
        },
    };

    return (
        <>
            <Head title="TodoCraft — Platform Manajemen Tugas & Proyek Tim Modern" />

            <div className="min-h-screen bg-white font-sans text-[#171717] selection:bg-[#2563eb]/20 selection:text-[#2563eb] dark:bg-[#0a0a0a] dark:text-[#f5f5f5]">
                {/* Header Navigasi Minimalis */}
                <header className="sticky top-0 z-40 w-full border-b border-[#e5e5e5] bg-white/90 backdrop-blur-md dark:border-[#262626] dark:bg-[#0a0a0a]/90">
                    <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
                        {/* Brand Logo */}
                        <Link
                            href="/"
                            className="flex items-center gap-2.5 group"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 p-1 transition-transform group-hover:scale-105 dark:bg-white/10">
                                <AppLogoIcon className="size-full object-contain" />
                            </div>
                            <span className="font-medium text-lg tracking-tight text-[#0a0a0a] dark:text-white">
                                TodoCraft
                            </span>
                        </Link>

                        {/* Ghost Nav Links with Active Scroll-Spy Highlight */}
                        <nav className="hidden items-center gap-1 md:flex text-sm font-medium text-[#404040] dark:text-[#a3a3a3]">
                            {[
                                { id: "features", label: "Fitur Utama" },
                                { id: "security", label: "Keamanan" },
                                { id: "teams", label: "Kolaborasi" },
                            ].map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`relative rounded-full px-4 py-1.5 transition-all duration-200 ${
                                            isActive
                                                ? "bg-[#eff6ff] text-[#2563eb] font-semibold dark:bg-[#1e293b] dark:text-blue-400 shadow-xs"
                                                : "hover:bg-[#f5f5f5] hover:text-[#171717] dark:hover:bg-[#262626] dark:hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                        {isActive && (
                                            <motion.span
                                                layoutId="activeNavPill"
                                                className="absolute inset-0 rounded-full border border-[#2563eb]/30 dark:border-blue-400/40 pointer-events-none"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 380,
                                                    damping: 30,
                                                }}
                                            />
                                        )}
                                    </a>
                                );
                            })}
                        </nav>

                        {/* Auth Buttons Cluster */}
                        <div className="flex items-center gap-2.5">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-4 py-2 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Dashboard
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
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Bagian Hero */}
                <section className="relative overflow-hidden bg-white px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 dark:bg-[#0a0a0a]">
                    <motion.div
                        className="mx-auto max-w-[1200px] text-center"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Floating Feature Pills */}
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-wrap items-center justify-center gap-3"
                        >
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
                        </motion.div>

                        {/* Display Title */}
                        <motion.h1
                            variants={fadeInUp}
                            className="mt-8 font-sans text-4xl font-medium tracking-tight text-[#0a0a0a] sm:text-6xl sm:leading-[1.1] dark:text-white"
                        >
                            Kelola pekerjaan tim bersama{" "}
                            <br className="hidden sm:inline" />
                            <span className="text-[#2563eb]">
                                secara rapi, jelas, dan serba cepat.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="mx-auto mt-6 max-w-2xl text-base text-[#525252] sm:text-lg dark:text-[#a3a3a3]"
                        >
                            Satu tempat untuk mencatat daftar tugas, membagi
                            tanggung jawab anggota tim, mengatur prioritas
                            kerja, dan menyelesaikan proyek bersama tanpa
                            hambatan.
                        </motion.p>

                        {/* Hero CTA Cluster */}
                        <motion.div
                            variants={fadeInUp}
                            className="mt-8 flex flex-wrap items-center justify-center gap-3"
                        >
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] active:scale-[0.98] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Buat Ruang Kerja Gratis
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-6 py-3 text-sm font-medium text-[#171717] shadow-subtle transition-colors hover:bg-[#f5f5f5] dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5] dark:hover:bg-[#262626]"
                            >
                                Pelajari Fitur
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Asymmetric Product Preview Frame */}
                    <motion.div
                        className="mx-auto mt-16 max-w-[1000px]"
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
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
                                        onClick={() => setActiveTab("all")}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                            activeTab === "all"
                                                ? "bg-[#000000] text-white dark:bg-white dark:text-[#0a0a0a]"
                                                : "text-[#525252] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#262626]"
                                        }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setActiveTab("pending")}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                            activeTab === "pending"
                                                ? "bg-[#000000] text-white dark:bg-white dark:text-[#0a0a0a]"
                                                : "text-[#525252] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#262626]"
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() =>
                                            setActiveTab("completed")
                                        }
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                            activeTab === "completed"
                                                ? "bg-[#000000] text-white dark:bg-white dark:text-[#0a0a0a]"
                                                : "text-[#525252] hover:bg-[#f5f5f5] dark:text-[#a3a3a3] dark:hover:bg-[#262626]"
                                        }`}
                                    >
                                        Selesai
                                    </button>
                                </div>
                            </div>

                            {/* Live Task Rows Preview with Framer Motion AnimatePresence */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-4 space-y-2.5"
                                >
                                    {filteredTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#e5e5e5] bg-white p-3.5 transition hover:border-[#2563eb]/40 dark:border-[#262626] dark:bg-[#0a0a0a]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                                                        task.completed
                                                            ? "border-[#16a34a] bg-[#16a34a] text-white"
                                                            : "border-[#d4d4d4] bg-white dark:border-[#404040] dark:bg-[#171717]"
                                                    }`}
                                                >
                                                    {task.completed && (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-sm font-medium ${
                                                        task.completed
                                                            ? "line-through text-[#737373] dark:text-[#737373]"
                                                            : "text-[#171717] dark:text-[#f5f5f5]"
                                                    }`}
                                                >
                                                    {task.title}
                                                </span>
                                            </div>

                                            <div className="mt-2.5 sm:mt-0 flex flex-wrap items-center gap-2 text-xs">
                                                <span
                                                    className="rounded-full px-2.5 py-0.5 font-medium text-white"
                                                    style={{
                                                        backgroundColor:
                                                            task.color,
                                                    }}
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
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </section>

                {/* Product Highlights Strip */}
                <motion.section
                    className="border-y border-[#e5e5e5] bg-[#f5f5f5] py-12 dark:border-[#262626] dark:bg-[#0a0a0a]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mx-auto max-w-[1200px] px-6">
                        <p className="text-center text-xs font-medium uppercase tracking-wider text-[#737373] dark:text-[#737373]">
                            Dirancang untuk produktivitas tim & profesional
                            modern
                        </p>
                        <div className="mt-8 grid grid-cols-2 gap-6 text-center md:grid-cols-4 lg:grid-cols-4">
                            <div className="flex items-center justify-center font-sans text-sm font-semibold tracking-tight text-[#404040] dark:text-[#a3a3a3]">
                                ✨ KOLABORASI TIM
                            </div>
                            <div className="flex items-center justify-center font-sans text-sm font-semibold tracking-tight text-[#404040] dark:text-[#a3a3a3]">
                                🔒 KEAMANAN PASSKEY
                            </div>
                            <div className="flex items-center justify-center font-sans text-sm font-semibold tracking-tight text-[#404040] dark:text-[#a3a3a3]">
                                ⚡ PERFORMANSA REPEATABLE
                            </div>
                            <div className="flex items-center justify-center font-sans text-sm font-semibold tracking-tight text-[#404040] dark:text-[#a3a3a3]">
                                🎯 ALUR KERJA INTUITIF
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Fitur Utama - Grid 3x2 */}
                <section
                    id="features"
                    className="bg-white py-20 dark:bg-[#0a0a0a]"
                >
                    <div className="mx-auto max-w-[1200px] px-6">
                        <motion.div
                            className="mx-auto max-w-2xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-medium tracking-tight text-[#0a0a0a] sm:text-4xl dark:text-white">
                                Alur kerja yang intuitif dan terstruktur.
                            </h2>
                            <p className="mt-4 text-base text-[#525252] dark:text-[#a3a3a3]">
                                Berbagai fitur esensial yang mempermudah
                                koordinasi tugas dan penyelesaian proyek
                                bersama.
                            </p>
                        </motion.div>

                        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    icon: <Users className="h-5 w-5 text-[#2563eb]" />,
                                    title: "Ruang Kerja Khusus Tim",
                                    desc: "Beralih dengan praktis antara ruang kerja pribadi dan berbagai tim kerja tanpa kerancuan data.",
                                },
                                {
                                    icon: <ShieldCheck className="h-5 w-5 text-[#16a34a]" />,
                                    title: "Manajemen Peran & Hak Akses",
                                    desc: "Kelola otorisasi Pemilik, Admin, dan Anggota tim secara presisi.",
                                },
                                {
                                    icon: <Tag className="h-5 w-5 text-[#ea580c]" />,
                                    title: "Kategori & Prioritas",
                                    desc: "Kelompokkan tugas berdasarkan prioritas, warna penanda, dan tenggat waktu kerja.",
                                },
                                {
                                    icon: <Activity className="h-5 w-5 text-[#7c3aed]" />,
                                    title: "Log Aktivitas Real-Time",
                                    desc: "Pantau jejak perubahan status tugas dan riwayat kerja anggota secara transparan.",
                                },
                                {
                                    icon: <KeyRound className="h-5 w-5 text-[#2563eb]" />,
                                    title: "Dukungan Passkey & 2FA",
                                    desc: "Masuk cepat tanpa kata sandi dengan Touch ID / Face ID serta autentikasi 2FA.",
                                },
                                {
                                    icon: <Zap className="h-5 w-5 text-[#ea580c]" />,
                                    title: "Pencarian Instan",
                                    desc: "Temukan tugas berdasarkan penanggung jawab, tag, status, atau kata kunci seketika.",
                                },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    className="rounded-xl border border-[#e5e5e5] bg-white p-6 transition-colors hover:border-[#2563eb]/50 dark:border-[#262626] dark:bg-[#171717]"
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.4,
                                        delay: i * 0.08,
                                    }}
                                    whileHover={{ y: -4 }}
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5f5f5] text-[#171717] dark:bg-[#262626] dark:text-white">
                                        {feature.icon}
                                    </div>
                                    <h3 className="mt-4 font-medium text-lg text-[#0a0a0a] dark:text-white">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section Keamanan */}
                <section
                    id="security"
                    className="border-t border-[#e5e5e5] bg-[#f5f5f5]/60 py-20 dark:border-[#262626] dark:bg-[#0a0a0a]"
                >
                    <div className="mx-auto max-w-[1200px] px-6">
                        <motion.div
                            className="mx-auto max-w-2xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-medium tracking-tight text-[#0a0a0a] sm:text-4xl dark:text-white">
                                Keamanan & Proteksi Akses Kelas Utama.
                            </h2>
                            <p className="mt-4 text-base text-[#525252] dark:text-[#a3a3a3]">
                                Dilengkapi dengan standar enkripsi modern, otentikasi dua faktor, dan login biomektrik tanpa password.
                            </p>
                        </motion.div>

                        <div className="mt-12 grid gap-6 sm:grid-cols-2">
                            <motion.div
                                className="rounded-xl border border-[#e5e5e5] bg-white p-6 dark:border-[#262626] dark:bg-[#171717]"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb]/10 text-[#2563eb]">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium text-[#0a0a0a] dark:text-white">
                                    Login Passkey (Biometrik)
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Dukungan Passkeys terintegrasi memudahkan login dengan Touch ID, Face ID, atau kunci keamanan fisik tanpa risiko pencurian kata sandi.
                                </p>
                            </motion.div>

                            <motion.div
                                className="rounded-xl border border-[#e5e5e5] bg-white p-6 dark:border-[#262626] dark:bg-[#171717]"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#16a34a]/10 text-[#16a34a]">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h3 className="mt-4 text-lg font-medium text-[#0a0a0a] dark:text-white">
                                    Otentikasi Dua Faktor (2FA)
                                </h3>
                                <p className="mt-2 text-sm text-[#525252] leading-relaxed dark:text-[#a3a3a3]">
                                    Tambahkan proteksi ekstra untuk akun tim Anda dengan kode verifikasi TOTP instan dan kunci pemulihan cadangan.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Section Kolaborasi Tim */}
                <section
                    id="teams"
                    className="border-t border-[#e5e5e5] bg-white py-20 dark:border-[#262626] dark:bg-[#0a0a0a]"
                >
                    <div className="mx-auto max-w-[1200px] px-6">
                        <motion.div
                            className="mx-auto max-w-2xl text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-3xl font-medium tracking-tight text-[#0a0a0a] sm:text-4xl dark:text-white">
                                Kolaborasi Tanpa Batas Antar Anggota.
                            </h2>
                            <p className="mt-4 text-base text-[#525252] dark:text-[#a3a3a3]">
                                Kelola ruang kerja proyek, undang anggota tim baru, dan atur hak akses dengan cepat.
                            </p>
                        </motion.div>

                        <motion.div
                            className="mt-12 rounded-2xl border border-[#e5e5e5] bg-[#f5f5f5] p-6 sm:p-8 dark:border-[#262626] dark:bg-[#171717]"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="grid gap-6 md:grid-cols-3 text-center md:text-left">
                                <div className="space-y-2">
                                    <UserCheck className="mx-auto md:mx-0 h-6 w-6 text-[#2563eb]" />
                                    <h4 className="font-medium text-base text-[#0a0a0a] dark:text-white">Undangan Tim via Email</h4>
                                    <p className="text-xs text-[#525252] dark:text-[#a3a3a3]">Undang anggota baru langsung melalui tautan email instan.</p>
                                </div>
                                <div className="space-y-2">
                                    <ShieldCheck className="mx-auto md:mx-0 h-6 w-6 text-[#16a34a]" />
                                    <h4 className="font-medium text-base text-[#0a0a0a] dark:text-white">Peran & Otorisasi</h4>
                                    <p className="text-xs text-[#525252] dark:text-[#a3a3a3]">Atur akses Owner, Admin, dan Member secara transparan.</p>
                                </div>
                                <div className="space-y-2">
                                    <Activity className="mx-auto md:mx-0 h-6 w-6 text-[#7c3aed]" />
                                    <h4 className="font-medium text-base text-[#0a0a0a] dark:text-white">Audit Log Aktivitas</h4>
                                    <p className="text-xs text-[#525252] dark:text-[#a3a3a3]">Rekam riwayat perubahan status tugas seluruh anggota.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Call to Action Banner */}
                <motion.section
                    className="border-t border-[#e5e5e5] bg-[#f5f5f5] py-20 dark:border-[#262626] dark:bg-[#0a0a0a]"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mx-auto max-w-[800px] text-center px-6">
                        <h2 className="text-3xl font-medium tracking-tight text-[#0a0a0a] sm:text-4xl dark:text-white">
                            Siap mengoptimalkan produktivitas tim Anda?
                        </h2>
                        <p className="mt-4 text-base text-[#525252] dark:text-[#a3a3a3]">
                            Mulai gunakan TodoCraft hari ini untuk pengalaman
                            mengelola tugas yang lebih rapi dan efisien.
                        </p>
                        <div className="mt-8 flex justify-center">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Buka Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#000000] px-6 py-3 text-sm font-medium text-white shadow-subtle transition-all hover:bg-[#262626] active:scale-[0.98] dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-[#e5e5e5]"
                                >
                                    Mulai Sekarang
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Dub.co Style Rich Multi-Column Footer */}
                <footer className="border-t border-[#e5e5e5] bg-white pt-16 pb-12 text-sm text-[#525252] dark:border-[#262626] dark:bg-[#0a0a0a] dark:text-[#a3a3a3]">
                    <div className="mx-auto max-w-[1200px] px-6">
                        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 pb-12 border-b border-[#e5e5e5] dark:border-[#262626]">
                            {/* Brand Info */}
                            <div className="md:col-span-2 space-y-4 pr-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2.5 group"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 p-1 transition-transform group-hover:scale-105 dark:bg-white/10">
                                        <AppLogoIcon className="size-full object-contain" />
                                    </div>
                                    <span className="font-semibold text-lg tracking-tight text-[#0a0a0a] dark:text-white">
                                        TodoCraft
                                    </span>
                                </Link>
                                <p className="text-sm text-[#737373] leading-relaxed max-w-sm dark:text-[#a3a3a3]">
                                    Platform manajemen tugas dan kolaborasi tim yang cepat, terstruktur, dan aman dengan dukungan Passkey biometrik.
                                </p>
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-[#171717] dark:border-[#262626] dark:bg-[#171717] dark:text-[#f5f5f5]">
                                    <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
                                    <span>Semua Sistem Berjalan Normal</span>
                                </div>
                            </div>

                            {/* Column 1: Produk */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] dark:text-white">
                                    Produk
                                </h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li>
                                        <a
                                            href="#features"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Manajemen Tugas
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#teams"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Ruang Kerja Tim
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#features"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Kategori & Tag
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#features"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Log Aktivitas Real-Time
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 2: Keamanan */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] dark:text-white">
                                    Keamanan
                                </h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li>
                                        <a
                                            href="#security"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Autentikasi Passkey
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#security"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Otentikasi 2FA
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#security"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Otorisasi Peran & Akses
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/login"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Single Sign-On (Google)
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Column 3: Informasi */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] dark:text-white">
                                    Informasi
                                </h4>
                                <ul className="space-y-2.5 text-sm">
                                    <li>
                                        <a
                                            href="#"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Tentang Kami
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Kebijakan Privasi
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Syarat & Ketentuan
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="transition-colors hover:text-[#0a0a0a] dark:hover:text-white"
                                        >
                                            Kontak Dukungan
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Sub-footer bottom bar */}
                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737373] dark:text-[#a3a3a3]">
                            <p>
                                © {new Date().getFullYear()} TodoCraft Inc. Seluruh hak cipta dilindungi.
                            </p>
                            <div className="flex items-center gap-6">
                                <a
                                    href="#"
                                    className="hover:text-[#0a0a0a] dark:hover:text-white transition-colors"
                                >
                                    Privasi
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-[#0a0a0a] dark:hover:text-white transition-colors"
                                >
                                    Ketentuan
                                </a>
                                <a
                                    href="#"
                                    className="hover:text-[#0a0a0a] dark:hover:text-white transition-colors"
                                >
                                    Status
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
