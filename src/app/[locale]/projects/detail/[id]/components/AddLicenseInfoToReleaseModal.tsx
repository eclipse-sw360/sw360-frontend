// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { type JSX } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'


interface Props {
    projectId: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function AddLicenseInfoToReleaseModal ({ projectId, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')

    const handleSubmit = async (projectId : string) => {
        console.log(projectId)
    }

    const handleCloseDialog = () => {
        setShow(!show)
    }

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton style={{ color: '#2e5aac' }}>
                <Modal.Title>
                    <AiOutlineQuestionCircle style={{ marginBottom: '5px' }} />
                    {t('Add License Info to Release')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button className='delete-btn' variant='light' onClick={handleCloseDialog}>
                    {' '}
                    {t('Cancel')}{' '}
                </Button>
                <Button
                    className='login-btn'
                    variant='info'
                    onClick={() => handleSubmit(projectId)}
                >
                    {t('Add')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddLicenseInfoToReleaseModal
