    // Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

    // This program and the accompanying materials are made
    // available under the terms of the Eclipse Public License 2.0
    // which is available at https://www.eclipse.org/legal/epl-2.0/

    // SPDX-License-Identifier: EPL-2.0
    // License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

import styles from './pagebuttonheader.module.css'

interface Props {
    title?: string
    buttons?: { [key: string]: { [key: string]: string } }
}

function PageButtonHeader({ title, buttons }: Props) {
    const t = useTranslations(COMMON_NAMESPACE)
    let buttonList: JSX.Element[] = []
    if (buttons) {
        buttonList = Object.entries(buttons).map(([key, value]) => {
            return (
                // Button needs to link to the referenced page from props (value)
                // and switch to the correct tab (key)
                <div key={key} className='btn-group' role='group'>
                    <Link href={value['link']} key={key}>
                        <button key={key} className={`btn btn-${value['type']}`}>
                            {t(key)}
                        </button>
                    </Link>
                </div>
            )
        })
    }

    return (
        <div className={`row ${styles['buttonheader-toolbar']}`}>
            <div className='col-auto'>
                <div className='btn-toolbar' role='toolbar'>
                    {buttonList}
                </div>
            </div>
            {title && <div className={`col text-truncate ${styles['buttonheader-title']}`}>{title}</div>}
        </div>
    )
}

export default PageButtonHeader
