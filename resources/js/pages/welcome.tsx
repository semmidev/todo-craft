import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock,
    KeyRound,
    Layers,
    Lock,
    ShieldCheck,
    Sparkles,
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
            title: 'Design System Typography & Tokens',
            category: 'Design',
            color: '#d97757',
            priority: 'urgent',
            completed: true,
            assignee: 'Sammidev',
        },
        {
            id: 2,
            title: 'Implement Multi-tenant RBAC Middleware',
            category: 'Backend',
            color: '#3b82f6',
            priority: 'high',
            completed: false,
            assignee: 'Alex R.',
        },
        {
            id: 3,
            title: 'Audit Passkey & 2FA Auth Security',
            category: 'Security',
            color: '#10b981',
            priority: 'medium',
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
            <Head title="TodoCraft - Collaborative Team Task Management" />

            <div className="min-h-screen bg-[#f8f8f6] font-sans text-[#121212] selection:bg-[#d97757]/20 selection:text-[#d97757] dark:bg-[#121212] dark:text-[#f8f8f6]">
                {/* Header Navigation */}
                <header className="sticky top-0 z-40 w-full border-b border-[#e7e6e1] bg-[#f8f8f6]/80 backdrop-blur-md dark:border-[#2f2f2c] dark:bg-[#121212]/80">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
                        {/* Brand Logo */}
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

                        {/* Navigation Links */}
                        <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-[#373734] dark:text-[#9c9a92]">
                            <a href="#features" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Features
                            </a>
                            <a href="#security" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Security & RBAC
                            </a>
                            <a href="#teams" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                Teams
                            </a>
                            <a href="#faq" className="transition-colors hover:text-[#121212] dark:hover:text-[#f8f8f6]">
                                FAQ
                            </a>
                        </nav>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#121212] px-4 py-2 text-sm font-medium text-[#f8f8f6] shadow-sm transition-all hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-[#373734] transition-colors hover:text-[#121212] dark:text-[#9c9a92] dark:hover:text-[#f8f8f6]"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 rounded-lg bg-[#121212] px-4 py-2 text-sm font-medium text-[#f8f8f6] shadow-sm transition-all hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                    >
                                        Get Started Free
                                        <ArrowRight className="h-4 w-4 text-[#d97757]" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
                    <div className="mx-auto max-w-5xl text-center">
                        {/* Top Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#e7e6e1] bg-[#efeeeb] px-3.5 py-1 text-xs font-medium text-[#373734] dark:border-[#2f2f2c] dark:bg-[#1c1c1a] dark:text-[#9c9a92]">
                            <span className="h-2 w-2 rounded-full bg-[#d97757] animate-pulse" />
                            <span>COLLABORATIVE TEAM WORKSPACE</span>
                        </div>

                        {/* Editorial Headline */}
                        <h1 className="mt-6 font-serif text-4xl font-normal tracking-tight text-[#121212] sm:text-6xl sm:leading-[1.15] dark:text-[#f8f8f6]">
                            Organize team tasks with <br className="hidden sm:inline" />
                            <span className="italic">effortless clarity</span> and speed.
                        </h1>

                        <p className="mx-auto mt-6 max-w-2xl text-base text-[#7b7974] sm:text-lg dark:text-[#9c9a92]">
                            A modern, team-first workspace to capture todo items, assign custom RBAC permissions, categorize workflows, and ship projects together seamlessly.
                        </p>

                        {/* CTA Actions */}
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Create Free Team Workspace
                                    <ArrowRight className="h-4 w-4 text-[#d97757]" />
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="inline-flex items-center gap-2 rounded-lg border border-[#e7e6e1] bg-white px-6 py-3.5 text-sm font-medium text-[#121212] shadow-xs transition-colors hover:bg-[#efeeeb] dark:border-[#2f2f2c] dark:bg-[#1c1c1a] dark:text-[#f8f8f6] dark:hover:bg-[#282826]"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>

                    {/* Interactive Mockup Container */}
                    <div className="mx-auto mt-14 max-w-5xl">
                        <div className="overflow-hidden rounded-2xl border border-[#e7e6e1] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-6 dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                            {/* App Window Header Bar */}
                            <div className="flex items-center justify-between border-b border-[#e7e6e1] pb-4 dark:border-[#2f2f2c]">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-[#ef4444]/80" />
                                    <div className="h-3 w-3 rounded-full bg-[#f59e0b]/80" />
                                    <div className="h-3 w-3 rounded-full bg-[#10b981]/80" />
                                    <span className="ml-2 font-mono text-xs text-[#7b7974] dark:text-[#9c9a92]">
                                        TodoCraft — Default Workspace
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
                                        All Tasks
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                            activeTab === 'pending'
                                                ? 'bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]'
                                                : 'text-[#7b7974] hover:bg-[#efeeeb] dark:text-[#9c9a92] dark:hover:bg-[#282826]'
                                        }`}
                                    >
                                        Pending
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('completed')}
                                        className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                            activeTab === 'completed'
                                                ? 'bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]'
                                                : 'text-[#7b7974] hover:bg-[#efeeeb] dark:text-[#9c9a92] dark:hover:bg-[#282826]'
                                        }`}
                                    >
                                        Completed
                                    </button>
                                </div>
                            </div>

                            {/* Task List Preview */}
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

                {/* Features Section */}
                <section id="features" className="border-t border-[#e7e6e1] bg-white py-20 dark:border-[#2f2f2c] dark:bg-[#161615]">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h2 className="font-serif text-3xl font-normal text-[#121212] sm:text-4xl dark:text-[#f8f8f6]">
                                Built for modern software teams.
                            </h2>
                            <p className="mt-4 text-base text-[#7b7974] dark:text-[#9c9a92]">
                                Everything you need to keep projects structured, team members accountable, and workflows transparent.
                            </p>
                        </div>

                        {/* 3x2 Grid */}
                        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Users className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Multi-Tenant Workspaces
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Switch seamlessly between your personal workspace and multiple team accounts with dedicated data isolation.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <ShieldCheck className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Granular RBAC & Roles
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Create custom roles (Owner, Admin, Member, Custom) with fine-grained permissions for tasks and categories.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Tag className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Visual Categories & Tags
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Organize tasks into color-coded categories, priority matrices (Urgent, High, Medium, Low), and subtask checklists.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Activity className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Activity Logs & Audit Trail
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Track team activities, task status transitions, role changes, and member invitations in real-time.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <KeyRound className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    2FA & Passkey Security
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Protect accounts with Two-Factor TOTP authentication and biometrics / WebAuthn hardware passkeys.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="rounded-2xl border border-[#e7e6e1] bg-[#f8f8f6] p-8 transition hover:shadow-md dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#121212] text-white dark:bg-[#f8f8f6] dark:text-[#121212]">
                                    <Zap className="h-5 w-5 text-[#d97757]" />
                                </div>
                                <h3 className="mt-5 font-serif text-xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Instant Search & Filters
                                </h3>
                                <p className="mt-2 text-sm text-[#7b7974] leading-relaxed dark:text-[#9c9a92]">
                                    Filter tasks by category, status, priority, due dates, or assignee with zero-latency instant search.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Metrics Showcase */}
                <section className="border-t border-[#e7e6e1] bg-[#f8f8f6] py-16 dark:border-[#2f2f2c] dark:bg-[#121212]">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    99.9%
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Uptime Reliability
                                </div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    &lt;50ms
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Response Latency
                                </div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    100%
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Data Isolation
                                </div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl font-normal text-[#121212] dark:text-[#f8f8f6]">
                                    Zero
                                </div>
                                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-[#7b7974] dark:text-[#9c9a92]">
                                    Config Overhead
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Call to Action Section */}
                <section className="border-t border-[#e7e6e1] bg-white py-20 dark:border-[#2f2f2c] dark:bg-[#161615]">
                    <div className="mx-auto max-w-4xl text-center px-6">
                        <h2 className="font-serif text-3xl font-normal text-[#121212] sm:text-5xl dark:text-[#f8f8f6]">
                            Ready to transform your team's workflow?
                        </h2>
                        <p className="mt-4 text-base text-[#7b7974] dark:text-[#9c9a92]">
                            Start organizing your tasks with TodoCraft today. Free for teams of all sizes.
                        </p>
                        <div className="mt-8 flex justify-center">
                            {auth.user ? (
                                <Link
                                    href={dashboardUrl}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Enter Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <Link
                                    href={register()}
                                    className="inline-flex items-center gap-2.5 rounded-lg bg-[#121212] px-6 py-3.5 text-sm font-medium text-[#f8f8f6] shadow-lg transition-all hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]"
                                >
                                    Get Started Free
                                    <ArrowRight className="h-4 w-4 text-[#d97757]" />
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* Footer Band */}
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
                                <a href="#features" className="hover:text-white transition">Features</a>
                                <a href="#security" className="hover:text-white transition">Security</a>
                                <a href="#teams" className="hover:text-white transition">Teams</a>
                                <a href="#faq" className="hover:text-white transition">FAQ</a>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                            <p>© {new Date().getFullYear()} TodoCraft Inc. All rights reserved.</p>
                            <p className="flex items-center gap-1">
                                Powered by <span className="text-white font-medium">Laravel 12 & Inertia React</span>
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
