// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { JSX } from 'react'
import defaultLogo from '@/assets/images/sw360-logo.svg'

export interface LogoProps {
    /** Path to a custom image (URL or local import) */
    src?: string | StaticImport
    /** Optional alt text */
    alt?: string
    /** Optional width and height */
    width?: number
    height?: number
}

/**
 * Displays a customizable logo.
 * - Uses the default SW360 logo if `src` is not provided.
 * - Accepts either a static import or an external image URL.
 */
function Logo({
    src = defaultLogo as StaticImport,
    alt = 'SW360 Logo',
    width = 147,
    height = 57,
}: LogoProps): JSX.Element {
    const isDefault = src === defaultLogo
    const { resolvedTheme: themeFromHook } = useTheme()
    const resolvedTheme = isDefault ? 'light' : themeFromHook

    // Helper to normalize src and enforce SVG
    const getImageSrc = () => {
        if (typeof src === 'string') {
            let normalizedSrc = src
            if (!normalizedSrc.startsWith('/')) {
                normalizedSrc = '/' + normalizedSrc
            }
            return normalizedSrc
        }
        // StaticImport (local asset)
        return src
    }

    const renderImage = () => (
        <Image
            src={getImageSrc()}
            width={width}
            height={height}
            alt={alt}
        />
    )

    return (
        <div
            className='d-flex flex-column align-items-end justify-content-center'
            style={{
                lineHeight: 1,
                position: 'relative',
            }}
        >
            {renderImage()}
            {!isDefault && (
                <small
                    className={`fw-normal mt-0 custom-logo ${
                        resolvedTheme === 'dark' ? 'logo-sw360text-dark' : 'logo-sw360text-light'
                    }`}
                >
                    Powered by SW360
                </small>
            )}
        </div>
    )
}

export default Logo
