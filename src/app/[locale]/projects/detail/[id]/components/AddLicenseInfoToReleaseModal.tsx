// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState, type JSX } from 'react'
import { Alert, Button, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

interface Props {
    projectId: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

interface AddLicenseInfoToReleaseData {
    MULTIPLE_ATTACHMENTS: string[]
    NOT_UPDATED: string[]
    UPDATED: string[]
    _embedded: {
        'sw360:releases': [
            {
                id: string
                name: string
                version: string
            },
        ]
    }
}

function AddLicenseInfoToReleaseModal({ projectId, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')
    const [isLoading, setIsLoading] = useState(false)
    const [addLicenseInfoToReleaseData, setAddLicenseInfoToReleaseData] = useState<AddLicenseInfoToReleaseData | null>(
        null,
    )

    const handleSubmit = async (projectId: string) => {
        setIsLoading(true)
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const createUrl = `projects/${projectId}/addLinkedReleasesLicenses`
            const response = await ApiUtils.POST(createUrl, {}, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = (await response.json()) as AddLicenseInfoToReleaseData
                setAddLicenseInfoToReleaseData(data)
            } else if (response.status == HttpStatus.INTERNAL_SERVER_ERROR) {
                MessageService.error(t('Error occurred while processing license information for linked releases'))
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setAddLicenseInfoToReleaseData(null)
    }

    return (
        <Modal
            show={show}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header
                closeButton
                style={{ color: '#2e5aac' }}
            >
                <Modal.Title>
                    <AiOutlineQuestionCircle style={{ marginBottom: '5px' }} />
                    {t('Add License Info to Release')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {isLoading ? (
                    <div className='d-flex justify-content-center align-items-center'>
                        <Spinner className='spinner' />
                    </div>
                ) : (
                    <>
                        <p>{t(`Do you really want to add license info to all the directly linked release`)}</p>
                        {addLicenseInfoToReleaseData && (
                            <>
                                {addLicenseInfoToReleaseData.UPDATED.length === 0 ? (
                                    <Alert
                                        variant='info'
                                        id='addLicenseInfoToReleaseData.info.alert'
                                    >
                                        {t('Changes made to the releases')}:{' '}
                                        {addLicenseInfoToReleaseData.UPDATED.length}
                                    </Alert>
                                ) : (
                                    <Alert
                                        variant='success'
                                        id='addLicenseInfoToReleaseData.success.alert'
                                    >
                                        {t('Success Please reload the page to see the changes')}:{' '}
                                        {addLicenseInfoToReleaseData.UPDATED.length}
                                    </Alert>
                                )}
                                {addLicenseInfoToReleaseData.MULTIPLE_ATTACHMENTS.length > 0 && (
                                    <Alert
                                        variant='warning'
                                        id='addLicenseInfoToReleaseData-multiple-attachments-alert'
                                    >
                                        {t('Multiple CLI are found in release')}:{' '}
                                        {addLicenseInfoToReleaseData.MULTIPLE_ATTACHMENTS.length}
                                        <ul className='mapDisplayRootItem'>
                                            {addLicenseInfoToReleaseData.MULTIPLE_ATTACHMENTS.map((attachmentId) => {
                                                const releaseInfo = addLicenseInfoToReleaseData._embedded[
                                                    'sw360:releases'
                                                ].find((release) => release.id === attachmentId)
                                                return releaseInfo ? (
                                                    <li
                                                        key={releaseInfo.id}
                                                        className='ms-3'
                                                    >
                                                        <Link
                                                            href={'/components/releases/detail/' + releaseInfo.id}
                                                            className='link'
                                                        >
                                                            <span className='text-link'>
                                                                {`${releaseInfo.name}(${releaseInfo.version})`}
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ) : null
                                            })}
                                        </ul>
                                    </Alert>
                                )}
                                {addLicenseInfoToReleaseData.NOT_UPDATED.length > 0 && (
                                    <Alert
                                        variant='warning'
                                        id='addLicenseInfoToReleaseData-not-updated-alert'
                                    >
                                        {t('Releases not updated')}: {addLicenseInfoToReleaseData.NOT_UPDATED.length}
                                        <ul className='mapDisplayRootItem'>
                                            {addLicenseInfoToReleaseData.NOT_UPDATED.map((attachmentId) => {
                                                const releaseInfo = addLicenseInfoToReleaseData._embedded[
                                                    'sw360:releases'
                                                ].find((release) => release.id === attachmentId)
                                                return releaseInfo ? (
                                                    <li
                                                        key={releaseInfo.id}
                                                        className='ms-3'
                                                    >
                                                        <Link
                                                            href={'/components/releases/detail/' + releaseInfo.id}
                                                            className='link'
                                                        >
                                                            <span className='text-link'>
                                                                {`${releaseInfo.name}(${releaseInfo.version})`}
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ) : null
                                            })}
                                        </ul>
                                    </Alert>
                                )}
                            </>
                        )}
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    className='delete-btn'
                    variant='light'
                    onClick={handleCloseDialog}
                >
                    {addLicenseInfoToReleaseData === null ? <> {t('Cancel')} </> : <> {t('Close')} </>}
                </Button>
                <Button
                    className='login-btn'
                    variant='info'
                    onClick={() => handleSubmit(projectId)}
                    disabled={addLicenseInfoToReleaseData !== null}
                >
                    {t('Add')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddLicenseInfoToReleaseModal
