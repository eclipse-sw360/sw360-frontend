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
import { ReactNode, useState } from 'react'
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

const ReleaseGeneral = ({ release, releaseId }: Props) : ReactNode => {
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
                        {
                            release._embedded['sw360:createdBy'] &&
                            <Link
                                className='text-link'
                                href={`mailto:${release._embedded['sw360:createdBy'].email}`}
                            >
                                {release._embedded['sw360:createdBy'].fullName}
                            </Link>
                        } 
                    </td>
                </tr>
                <tr>
                    <td>{t('Modified On')}:</td>
                    <td>{release.modifiedOn}</td>
                </tr>
                <tr>
                    <td>{t('Modified By')}:</td>
                    <td>
                        {
                            release._embedded['sw360:modifiedBy'] &&
                            <Link
                                className='text-link'
                                href={`mailto:${release._embedded['sw360:modifiedBy'].email}`}
                            >
                                {release._embedded['sw360:modifiedBy'].fullName}
                            </Link>
                        } 
                    </td>
                </tr>
                <tr>
                    <td>{t('Contributors')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:contributors']) &&
                            renderArrayOfUsers(release._embedded['sw360:contributors'])
                        }
                    </td>
                </tr>
                <tr>
                    <td>{t('Moderators')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:moderators']) &&
                            renderArrayOfUsers(release._embedded['sw360:moderators'])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Subscribers')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:subscribers']) &&
                            renderArrayOfUsers(release._embedded['sw360:subscribers'])}
                    </td>
                </tr>
                <tr>
                    <td>{t('Additional Roles')}:</td>
                    <td>
                        {!CommonUtils.isNullOrUndefined(release.roles) &&
                            Object.keys(release.roles).map((key) => (
                                <li key={key}>
                                    <span className='fw-bold'>
                                        {key}:{' '}
                                    </span>
                                    <span className='mapDisplayChildItemRight'>
                                        {!CommonUtils.isNullOrUndefined(release.roles) && release.roles[key]
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
                </tr>
                <tr>
                    <td>{t('Source Code Download URL')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(release.sourceCodeDownloadurl) && (
                            <a href={release.sourceCodeDownloadurl}>{release.sourceCodeDownloadurl}</a>
                        )}
                    </td>
                </tr>
                <tr>
                    <td>{t('Binary Download URL')}:</td>
                    <td>
                        {!CommonUtils.isNullEmptyOrUndefinedString(release.binaryDownloadurl) && (
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
                        {!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:licenses']) &&
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
