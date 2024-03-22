// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { FaCopy, FaInfoCircle } from 'react-icons/fa'

import AdditionalData from '@/components/AdditionalData/AdditionalData'
import ExternalIds from '@/components/ExternalIds/ExternalIds'
import { LicenseDetail, ReleaseDetail, User } from '@/object-types'
import { CommonUtils } from '@/utils'
import styles from '../detail.module.css'

interface Props {
    release: ReleaseDetail
    releaseId: string
}

const ReleaseGeneral = ({ release, releaseId }: Props) => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)

    const renderArrayOfUsers = (users: Array<User>) => {
        return Object.entries(users)
            .map(
                ([index, item]: [string, User]): React.ReactNode => (
                    <Link key={index} className='link' href={`mailto:${item.email}`}>
                        {item.fullName}
                    </Link>
                )
            )
            .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])
    }

    const renderArrayOfTexts = (texts: Array<string>) => {
        return Object.entries(texts)
            .map(([index, item]: [string, string]): React.ReactNode => <span key={index}>{item}</span>)
            .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])
    }

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
                    <td>Id:</td>
                    <td id='documentId'>
                        {releaseId}
                        <button
                            id='copyToClipboard'
                            type='button'
                            className='btn btn-sm'
                            data-toggle='tooltip'
                            title='Copy to clipboard'
                            onClick={() => {
                                navigator.clipboard.writeText(releaseId).catch((err) => console.log(err))
                            }}
                        >
                            <FaCopy style={{ color: 'gray', width: '20px' }} />
                        </button>
                    </td>
                </tr>
                <tr>
                    <td>CPE ID:</td>
                    <td>{release.cpeId}</td>
                </tr>
                <tr>
                    <td>{t('Release Date of this Release')}:</td>
                    <td>{release.releaseDate}</td>
                </tr>
                <tr>
                    <td>{t('Created On')}:</td>
                    <td>{release.createdOn}</td>
                </tr>
                <tr>
                    <td>{t('Created by')}:</td>
                    <td>
                        <a className={styles.link} href={`mailto:${release['_embedded']['sw360:createdBy'].email}`}>
                            {release['_embedded']['sw360:createdBy'].fullName}
                        </a>
                    </td>
                </tr>
                <tr>
                    <td>{t('Modified On')}:</td>
                    <td>{release.modifiedOn}</td>
                </tr>
                <tr>
                    <td>{t('Modified By')}:</td>
                    <td>
                        {release._embedded && release._embedded['sw360:modifiedBy'] && (
                            <a className={styles.link} href={`mailto:${release._embedded['sw360:modifiedBy'].email}`}>
                                {release._embedded['sw360:modifiedBy'].fullName}
                            </a>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Contributors')}:</td>
                    <td>
                        {release['_embedded'] &&
                            !CommonUtils.isNullEmptyOrUndefinedArray(release['_embedded']['sw360:contributors']) &&
                            renderArrayOfUsers(release['_embedded']['sw360:contributors'])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Moderators')}:</td>
                    <td>
                        {release['_embedded'] &&
                            !CommonUtils.isNullEmptyOrUndefinedArray(release['_embedded']['sw360:moderators']) &&
                            renderArrayOfUsers(release['_embedded']['sw360:moderators'])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Subscribers')}:</td>
                    <td>
                        {release['_embedded'] &&
                            !CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:subscribers']) &&
                            renderArrayOfUsers(release._embedded['sw360:subscribers'])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Additional Roles')}:</td>
                    <td>
                        <td>
                            {release.roles &&
                                Object.keys(release.roles).map((key) => (
                                    <li key={key}>
                                        <span className='mapDisplayChildItemLeft' style={{ fontWeight: 'bold' }}>
                                            {key}:{' '}
                                        </span>
                                        <span className='mapDisplayChildItemRight'>
                                            {release.roles[key]
                                                .map(
                                                    (email: string): React.ReactNode => (
                                                        <a key={email} href={`mailto:${email}`}>
                                                            {email}
                                                        </a>
                                                    )
                                                )
                                                .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])}
                                        </span>
                                    </li>
                                ))}
                        </td>
                    </td>
                </tr>
                <tr>
                    <td>{t('Source Code Download URL')}:</td>
                    <td>
                        {release.sourceCodeDownloadurl && (
                            <a href={release.sourceCodeDownloadurl}>{release.sourceCodeDownloadurl}</a>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Binary Download URL')}:</td>
                    <td>
                        {release.binaryDownloadurl && (
                            <a href={release.binaryDownloadurl}>{release.binaryDownloadurl}</a>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Clearing State')}:</td>
                    <td>{release.clearingState}</td>
                </tr>
                <tr>
                    <td>{t('Release Mainline State')}:</td>
                    <td>{release.mainlineState}</td>
                </tr>
                <tr>
                    <td>{t('Main Licenses')}:</td>
                    <td>
                        {release['_embedded'] &&
                            !CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:licenses']) &&
                            Object.entries(release._embedded['sw360:licenses'])
                                .map(
                                    ([index, item]: [string, LicenseDetail]): React.ReactNode => (
                                        <span key={index}>
                                            {item.shortName}
                                            <FaInfoCircle
                                                style={{ marginLeft: '5px', color: 'gray' }}
                                                className={styles.info}
                                            />
                                        </span>
                                    )
                                )
                                .reduce((prev, curr): React.ReactNode[] => [
                                    prev,
                                    <>
                                        , <br />
                                    </>,
                                    curr,
                                ])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Other licenses')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release.otherLicenseIds) &&
                            Object.entries(release.otherLicenseIds)
                                .map(
                                    ([index, item]: [string, string]): React.ReactNode => (
                                        <span key={index}>
                                            {item}
                                            <FaInfoCircle
                                                style={{ marginLeft: '5px', color: 'gray' }}
                                                className={styles.info}
                                            />
                                        </span>
                                    )
                                )
                                .reduce((prev, curr): React.ReactNode[] => [prev, ', ', curr])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Programming Languages')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release.languages) &&
                            renderArrayOfTexts(release.languages)}
                    </td>
                </tr>
                <tr>
                    <td>{t('Operating Systems')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release.operatingSystems) &&
                            renderArrayOfTexts(release.operatingSystems)}
                    </td>
                </tr>
                <tr>
                    <td>{t('External ids')}:</td>
                    <td>{release['externalIds'] && <ExternalIds externalIds={release['externalIds']} />}</td>
                </tr>
                <tr>
                    <td>{t('Additional Data')}:</td>
                    <td>
                        {release['additionalData'] && <AdditionalData additionalData={release['additionalData']} />}
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default ReleaseGeneral
