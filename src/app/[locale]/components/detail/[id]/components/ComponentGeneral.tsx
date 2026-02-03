// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { BsClipboard } from 'react-icons/bs'
import AdditionalData from '@/components/AdditionalData/AdditionalData'
import ExternalIds from '@/components/ExternalIds/ExternalIds'
import { Component } from '@/object-types'
import CommonUtils from '@/utils/common.utils'

interface Props {
    component: Component
    componentId: string
}

const ComponentGeneral = ({ component, componentId }: Props): ReactNode => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)
    return (
        <table className='table summary-table'>
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
                    <td>Id:</td>
                    <td id='documentId'>
                        {componentId}
                        <button
                            id='copyToClipboard'
                            type='button'
                            className='btn btn-sm'
                            data-toggle='tooltip'
                            title='Copy to clipboard'
                        >
                            <BsClipboard
                                style={{
                                    color: 'gray',
                                    width: '20px',
                                }}
                                size={20}
                            />
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
                        {component._embedded?.createdBy && (
                            <Link
                                className='text-link'
                                href={`mailto:${component._embedded.createdBy.email}`}
                            >
                                {component._embedded.createdBy.fullName}
                            </Link>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Categories')}:</td>
                    {component.categories && <td>{component.categories.join(',')}</td>}
                </tr>
                <tr>
                    <td>{t('Modified On')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(component['modifiedOn']) && component['modifiedOn']}
                    </td>
                </tr>
                <tr>
                    <td>{t('Modified By')}:</td>
                    <td>
                        {component._embedded?.modifiedBy && (
                            <Link
                                className='text-link'
                                href={`mailto:${component._embedded.modifiedBy.email}`}
                            >
                                {component._embedded.modifiedBy.fullName}
                            </Link>
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
                    <td>{t('CycloneDX Component Type')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(component.cycloneDxComponentType)
                            ? component.cycloneDxComponentType
                            : '-'}
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
                        {!CommonUtils.isNullEmptyOrUndefinedString(component.homepage) && (
                            <Link
                                className='text-link'
                                href={component.homepage}
                            >
                                {component.homepage}
                            </Link>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{`${t('VCS')} / ${t('Repository URL')}`}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(component.vcs) && (
                            <Link
                                className='text-link'
                                href={component.vcs}
                                target='_blank'
                                rel='noopener noreferrer'
                            >
                                {component.vcs}
                            </Link>
                        )}
                    </td>
                </tr>

                <tr>
                    <td>{t('Blog')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(component.blog) && (
                            <Link
                                className='text-link'
                                href={component.blog}
                            >
                                {component.blog}
                            </Link>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Wiki')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(component.wiki) && (
                            <Link
                                className='text-link'
                                href={component.wiki}
                            >
                                {component.wiki}
                            </Link>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Mailing list')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(component.mailinglist) && (
                            <Link
                                className='text-link'
                                href={component.mailinglist}
                            >
                                {component.mailinglist}
                            </Link>
                        )}
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
                        <ul
                            id='list-data-additional-contentComponent'
                            className='mapDisplayRootItem'
                        >
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
