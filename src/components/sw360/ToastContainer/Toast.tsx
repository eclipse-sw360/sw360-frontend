// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import React, { SetStateAction } from 'react'
import Toast from 'react-bootstrap/Toast'

import { ToastData } from '@/object-types'

interface Props {
    show: boolean
    type: string
    message: string
    contextual: string // Contextual variations
    onClose: () => void
    setShowToast: React.Dispatch<SetStateAction<ToastData>>
}

const ToastMessage = ({ show, type, message, contextual, onClose, setShowToast }: Props) => {
    const handleClose = () => {
        setShowToast({
            show: false,
            type: '',
            message: '',
            contextual: '',
        })
        onClose()
    }

    return (
        <Toast show={show} onClose={handleClose} delay={4000} bg={contextual} autohide>
            <Toast.Header>
                <strong className='me-auto'>{type}</strong>
            </Toast.Header>
            <Toast.Body className='text-white'>{message}</Toast.Body>
        </Toast>
    )
}

export default ToastMessage
