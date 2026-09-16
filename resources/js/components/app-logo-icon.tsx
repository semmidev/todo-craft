import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({
    className = 'size-6',
    alt = 'TodoCraft',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/icon.png"
            alt={alt}
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
