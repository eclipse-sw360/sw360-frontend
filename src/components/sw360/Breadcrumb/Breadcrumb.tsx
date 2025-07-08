// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbProps {
    name?: string
}

export default function Breadcrumb({ name }: BreadcrumbProps) {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)
    const visibleSegments = segments.slice(0, 2)

    const breadcrumbs = visibleSegments.map((segment, index) => {
        const href = '/' + visibleSegments.slice(0, index + 1).join('/')
        const label = index === 1 && name ? name : formatSegment(segment)
        const isLast = index === visibleSegments.length - 1

        return { label, href, isLast }
    })

    return (
        <nav aria-label='breadcrumb'>
            <div className='d-flex flex-wrap align-items-center container page-content'>
                {breadcrumbs.map((crumb, index) => (
                    <span
                        key={crumb.href}
                        className='d-flex align-items-center'
                    >
                        {index > 0 && <span className='mx-1 text-muted'>{'>'}</span>}
                        {!crumb.isLast ? (
                            <Link
                                href={crumb.href}
                                className='btn-icon'
                            >
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className='fw-semibold text-dark'>{crumb.label}</span>
                        )}
                    </span>
                ))}
            </div>
        </nav>
    )
}

function formatSegment(segment: string): string {
    return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
