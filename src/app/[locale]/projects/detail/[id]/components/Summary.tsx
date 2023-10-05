// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BiClipboard } from 'react-icons/bi'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import { SummaryDataType } from '@/object-types/SummaryDataType'
import styles from '../detail.module.css'
import { useState } from 'react'

export default function Summary({ summaryData }: { summaryData: SummaryDataType }) {
    const t = useTranslations(COMMON_NAMESPACE)
    const [toggleGeneralInformation, setToggleGeneralInformation] = useState(false)
    const [toggleRoles, setToggleRoles] = useState(false)
    const [toggleVendor, setToggleVendor] = useState(false)

    const Clipboard = ({ text }: { text: string }) => {
        return (
            <>
                <OverlayTrigger overlay={<Tooltip>{t('Copy to Clipboard')}</Tooltip>}>
                    <span className='d-inline-block'>
                        <BiClipboard
                            onClick={() => {
                                navigator.clipboard.writeText(text)
                            }}
                        />
                    </span>
                </OverlayTrigger>
            </>
        )
    }

    return (
        <>
            <p className='mt-3 mb-4 px-0 mx-0'>{summaryData.description}</p>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleGeneralInformation(!toggleGeneralInformation)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('General Information')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleGeneralInformation}>
                    <tr>
                        <td>{t('Id')}:</td>
                        <td>
                            {summaryData.id} <Clipboard text={summaryData.id} />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Name')}:</td>
                        <td>{summaryData.version}</td>
                    </tr>
                    <tr>
                        <td>{t('Version')}:</td>
                        <td>{summaryData.version}</td>
                    </tr>
                    <tr>
                        <td>{t('Visibility')}:</td>
                        <td>{summaryData.visibility.charAt(0) + summaryData.visibility.slice(1).toLowerCase()}</td>
                    </tr>
                    <tr>
                        <td>{t('Created On')}:</td>
                        <td>{summaryData.createdOn}</td>
                    </tr>
                    <tr>
                        <td>{t('Created By')}:</td>
                        <td>
                            <Link className={`text-link`} href={`mailto:${summaryData.createdBy.email}`}>
                                {summaryData.createdBy.name}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Modified On')}:</td>
                        <td>{summaryData.modifiedOn}</td>
                    </tr>
                    <tr>
                        <td>{t('Modified By')}:</td>
                        <td>
                            <Link className={`text-link`} href={`mailto:${summaryData.modifiedBy.email}`}>
                                {summaryData.modifiedBy.name}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Project Type')}:</td>
                        <td>{summaryData.projectType.charAt(0) + summaryData.projectType.slice(1).toLowerCase()}</td>
                    </tr>
                    <tr>
                        <td>{t('Domain')}:</td>
                        <td>{summaryData.domain}</td>
                    </tr>
                    <tr>
                        <td>{t('Tag')}:</td>
                        <td>{summaryData.tag}</td>
                    </tr>
                    <tr>
                        <td>{t('External Ids')}:</td>
                        <td>
                            {Array.from(summaryData.externalIds).map(([name, value]) => (
                                <li key={name}>
                                    <span className='fw-bold'>{name}</span> {value}
                                </li>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Additional Data')}:</td>
                        <td>
                            {Array.from(summaryData.additionalData).map(([name, value]) => (
                                <li key={name}>
                                    <span className='fw-bold'>{name}</span> {value}
                                </li>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('External URLs')}:</td>
                        <td>
                            {Array.from(summaryData.externalUrls).map(([name, value]) => (
                                <li key={name}>
                                    <span className='fw-bold'>{name}</span>{' '}
                                    <Link className='text-link' href={`mailto:${value}`}>
                                        {value}
                                    </Link>
                                </li>
                            ))}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleRoles(!toggleRoles)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('Roles')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleRoles}>
                    <tr>
                        <td>{t('Group')}:</td>
                        <td>{summaryData.group}</td>
                    </tr>
                    <tr>
                        <td>{t('Project Responsible')}:</td>
                        <td>
                            <Link className='text-link' href={`mailto:${summaryData.projectResponsible.email}`}>
                                {summaryData.projectResponsible.name}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Project Owner')}:</td>
                        <td>
                            <Link className='text-link' href={`mailto:${summaryData.projectOwner.email}`}>
                                {summaryData.projectOwner.name}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Owner Accounting Unit')}:</td>
                        <td>{summaryData.ownerAccountingUnit}</td>
                    </tr>
                    <tr>
                        <td>{t('Owner Billing Group')}:</td>
                        <td>{summaryData.ownerBillingGroup}</td>
                    </tr>

                    <tr>
                        <td>{t('Owner Country')}:</td>
                        <td>{new Intl.DisplayNames(['en'], { type: 'region' }).of(summaryData.ownerCountry)}</td>
                    </tr>
                    <tr>
                        <td>{t('Lead Architect')}:</td>
                        <td>
                            <Link className='text-link' href={`mailto:${summaryData.leadArchitect.email}`}>
                                {summaryData.leadArchitect.name}
                            </Link>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Moderators')}:</td>
                        <td>
                            {summaryData.moderators.map((elem, i) => (
                                <li key={elem.email} style={{ display: 'inline' }}>
                                    <Link className='text-link' href={`mailto:${elem.email}`} key={elem.email}>
                                        {elem.name}
                                    </Link>
                                    {i === summaryData.moderators.length - 1 ? '' : ','}{' '}
                                </li>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Contributors')}:</td>
                        <td>
                            {summaryData.contributors.map((elem, i) => (
                                <li key={elem.email} style={{ display: 'inline' }}>
                                    <Link className='text-link' href={`mailto:${elem.email}`} key={elem.email}>
                                        {elem.name}
                                    </Link>
                                    {i === summaryData.contributors.length - 1 ? '' : ','}{' '}
                                </li>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Security Responsibles')}:</td>
                        <td>
                            {summaryData.securityResponsibles.map((elem, i) => (
                                <li key={elem.email} style={{ display: 'inline' }}>
                                    <Link className='text-link' href={`mailto:${elem.email}`} key={elem.email}>
                                        {elem.name}
                                    </Link>
                                    {i === summaryData.securityResponsibles.length - 1 ? '' : ','}{' '}
                                </li>
                            ))}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Additional Roles')}:</td>
                        <td>
                            {Array.from(summaryData.additionalRoles).map(([name, value]) => (
                                <li key={name}>
                                    <span className='fw-bold'>{name}</span>{' '}
                                    <Link className='text-link' href={`mailto:${value}`}>
                                        {value}
                                    </Link>
                                </li>
                            ))}
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleVendor(!toggleVendor)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('Project Vendor')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleVendor}>
                    <tr>
                        <td>{t('Full Name')}:</td>
                        <td>{summaryData.vendorFullName}</td>
                    </tr>
                    <tr>
                        <td>{t('Short Name')}:</td>
                        <td>{summaryData.vendorShortName}</td>
                    </tr>
                    <tr>
                        <td>{t('URL')}:</td>
                        <td>{summaryData.vendorUrl}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
