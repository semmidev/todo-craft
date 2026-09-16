import { useState } from 'react';

export interface PresignedUploadResult {
    key: string;
    original_name: string;
    mime_type: string;
    size: number;
}

export function usePresignedUpload() {
    const [progress, setProgress] = useState<number>(0);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = async (file: File): Promise<PresignedUploadResult> => {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        try {
            // Step 1: Request presigned URL from backend
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const response = await fetch('/upload/presigned-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    filename: file.name,
                    file_type: file.type || 'application/octet-stream',
                    size: file.size,
                }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Gagal mendapatkan URL presigned upload.');
            }

            const data = await response.json();


            // Handle both string URL and object { url, headers } from temporaryUploadUrl
            const rawUploadUrl = data.upload_url;
            const upload_url: string = typeof rawUploadUrl === 'string'
                ? rawUploadUrl
                : (rawUploadUrl?.url ?? '');
            const key: string = data.key;
            const headers: Record<string, string> = {
                ...(data.headers || {}),
                ...(typeof rawUploadUrl === 'object' && rawUploadUrl?.headers ? rawUploadUrl.headers : {}),
            };


            const performUpload = (targetUrl: string, reqHeaders?: Record<string, string>): Promise<void> => {
                return new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('PUT', targetUrl, true);

                    if (reqHeaders) {
                        Object.entries(reqHeaders).forEach(([hKey, hVal]) => {
                            // Skip Host header — browsers disallow setting it
                            if (hKey.toLowerCase() === 'host') return;
                            const val = Array.isArray(hVal) ? hVal[0] : hVal;
                            if (typeof val === 'string') {
                                xhr.setRequestHeader(hKey, val);
                            }
                        });
                    }

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percent = Math.round((event.loaded / event.total) * 100);
                            setProgress(percent);
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            resolve();
                        } else {
                            reject(new Error(`Gagal mengunggah berkas (${xhr.status}).`));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Terjadi kesalahan jaringan atau CORS saat mengunggah berkas.'));
                    xhr.send(file);
                });
            };

            // Step 2: Try direct upload to presigned URL, fallback to signed local proxy URL on CORS / network failure
            try {
                await performUpload(upload_url, headers);
            } catch (firstErr) {
                if (data.fallback_url) {
                    await performUpload(data.fallback_url, {
                        'Content-Type': file.type || 'application/octet-stream',
                    });
                } else {
                    throw firstErr;
                }
            }

            setIsUploading(false);
            setProgress(100);

            return {
                key,
                original_name: file.name,
                mime_type: file.type || 'application/octet-stream',
                size: file.size,
            };
        } catch (err: any) {
            setIsUploading(false);
            setError(err.message || 'Gagal mengunggah berkas.');
            throw err;
        }
    };

    const uploadMultiple = async (files: File[]): Promise<PresignedUploadResult[]> => {
        const results: PresignedUploadResult[] = [];
        for (const file of files) {
            const res = await uploadFile(file);
            results.push(res);
        }
        return results;
    };

    return {
        uploadFile,
        uploadMultiple,
        isUploading,
        progress,
        error,
    };
}
