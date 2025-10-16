// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction, useEffect } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { BsQuestionCircle } from 'react-icons/bs'
import { LicensePayload, Obligation } from '@/object-types'

interface Props {
    obligation: Obligation | undefined
    setObligationToBeRemoved: Dispatch<SetStateAction<Obligation | undefined>>
    licensePayload: LicensePayload
    setLicensePayload: Dispatch<SetStateAction<LicensePayload>>
}

const DeleteObligationDialog = ({
    obligation,
    setObligationToBeRemoved,
    licensePayload,
    setLicensePayload,
}: Props): JSX.Element => {
    const t = useTranslations('default')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleSubmit = () => {
        const id = obligation?._links?.self.href.split('/').at(-1) ?? ''

        const ids = licensePayload.obligationDatabaseIds ?? []
        const index = ids.indexOf(id)
        if (index !== -1) {
            ids.splice(index, 1)
        }

        const obs = [
            ...(licensePayload.obligations ?? []),
        ]
        const obIndex = obs.findIndex((ob) => ob._links?.self.href.split('/').at(-1) === id)
        if (obIndex !== -1) {
            obs.splice(index, 1)
        }
        setLicensePayload({
            ...licensePayload,
            obligations: obs,
            obligationDatabaseIds: ids,
        })
        setObligationToBeRemoved(undefined)
    }

    const handleCloseDialog = () => {
        setObligationToBeRemoved(undefined)
    }

    return (
        <>
            {obligation !== undefined && (
                <Modal
                    show={obligation !== undefined}
                    onClose={handleCloseDialog}
                    backdrop='static'
                    centered
                    size='lg'
                >
                    <Modal.Header
                        style={{
                            backgroundColor: '#FEEFEF',
                            color: '#da1414',
                            fontWeight: '700',
                        }}
                    >
                        <h5>
                            <Modal.Title
                                style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                }}
                            >
                                <BsQuestionCircle />
                                &nbsp;
                                {t('Delete Obligation')}?
                            </Modal.Title>
                        </h5>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            {t.rich('Do you really want to delete the Obligation', {
                                name: obligation.title ?? '',
                                strong: (chunks) => <b>{chunks}</b>,
                            })}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button
                            className='delete-btn'
                            variant='light'
                            onClick={handleCloseDialog}
                        >
                            {t('Cancel')}
                        </Button>
                        <Button
                            className='login-btn'
                            variant='danger'
                            onClick={() => handleSubmit()}
                        >
                            {t('Delete Obligation')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

export default DeleteObligationDialog
