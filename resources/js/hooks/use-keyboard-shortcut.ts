import { useEffect } from 'react';

export function useKeyboardShortcut(
    key: string,
    callback: () => void,
    options: {
        ignoreInputs?: boolean;
    } = { ignoreInputs: true },
) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (options.ignoreInputs) {
                const target = event.target as HTMLElement | null;
                if (!target) return;

                const tagName = target.tagName;
                const isInput =
                    tagName === 'INPUT' ||
                    tagName === 'TEXTAREA' ||
                    tagName === 'SELECT' ||
                    target.isContentEditable;

                if (isInput) return;
            }

            if (
                event.key.toLowerCase() === key.toLowerCase() &&
                !event.ctrlKey &&
                !event.metaKey &&
                !event.altKey
            ) {
                event.preventDefault();
                callback();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [key, callback, options.ignoreInputs]);
}
