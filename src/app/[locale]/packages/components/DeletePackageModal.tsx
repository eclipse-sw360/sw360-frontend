// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState, type JSX } from 'react'
import { Alert, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

interface DeletePackageModalMetData {
    show: boolean
    packageId: string
    packageName: string
    packageVersion: string
}

interface AlertData {
    variant: string
    message: JSX.Element
}

export default function DeletePackageModal({
    modalMetaData,
    setModalMetaData,
    isEditPage,
    onDeleteSuccess,
}: {
    modalMetaData: DeletePackageModalMetData
    setModalMetaData: Dispatch<SetStateAction<DeletePackageModalMetData>>
    isEditPage: boolean
    onDeleteSuccess?: (packageId: string) => void
}): ReactNode {
    const t = useTranslations('default')
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [deleting, setDeleting] = useState<boolean | null>(null)
    const router = useRouter()
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push('/packages')
        }
    }

    const deletePackage = async () => {
        try {
            setDeleting(true)
            const session = await getSession()
            if (!session) {
                return router.push('/')
            }

            const response = await ApiUtils.DELETE(`packages/${modalMetaData.packageId}`, session.user.access_token)

            if (response.status == HttpStatus.OK) {
                if (isEditPage) {
                    MessageService.success(t('Package deleted successfully'))
                    setModalMetaData({
                        show: false,
                        packageId: '',
                        packageName: '',
                        packageVersion: '',
                    })
                    handleGoBack()
                } else {
                    setAlert({
                        variant: 'success',
                        message: (
                            <p>
                                {t('Package')}{' '}
                                <strong>
                                    {`${modalMetaData.packageName}${
                                        modalMetaData.packageVersion ? `(${modalMetaData.packageVersion})` : ''
                                    }`}
                                </strong>{' '}
                                {t('deleted successfully')}!
                            </p>
                        ),
                    })
                    if (onDeleteSuccess) {
                        onDeleteSuccess(modalMetaData.packageId)
                    }
                }
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                if (isEditPage) {
                    MessageService.error(t('Package cannot be deleted'))
                    setModalMetaData({ show: false, packageId: '', packageName: '', packageVersion: '' })
                    router.push(`/packages/edit/${modalMetaData.packageId}`)
                } else {
                    setAlert({
                        variant: 'danger',
                        message: (
                            <>
                                <p>{t('Package cannot be deleted')}!</p>
                            </>
                        ),
                    })
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Modal
            size='lg'
            centered
            show={modalMetaData.show}
            onHide={() => {
                setModalMetaData({
                    show: false,
                    packageId: '',
                    packageName: '',
                    packageVersion: '',
                })
                setAlert(null)
                setDeleting(null)
            }}
            aria-labelledby={t('Delete Package')}
            scrollable
        >
            <Modal.Header
                style={{ backgroundColor: '#feefef', color: '#da1414' }}
                closeButton
            >
                <Modal.Title id='delete-all-license-info-modal'>
                    <AiOutlineQuestionCircle /> {t('Delete Package')}?
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {alert && (
                    <Alert
                        variant={alert.variant}
                        id='deletePackage.message.alert'
                    >
                        {alert.message}
                    </Alert>
                )}

                {!alert && modalMetaData.packageName && (
                    <p>
                        {`${t('Do you really want to delete the package')} `}
                        <span className='fw-medium'>
                            {`${modalMetaData.packageName}${
                                modalMetaData.packageVersion ? `(${modalMetaData.packageVersion})` : ''
                            }`}
                        </span>
                        ?
                    </p>
                )}
            </Modal.Body>

            <Modal.Footer>
                {alert ? (
                    <button
                        className='btn btn-dark'
                        onClick={() => {
                            setModalMetaData({
                                show: false,
                                packageId: '',
                                packageName: '',
                                packageVersion: '',
                            })
                            setAlert(null)
                            setDeleting(null)
                        }}
                    >
                        {t('Close')}
                    </button>
                ) : (
                    <>
                        <button
                            className='btn btn-dark'
                            onClick={() =>
                                setModalMetaData({
                                    show: false,
                                    packageId: '',
                                    packageName: '',
                                    packageVersion: '',
                                })
                            }
                            disabled={deleting ?? undefined}
                        >
                            {t('Cancel')}
                        </button>
                        <button
                            className='btn btn-danger'
                            onClick={() => deletePackage().catch(console.error)}
                            disabled={deleting ?? undefined}
                        >
                            {t('Delete Package')}
                            {deleting === true && (
                                <Spinner
                                    size='sm'
                                    className='ms-1 spinner'
                                />
                            )}
                        </button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    )
}
