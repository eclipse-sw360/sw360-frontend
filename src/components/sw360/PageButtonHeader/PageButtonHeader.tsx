// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'

import { PageButtonHeaderProps } from './PageButtonHeader.types'
import styles from './pagebuttonheader.module.css'

import { Button } from 'react-bootstrap'

function PageButtonHeader({ title, buttons, children }: PageButtonHeaderProps) {
    let buttonList: JSX.Element[] = []
    if (buttons) {
        buttonList = Object.entries(buttons).map(([key, value]) => {
            return (
                // Button needs to link to the referenced page from props (value)
                // and switch to the correct tab (key)
                <Link href={value['link']} key={key}>
                    <Button key={key} variant={`${value['type']}`}>
                        {value?.name}
                    </Button>
                </Link>
            )
        })
    }

    return (
        <div className='d-flex gap-2'>
            {buttonList}
            {children}
            {title && <div className={`col text-truncate ${styles['buttonheader-title']}`}>{title}</div>}
        </div>
    )
}

export default PageButtonHeader
