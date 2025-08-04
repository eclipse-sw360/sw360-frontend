// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Package } from '@/object-types'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BiClipboard } from 'react-icons/bi'

const Capitalize = (text: string) => {
    return text
        ? text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')
        : undefined
}

export default function Summary({ summaryData }: { summaryData: Package }): ReactNode {
    const t = useTranslations('default')
    const [toggleGeneralInformation, setToggleGeneralInformation] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const Clipboard = ({ text }: { text: string }) => {
        return (
            <>
                <OverlayTrigger overlay={<Tooltip>{t('Copy to Clipboard')}</Tooltip>}>
                    <span className='d-inline-block'>
                        <BiClipboard
                            onClick={() => {
                                navigator.clipboard.writeText(text).catch((e) => console.error(e))
                            }}
                        />
                    </span>
                </OverlayTrigger>
            </>
        )
    }

    return (
        <>
            <table className='table summary-table'>
                <thead
                    title='Click to expand or collapse'
                    onClick={() => {
                        setToggleGeneralInformation(!toggleGeneralInformation)
                    }}
                >
                    <tr>
                        <th colSpan={2}>{t('Summary')}</th>
                    </tr>
                </thead>
                <tbody hidden={toggleGeneralInformation}>
                    <tr>
                        <td>{t('Id')}:</td>
                        <td>
                            {summaryData.id ?? ''} <Clipboard text={summaryData.id ?? ''} />
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Name')}:</td>
                        <td>{summaryData.name ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Version')}:</td>
                        <td>{summaryData.version ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Package Type')}:</td>
                        <td>{Capitalize(summaryData.packageType ?? '')}</td>
                    </tr>
                    <tr>
                        <td>{`PURL (${t('Package URL')})`}:</td>
                        <td>
                            {(summaryData.purl ?? '') && (
                                <Link
                                    className={`text-link`}
                                    href={summaryData.purl ?? ''}
                                >
                                    {summaryData.purl}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Package Manager')}:</td>
                        <td>{Capitalize(summaryData.packageManager ?? '')}</td>
                    </tr>
                    <tr>
                        <td>{`VCS (${t('Version Control System')})`}:</td>
                        <td>
                            {(summaryData.vcs ?? '') && (
                                <Link
                                    className={`text-link`}
                                    href={summaryData.vcs ?? ''}
                                >
                                    {summaryData.vcs}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Homepage URL')}:</td>
                        <td>
                            {(summaryData.homepageUrl ?? '') && (
                                <Link
                                    className={`text-link`}
                                    href={summaryData.homepageUrl ?? ''}
                                >
                                    {summaryData.homepageUrl}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Licenses')}:</td>
                        <td>
                            {summaryData.licenseIds?.map((elem, i) => (
                                <li
                                    key={elem}
                                    style={{ display: 'inline' }}
                                >
                                    <Link
                                        className='text-link'
                                        href={`/licenses/${elem}`}
                                        key={elem}
                                    >
                                        {elem}
                                    </Link>
                                    {i < (summaryData.licenseIds?.length ?? 0) - 1 && ', '}
                                </li>
                            )) ?? ''}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Linked Releases')}:</td>
                        <td>
                            {summaryData._embedded?.['sw360:release'] && (
                                <Link
                                    className={`text-link`}
                                    href={`/components/releases/detail/${summaryData._embedded['sw360:release'].id}`}
                                >
                                    {`${summaryData._embedded['sw360:release'].name}${
                                        summaryData._embedded['sw360:release'].version
                                            ? ` (${summaryData._embedded['sw360:release'].version})`
                                            : ''
                                    }`}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Description')}:</td>
                        <td>{summaryData.description ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Created on')}:</td>
                        <td>{summaryData.createdOn ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Created By')}:</td>
                        <td>
                            {summaryData._embedded?.createdBy && (
                                <Link
                                    className={`text-link`}
                                    href={`mailto:${summaryData._embedded.createdBy.email}`}
                                >
                                    {summaryData._embedded.createdBy.email}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Modified On')}:</td>
                        <td>{summaryData.modifiedOn ?? ''}</td>
                    </tr>
                    <tr>
                        <td>{t('Modified By')}:</td>
                        <td>
                            {summaryData._embedded?.modifiedBy && (
                                <Link
                                    className={`text-link`}
                                    href={`mailto:${summaryData._embedded.modifiedBy.email}`}
                                >
                                    {summaryData._embedded.modifiedBy.email}
                                </Link>
                            )}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}
