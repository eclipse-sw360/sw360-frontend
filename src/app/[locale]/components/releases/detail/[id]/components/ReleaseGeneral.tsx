// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SetStateAction } from 'preact/compat'
import { Dispatch, ReactNode, useEffect, useState } from 'react'
import { Button, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsClipboard, BsExclamationTriangle, BsInfoCircle } from 'react-icons/bs'
import AdditionalData from '@/components/AdditionalData/AdditionalData'
import ExternalIds from '@/components/ExternalIds/ExternalIds'
import { LicenseDetail, ReleaseDetail, SrcFileList, User } from '@/object-types'
import { CommonUtils } from '@/utils'

interface Props {
    release: ReleaseDetail
    releaseId: string
    fileList?: SrcFileList
}

const FileListView = ({
    fileList,
    licId,
    setLicId,
}: {
    fileList?: SrcFileList
    licId: string | undefined
    setLicId: Dispatch<SetStateAction<string | undefined>>
}) => {
    const t = useTranslations('default')

    const renderSourceList = (sourceList: Array<string>) => {
        return sourceList.map((source) => (
            <li key={source}>
                <b>{source}</b>
            </li>
        ))
    }
    return (
        <>
            {fileList ? (
                <Modal
                    show={licId !== undefined}
                    onHide={() => setLicId(undefined)}
                    backdrop='static'
                    centered
                    size='lg'
                >
                    <Modal.Header
                        closeButton
                        className='text-blue'
                    >
                        <Modal.Title>
                            <b>{fileList?.relName ?? ''}</b>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {!CommonUtils.isNullEmptyOrUndefinedString(licId) && (
                            <>
                                <div>
                                    {t('File Name')}: <b>{fileList?.attName ?? ''}</b>
                                </div>
                                <div>
                                    {t('License Type')}:{' '}
                                    <b>{fileList?.data?.filter((l) => l.licName === licId)?.[0]?.licType ?? ''}</b>
                                </div>
                                <div>
                                    {t('License Name')}: <b>{licId}</b>
                                </div>
                                <ul>
                                    {CommonUtils.isNullEmptyOrUndefinedArray(
                                        fileList?.data.filter((l) => l.licName === licId)?.[0].srcFiles,
                                    ) ? (
                                        <li>{t('Source file information not found in ISR')}</li>
                                    ) : (
                                        renderSourceList(
                                            fileList?.data?.filter((l) => l.licName === licId)?.[0]?.srcFiles ?? [],
                                        )
                                    )}
                                </ul>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button
                            variant='light'
                            onClick={() => setLicId(undefined)}
                        >
                            {' '}
                            OK{' '}
                        </Button>
                    </Modal.Footer>
                </Modal>
            ) : (
                <Modal
                    show={licId !== undefined}
                    onHide={() => setLicId(undefined)}
                    backdrop='static'
                    centered
                    size='lg'
                    className='modal-warning'
                >
                    <Modal.Header closeButton>
                        <BsExclamationTriangle size={20} />
                        <span className='ms-2 fw-bold'>{t('Warning')}</span>
                    </Modal.Header>
                    <Modal.Body>
                        {t('Failed to load source file with error')}:{' '}
                        <span className='fw-bold'>{t('Multiple approved CLI are found in release')}!</span>
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button
                            variant='light'
                            onClick={() => setLicId(undefined)}
                        >
                            {' '}
                            OK{' '}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

const ReleaseGeneral = ({ release, releaseId, fileList }: Props): ReactNode => {
    const t = useTranslations('default')
    const [toggle, setToggle] = useState(false)
    const { status } = useSession()
    const [selectedLicenseId, setSelectedLicenseId] = useState<string>()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const Clipboard = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false)

        async function handleCopy() {
            try {
                await navigator.clipboard.writeText(text)
                setCopied(true)
            } catch (e) {
                console.error(e)
            }
        }
        return (
            <OverlayTrigger
                trigger={[
                    'hover',
                    'focus',
                ]}
                placement='top'
                overlay={(props) => <Tooltip {...props}>{copied ? t('Copied') : t('Copy to Clipboard')}</Tooltip>}
                onToggle={(show) => {
                    if (show) setCopied(false)
                }}
            >
                <span className='d-inline-block'>
                    <BsClipboard
                        onClick={handleCopy}
                        size={20}
                    />
                </span>
            </OverlayTrigger>
        )
    }

    const renderArrayOfUsers = (users: Array<User>) => {
        return Object.entries(users)
            .map(
                ([index, item]: [
                    string,
                    User,
                ]): React.ReactNode => (
                    <Link
                        key={index}
                        className='link'
                        href={`mailto:${item.email}`}
                    >
                        {item.fullName}
                    </Link>
                ),
            )
            .reduce((prev, curr): React.ReactNode[] => [
                prev,
                ', ',
                curr,
            ])
    }

    const renderArrayOfTexts = (texts: Array<string>) => {
        return Object.entries(texts)
            .map(
                ([index, item]: [
                    string,
                    string,
                ]): React.ReactNode => <span key={index}>{item}</span>,
            )
            .reduce((prev, curr): React.ReactNode[] => [
                prev,
                ', ',
                curr,
            ])
    }

    return (
        <>
            <FileListView
                licId={selectedLicenseId}
                setLicId={setSelectedLicenseId}
                fileList={fileList}
            />
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
                        <td>
                            {releaseId} <Clipboard text={releaseId} />
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
                            {release._embedded['sw360:createdBy'] && (
                                <Link
                                    className='text-link'
                                    href={`mailto:${release._embedded['sw360:createdBy'].email}`}
                                >
                                    {release._embedded['sw360:createdBy'].fullName}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Modified On')}:</td>
                        <td>{release.modifiedOn}</td>
                    </tr>
                    <tr>
                        <td>{t('Modified By')}:</td>
                        <td>
                            {release._embedded['sw360:modifiedBy'] && (
                                <Link
                                    className='text-link'
                                    href={`mailto:${release._embedded['sw360:modifiedBy'].email}`}
                                >
                                    {release._embedded['sw360:modifiedBy'].fullName}
                                </Link>
                            )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Contributors')}:</td>
                        <td>
                            {!CommonUtils.isNullEmptyOrUndefinedArray(release._embedded['sw360:contributors']) &&
                                renderArrayOfUsers(release._embedded['sw360:contributors'])}
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
                                        <span className='fw-bold'>{key}: </span>
                                        <span className='mapDisplayChildItemRight'>
                                            {!CommonUtils.isNullOrUndefined(release.roles) &&
                                                release.roles[key]
                                                    .map(
                                                        (email: string): React.ReactNode => (
                                                            <a
                                                                key={email}
                                                                href={`mailto:${email}`}
                                                            >
                                                                {email}
                                                            </a>
                                                        ),
                                                    )
                                                    .reduce((prev, curr): React.ReactNode[] => [
                                                        prev,
                                                        ', ',
                                                        curr,
                                                    ])}
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
                                Object.entries(release._embedded['sw360:licenses']).map(
                                    ([index, item]: [
                                        string,
                                        LicenseDetail,
                                    ]): React.ReactNode => (
                                        <span key={index}>
                                            {index !== '0' && <span className='me-2 ms-1'>{','}</span>}
                                            {item.shortName}
                                            <BsInfoCircle
                                                style={{
                                                    marginLeft: '5px',
                                                    color: 'gray',
                                                }}
                                                size={20}
                                                onClick={() => setSelectedLicenseId(item.shortName)}
                                            />
                                        </span>
                                    ),
                                )}
                        </td>
                    </tr>
                    <tr>
                        <td>{t('Other licenses')}:</td>
                        <td>
                            {!CommonUtils.isNullEmptyOrUndefinedArray(release.otherLicenseIds) &&
                                Object.entries(release.otherLicenseIds)
                                    .map(
                                        ([index, item]: [
                                            string,
                                            string,
                                        ]): React.ReactNode => (
                                            <span key={index}>
                                                {item}
                                                <BsInfoCircle
                                                    style={{
                                                        marginLeft: '5px',
                                                        color: 'gray',
                                                    }}
                                                    size={20}
                                                    onClick={() => setSelectedLicenseId(item)}
                                                />
                                            </span>
                                        ),
                                    )
                                    .reduce((prev, curr): React.ReactNode[] => [
                                        prev,
                                        ', ',
                                        curr,
                                    ])}
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
        </>
    )
}

export default ReleaseGeneral
