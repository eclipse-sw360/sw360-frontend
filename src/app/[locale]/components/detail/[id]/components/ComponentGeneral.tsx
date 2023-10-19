// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { FaCopy } from 'react-icons/fa'

import AdditionalData from '@/components/AdditionalData/AdditionalData'
import ExternalIds from '@/components/ExternalIds/ExternalIds'
import { Component } from '@/object-types'
import styles from '../detail.module.css'

interface Props {
    component: Component
    componentId: string
}

const ComponentGeneral = ({ component, componentId }: Props) => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)
    return (
        <table className={`table label-value-table ${styles['summary-table']}`}>
            <thead
                title='Click to expand or collapse'
                onClick={() => {
                    setToggle(!toggle)
                }}
            >
                <tr>
                    <th colSpan={2}>{t('General')}</th>
                </tr>
            </thead>
            <tbody hidden={toggle}>
                <tr>
                    <td className={styles.tag}>Id:</td>
                    <td id='documentId'>
                        {componentId}
                        <button
                            id='copyToClipboard'
                            type='button'
                            className='btn btn-sm'
                            data-toggle='tooltip'
                            title='Copy to clipboard'
                        >
                            <FaCopy style={{ color: 'gray', width: '20px' }} />
                        </button>
                    </td>
                </tr>
                <tr>
                    <td>{t('Name')}:</td>
                    <td>{component.name}</td>
                </tr>
                <tr>
                    <td>{t('Created On')}:</td>
                    <td>{component.createdOn}</td>
                </tr>
                <tr>
                    <td>{t('Created by')}:</td>
                    <td>
                        {component['_embedded'] && (
                            <a className={styles.link} href={`mailto:${component['_embedded']['createdBy']['email']}`}>
                                {component['_embedded']['createdBy']['fullName']}
                            </a>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Categories')}:</td>
                    {component.categories && <td>{component.categories.join(',')}</td>}
                </tr>
                <tr>
                    <td>{t('Modified On')}:</td>
                    <td>{component['modifiedOn'] && component['modifiedOn']}</td>
                </tr>
                <tr>
                    <td>{t('Modified By')}:</td>
                    <td>
                        {component['modifiedBy'] && (
                            <a className={styles.link} href={`mailto:${component['modifiedBy']}`}></a>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Component Type')}:</td>
                    <td>
                        <span className='sw360-tt'>{component.componentType}</span>
                    </td>
                </tr>
                <tr>
                    <td>{t('Default vendor')}:</td>
                    <td>
                        {component['_embedded'] &&
                            component['_embedded']['defaultVendor'] &&
                            component['_embedded']['defaultVendor']['fullName']}
                    </td>
                </tr>
                <tr>
                    <td>{t('Homepage')}:</td>
                    <td>
                        <a href={component.homepage}>{component.homepage}</a>
                    </td>
                </tr>
                <tr>
                    <td>{t('Blog')}:</td>
                    <td>
                        <a href={component.blog}>{component.blog}</a>
                    </td>
                </tr>
                <tr>
                    <td>{t('Wiki')}:</td>
                    <td>
                        <a href={component.wiki}>{component.wiki}</a>
                    </td>
                </tr>
                <tr>
                    <td>{t('Mailing list')}:</td>
                    <td>
                        <a href={`mailto:${component.mailinglist}`}>{component.mailinglist}</a>
                    </td>
                </tr>
                <tr>
                    <td>{t('External ids')}:</td>
                    <td>
                        <ul className='mapDisplayRootItem'>
                            {component['externalIds'] && <ExternalIds externalIds={component['externalIds']} />}
                        </ul>
                    </td>
                </tr>
                <tr>
                    <td>{t('Additional Data')}:</td>
                    <td>
                        <ul id='list-data-additional-contentComponent' className='mapDisplayRootItem'>
                            {component['additionalData'] && (
                                <AdditionalData additionalData={component['additionalData']} />
                            )}
                        </ul>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default ComponentGeneral
