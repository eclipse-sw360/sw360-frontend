// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'

import { useTranslations } from 'next-intl'
import { PageButtonHeaderProps } from './PageButtonHeader.types'
import styles from './pagebuttonheader.module.css'

function PageButtonHeader({
    title,
    buttons,
    children,
    checked,
    changesLogTab,
    changeLogIndex,
    setChangesLogTab,
}: PageButtonHeaderProps) {
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
                        {value?.name}
                    </button>
                </Link>
            )
        })
    }

    const t = useTranslations('default')
    return (
        <div className={`row ${styles['buttonheader-toolbar']}`} style={{ display: 'flex' }}>
            <div className='col-auto'>
                <div className='btn-toolbar' role='toolbar'>
                    <div key='buttongroup' className='btn-group' role='group'>
                        {buttonList}
                        {children}
                    </div>
                </div>
            </div>
            {title && (
                <div className={`col text-truncate ${styles['buttonheader-title']}`}>
                    <div>
                        {title}
                        {checked != undefined && (
                            <>
                                {checked ? (
                                    <span className={`badge ${styles['checked']}`}>
                                        CHECKED
                                    </span>
                                ) : (
                                    <span className={`badge ${styles['un-checked']}`}>
                                        UNCHECKED
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {changesLogTab && (
                <div className={`list-group-companion ${styles['div-changelog']}`}>
                    <div
                        className='nav nav-pills justify-content-center bg-light font-weight-bold'
                        id='pills-tab'
                        role='tablist'
                        style={{ marginRight: '0px' }}
                    >
                        <div>
                            <a
                                className={`nav-item nav-link ${changesLogTab == 'list-change' ? 'active' : ''} ${styles['a-changelog']}`}
                                onClick={() => setChangesLogTab('list-change')}
                               
                            >
                                {t('Change Log')}
                            </a>
                        </div>
                        <div>
                            <a
                                className={`nav-item nav-link ${changesLogTab == 'view-log' ? 'active' : ''} ${styles['a-changes']}`}
                                onClick={() => {
                                    changeLogIndex !== -1 && setChangesLogTab('view-log')
                                }}
                            >
                                {t('Changes')}
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PageButtonHeader
