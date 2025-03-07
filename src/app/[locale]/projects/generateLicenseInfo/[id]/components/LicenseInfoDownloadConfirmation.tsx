// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Modal } from 'react-bootstrap'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { useTranslations } from "next-intl"
import { Dispatch, ReactNode, SetStateAction } from 'react'

export default function LicenseInfoDownloadConfirmationModal({
    show,
    setShow
} :{
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
}) : ReactNode {
    const t = useTranslations('default')

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => setShow(false)}
                scrollable
            >
                <Modal.Header 
                    style={{ backgroundColor: '#eef2fa', color: '#2e5aac' }}
                    closeButton
                >
                    <Modal.Title id='delete-all-license-info-modal'>
                        <AiOutlineInfoCircle /> {t('Info')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{t('Downloading is in progress')}. {t('It will be sent you over an email once its completed')}.</p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-dark'
                        onClick={() => setShow(false)}
                    >
                        {t('OK')}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
