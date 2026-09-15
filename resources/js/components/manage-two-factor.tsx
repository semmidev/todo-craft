import { Form } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/heading';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Button } from '@/components/ui/button';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

export type Props = {
    canManageTwoFactor?: boolean;
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function ManageTwoFactor(props: Props) {
    const requiresConfirmation = props.requiresConfirmation ?? false;
    const twoFactorEnabled = props.twoFactorEnabled ?? false;

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        clearTwoFactorAuthData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const prevTwoFactorEnabled = useRef(twoFactorEnabled);

    useEffect(() => {
        if (prevTwoFactorEnabled.current && !twoFactorEnabled) {
            clearTwoFactorAuthData();
        }

        prevTwoFactorEnabled.current = twoFactorEnabled;
    }, [twoFactorEnabled, clearTwoFactorAuthData]);

    if (!(props.canManageTwoFactor ?? false)) {
        return null;
    }

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Otentikasi dua faktor"
                description="Kelola pengaturan otentikasi dua faktor Anda"
            />
            {twoFactorEnabled ? (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Anda akan diminta memasukkan PIN acak yang aman saat
                        masuk, yang dapat diambil dari aplikasi pendukung
                        TOTP di ponsel Anda.
                    </p>

                    <div className="relative inline">
                        <Form action={disable.url()} method="delete">
                            {({ processing }) => (
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={processing}
                                >
                                    Nonaktifkan 2FA
                                </Button>
                            )}
                        </Form>
                    </div>

                    <TwoFactorRecoveryCodes
                        recoveryCodesList={recoveryCodesList}
                        fetchRecoveryCodes={fetchRecoveryCodes}
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-start justify-start space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Saat mengaktifkan otentikasi dua faktor, Anda akan
                        diminta memasukkan PIN aman saat masuk. PIN ini dapat
                        diperoleh dari aplikasi pendukung TOTP di ponsel
                        Anda.
                    </p>

                    <div>
                        {hasSetupData ? (
                            <Button onClick={() => setShowSetupModal(true)}>
                                <ShieldCheck />
                                Lanjutkan pengaturan
                            </Button>
                        ) : (
                            <Form
                                action={enable.url()}
                                method="post"
                                onSuccess={() => setShowSetupModal(true)}
                            >
                                {({ processing }) => (
                                    <Button type="submit" disabled={processing}>
                                        Aktifkan 2FA
                                    </Button>
                                )}
                            </Form>
                        )}
                    </div>
                </div>
            )}

            <TwoFactorSetupModal
                isOpen={showSetupModal}
                onClose={() => setShowSetupModal(false)}
                requiresConfirmation={requiresConfirmation}
                twoFactorEnabled={twoFactorEnabled}
                qrCodeSvg={qrCodeSvg}
                manualSetupKey={manualSetupKey}
                clearSetupData={clearSetupData}
                fetchSetupData={fetchSetupData}
                errors={errors}
            />
        </div>
    );
}
