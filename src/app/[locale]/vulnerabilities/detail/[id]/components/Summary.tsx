// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { VulnerabilityPayload } from '@/object-types/VulnerabilityPayload'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Link from 'next-intl/link'
import styles from '../detail.module.css'

export default function Summary({ summaryData }: { summaryData: VulnerabilityPayload }) {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)

    return (
        <>
            <table className={`table label-value-table ${styles['summary-table']}`}>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggle(!toggle)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('Vulnerability Summary')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggle}>
                    <tr>
                        <td>{t('Title')}:</td>
                        <td>{summaryData.title && summaryData.title}</td>
                    </tr>
                    <tr>
                        <td>{t('Description')}:</td>
                        <td>{summaryData.description && summaryData.description}</td>
                    </tr>
                    <tr>
                        <td>{t('External Id')}:</td>
                        <td>{summaryData.externalId && summaryData.externalId}</td>
                    </tr>
                    <tr>
                        <td>{t('Publish Date')}:</td>
                        <td>{summaryData.publishDate && summaryData.publishDate}</td>
                    </tr>
                    <tr>
                        <td>{t('Last update')}:</td>
                        <td>{summaryData.lastExternalUpdate && summaryData.lastExternalUpdate}</td>
                    </tr>
                    <tr>
                        <td>{t('Priority')}:</td>
                        <td>{summaryData.priority && summaryData.priority}</td>
                    </tr>
                    <tr>
                        <td>{t('Priority Text')}:</td>
                        <td>{summaryData.priorityText && summaryData.priorityText}</td>
                    </tr>
                    <tr>
                        <td>{t('Action')}:</td>
                        <td>{summaryData.action && summaryData.action}</td>
                    </tr>
                    <tr>
                        <td>{t('Impact')}:</td>
                        <td>
                            <ul className='px-3'>
                                {summaryData.impact &&
                                    Object.entries(summaryData.impact).map(([key, val]) => (
                                        <li key={key}>
                                            <b>{`${t(key)}: `}</b>
                                            {val}
                                        </li>
                                    ))}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Legal Notice')}:</td>
                        <td>{summaryData.legalNotice && summaryData.legalNotice}</td>
                    </tr>
                    <tr>
                        <td>{t('Assigned external component ids')}:</td>
                        <td>
                            <ul className='px-0'>
                                {summaryData.assignedExtComponentIds?.map((elem, i) => {
                                    return (
                                        <li key={i} style={{ display: 'inline' }}>
                                            {elem}
                                            {i === summaryData.assignedExtComponentIds.length - 1 ? '' : ', '}{' '}
                                        </li>
                                    )
                                })}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('CVE references')}:</td>
                        <td>
                            <ul className='px-0'>
                                {summaryData.cveReferences?.map((elem, i) => {
                                    return (
                                        <li key={i} style={{ display: 'inline' }}>
                                            {`CVE-${elem}`}
                                            {i === summaryData.cveReferences.length - 1 ? '' : ', '}{' '}
                                        </li>
                                    )
                                })}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Vendor advisories')}:</td>
                        <td>
                            <ul className='px-3'>
                                {summaryData.vendorAdvisories?.map((elem, i) => {
                                    return (
                                        <li key={i}>
                                            <span className='fw-bold'>{'vendor'}: </span>
                                            {elem.vendor}, <span className='fw-bold'>{'name'}: </span>
                                            {elem.name}, <span className='fw-bold'>{'url'}: </span> {elem.url}
                                        </li>
                                    )
                                })}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>{`${t('Vulnerability scoring')} (CVSS)`}:</td>
                        <td>{`${summaryData.cvss && summaryData.cvss} (${'as of'}: ${
                            summaryData.cvssTime && summaryData.cvssTime
                        })`}</td>
                    </tr>
                    <tr>
                        <td>{t('Access')}:</td>
                        <td>
                            <ul className='px-3'>
                                {summaryData.access &&
                                    Object.entries(summaryData.access).map(([key, val]) => (
                                        <li key={key}>
                                            <b>{`${t(key)}: `}</b>
                                            {val}
                                        </li>
                                    ))}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Common weakness enumeration')}:</td>
                        <td>
                            {summaryData.cwe && (
                                <Link
                                    className='text-link'
                                    href={`https://cve.circl.lu/cwe/${summaryData.cwe.substring(4)}`}
                                    target='_blank'
                                >
                                    {summaryData.cwe}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Vulnerable configurations')}:</td>
                        <td>
                            <ul className='px-3'>
                                {summaryData.vulnerableConfiguration &&
                                    Object.entries(summaryData.vulnerableConfiguration).map(([key, value]) => (
                                        <li key={key}>
                                            <span className='fw-bold'>{key}</span> {value}
                                        </li>
                                    ))}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
