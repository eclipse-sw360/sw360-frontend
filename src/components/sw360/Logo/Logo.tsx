// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import defaultLogo from '@/assets/images/sw360-logo.svg'
import { useTheme } from 'next-themes'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import { JSX } from 'react'

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
    const { resolvedTheme } = useTheme()

    const renderImage = () => {
        if (typeof src === 'string') {
            return (
                <Image
                    src={src}
                    width={width}
                    height={height}
                    alt={alt}
                />
            )
        }
        return (
            <Image
                src={src}
                width={width}
                height={height}
                alt={alt}
            />
        )
    }

    return (
        <div
            className='d-flex flex-column align-items-end justify-content-center'
            style={{ lineHeight: 1, position: 'relative' }}
        >
            {renderImage()}
            {!isDefault && (
                <small
                    className={`fw-normal mt-0 ${
                        resolvedTheme === 'dark' ? 'text-secondary' : 'text-light opacity-75'
                    }`}
                    style={{
                        fontSize: '0.65rem',
                        textShadow:
                            resolvedTheme === 'dark' ? '0 1px 1px rgba(255,255,255,0.8)' : '0 1px 2px rgba(0,0,0,0.8)',
                        fontFamily: 'sans-serif',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Powered by SW360
                </small>
            )}
        </div>
    )
}

export default Logo
