import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    status?: number;
    message?: string;
}

export default function ErrorPage({ status = 403, message }: Props) {
    const titles: Record<number, string> = {
        403: 'Akses Ditolak',
        404: 'Halaman Tidak Ditemukan',
        500: 'Kesalahan Server',
        503: 'Layanan Tidak Tersedia',
    };

    const descriptions: Record<number, string> = {
        403: 'Anda tidak memiliki izin yang diperlukan untuk mengakses halaman ini atau melakukan tindakan ini di ruang kerja tim.',
        404: 'Halaman atau sumber daya yang Anda cari tidak dapat ditemukan atau telah dipindahkan.',
        500: 'Terjadi kesalahan internal yang tidak terduga pada server kami. Silakan coba lagi beberapa saat lagi.',
        503: 'Aplikasi sedang menjalani pemeliharaan terjadwal. Silakan periksa kembali sebentar lagi.',
    };

    const title = titles[status] || 'Terjadi Kesalahan';
    const description = message || descriptions[status] || 'Terjadi masalah saat memuat halaman ini.';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8f8f6] p-6 text-[#121212] selection:bg-[#d97757] selection:text-white dark:bg-[#121212] dark:text-[#f8f8f6]">
            <Head title={`${status} - ${title}`} />

            <div className="mx-auto flex max-w-md flex-col items-center text-center">
                {/* Visual Icon Badge */}
                <div className="relative flex size-20 items-center justify-center rounded-3xl border border-[#e7e6e1] bg-white shadow-xl dark:border-[#2f2f2c] dark:bg-[#1c1c1a]">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-[#d97757]/20 to-transparent blur-md" />
                    <ShieldAlert className="relative size-10 text-[#d97757]" />
                </div>

                {/* Status Code */}
                <span className="mt-6 font-mono text-sm font-semibold tracking-wider text-[#d97757] uppercase">
                    Kesalahan {status}
                </span>

                {/* Title */}
                <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[#121212] sm:text-4xl dark:text-[#f8f8f6]">
                    {title}
                </h1>

                {/* Description */}
                <p className="mt-3 text-sm leading-relaxed text-[#7b7974] dark:text-[#9c9a92]">
                    {description}
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border-[#e7e6e1] bg-white px-5 py-2.5 text-sm font-medium text-[#121212] transition-transform hover:bg-[#efeeeb] active:scale-95 dark:border-[#2f2f2c] dark:bg-[#1c1c1a] dark:text-[#f8f8f6] dark:hover:bg-[#282826]"
                    >
                        <ArrowLeft className="size-4" />
                        Kembali
                    </Button>

                    <Link href="/">
                        <Button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#121212] px-5 py-2.5 text-sm font-medium text-[#f8f8f6] shadow-md transition-transform hover:bg-[#373734] active:scale-95 dark:bg-[#f8f8f6] dark:text-[#121212] dark:hover:bg-[#efeeeb]">
                            <Home className="size-4" />
                            Kembali ke Beranda
                        </Button>
                    </Link>
                </div>

                {/* Subtle Support Note */}
                <div className="mt-12 border-t border-[#e7e6e1] pt-6 text-xs text-[#9c9a92] dark:border-[#2f2f2c]">
                    Jika Anda yakin ini adalah kesalahan, silakan hubungi pemilik ruang kerja tim Anda untuk meminta izin.
                </div>
            </div>
        </div>
    );
}
