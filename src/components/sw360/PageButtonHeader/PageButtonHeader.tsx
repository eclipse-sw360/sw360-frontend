// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React from 'react'
import Link from 'next-intl/link'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import { PageButtonHeaderProps } from './PageButtonHeader.types'
import styles from './pagebuttonheader.module.css'

function PageButtonHeader({ title, buttons, children }: PageButtonHeaderProps) {
    const t = useTranslations(COMMON_NAMESPACE)
    let buttonList: JSX.Element[] = []
    if (buttons) {
        buttonList = Object.entries(buttons).map(([key, value]) => {
            return (
                // Button needs to link to the referenced page from props (value)
                // and switch to the correct tab (key)
                <Link href={value['link']} key={key}>
                    <button
                        key={key}
                        className={`btn btn-${value['type']}`}
                        style={{ marginRight: '10px' }}
                        onClick={value.onClick}
                    >
                        {t(key)}
                    </button>
                </Link>
            )
        })
    }

    return (
        <div className={`row ${styles['buttonheader-toolbar']}`}>
            <div className='col-auto'>
                <div className='btn-toolbar' role='toolbar'>
                    <div key='buttongroup' className='btn-group' role='group'>
                        {buttonList}
                        {children}
                    </div>
                </div>
            </div>
            {title && <div className={`col text-truncate ${styles['buttonheader-title']}`}>{title}</div>}
        </div>
    )
}

export default PageButtonHeader
