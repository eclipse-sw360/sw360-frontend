// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ReactNode, useState } from 'react'
import { Dispatch, SetStateAction } from 'react'
import { HttpStatus } from '@/object-types'
import { getSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ApiUtils } from '@/utils'
import { useTranslations } from 'next-intl'
import { Modal, Alert, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import MessageService from '@/services/message.service'
import { useRouter } from 'next/navigation'

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

export default function DeletePackageModal({ modalMetaData, setModalMetaData, isEditPage }: 
    { modalMetaData: DeletePackageModalMetData, setModalMetaData: Dispatch<SetStateAction<DeletePackageModalMetData>>, isEditPage: boolean }) : ReactNode {
    const t = useTranslations('default')
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [deleting, setDeleting] = useState<boolean | null>(null)
    const router = useRouter()

    const deletePackage = async () => {
        try {
            setDeleting(true)
            const session = await getSession()
            if(!session) {
                return redirect('/')
            }
            const response = await ApiUtils.DELETE(`packages/${modalMetaData.packageId}`, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                if(isEditPage) {
                    MessageService.success(t('Package deleted successfully'))
                    setModalMetaData({ show: false, packageId: '', packageName: '', packageVersion: '' })
                    router.push('/packages')
                } else {
                    setAlert({
                        variant: 'success',
                        message: (
                            <>
                                <p>
                                    {t('Deleted successfully')}!
                                </p>
                            </>
                        ),
                    })
                }
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                if(isEditPage) {
                    MessageService.error(t('Package cannot be deleted'))
                    setModalMetaData({ show: false, packageId: '', packageName: '', packageVersion: '' })
                    router.push('/packages')
                } else {
                    setAlert({
                        variant: 'danger',
                        message: (
                            <>
                                <p>
                                    {t('Package cannot be deleted')}!
                                </p>
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
        <>
            <Modal
                size='lg'
                centered
                show={modalMetaData.show}
                onHide={() => {
                    if (deleting !== null) {
                        setModalMetaData({ show: false, packageId: modalMetaData.packageId, packageName: '', packageVersion: '' })
                    }
                }}
                aria-labelledby={t('Delete Package')}
                scrollable
            >
                <Modal.Header style={{ backgroundColor: '#feefef', color: '#da1414' }} closeButton>
                    <Modal.Title id='delete-all-license-info-modal'>
                        <AiOutlineQuestionCircle /> {t('Delete Package')}?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {alert && (
                        <Alert variant={alert.variant} id='deletePackage.message.alert'>
                            {alert.message}
                        </Alert>
                    )}
                    <p>{`${t('Do you really want to delete the package')} `}<span className='fw-medium'>{`${modalMetaData.packageName} ${(modalMetaData.packageVersion !== "") ? `(${modalMetaData.packageVersion})` : ''}}`}</span>?</p>
                </Modal.Body>
                <Modal.Footer>
                    {
                        (deleting === null || deleting === true || isEditPage) ?
                        <>
                            <button
                                className='btn btn-dark'
                                onClick={() => setModalMetaData({ show: false, packageId: '', packageName: '', packageVersion: '' })}
                                disabled={deleting ?? undefined}
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                className='btn btn-danger'
                                onClick={() => {
                                    deletePackage().catch((e) => console.error(e))
                                }}
                                disabled={deleting ?? undefined}
                            >
                                {t('Delete Package')}
                                {deleting === true && <Spinner size='sm' className='ms-1 spinner' />}
                            </button>   
                        </>:
                        <button
                            className='btn btn-dark'
                            onClick={() => setModalMetaData({ show: false, packageId: '', packageName: '', packageVersion: '' })}
                        >
                            {t('Close')}
                        </button>
                    }
                </Modal.Footer>
            </Modal>
        </>
    )
}