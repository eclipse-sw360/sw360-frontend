// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX } from 'react'

interface SidebarCountBadgeProps {
    badgeClassName: string
    countId: string
    isLoading: boolean
    label: string
    value: string
}

export default function SidebarCountBadge({
    badgeClassName,
    countId,
    isLoading,
    label,
    value,
}: SidebarCountBadgeProps): JSX.Element {
    return (
        <div className='d-flex align-items-center my-2'>
            <span className='me-2'>{label}</span>
            <span
                id={countId}
                className={`badge ${badgeClassName}`}
                aria-live='polite'
            >
                {isLoading ? (
                    <span
                        className='spinner-border spinner-border-sm'
                        role='status'
                        aria-hidden='true'
                    ></span>
                ) : (
                    value
                )}
            </span>
        </div>
    )
}
