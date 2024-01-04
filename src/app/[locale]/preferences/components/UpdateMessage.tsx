// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-bootstrap'

import { ToastData } from '@/object-types'
import { ToastMessage } from 'next-sw360'

interface Props {
    state: { [key: string]: string | undefined }
}

const UpdateMessage = ({ state }: Props) => {
    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    useEffect(() => {
        if (state.status !== undefined) {
            const preparedToastData = {
                show: true,
                message: state.message,
                type: state.status,
                contextual: state.status === 'Success' ? 'success' : 'danger',
            }
            setToastData(preparedToastData)
        }
    }, [state])

    return (
        <ToastContainer position='top-start'>
            <ToastMessage
                show={toastData.show}
                type={toastData?.type}
                message={toastData?.message}
                contextual={toastData?.contextual}
                onClose={() => setToastData({ ...toastData, show: false })}
                setShowToast={setToastData}
            />
        </ToastContainer>
    )
}

export default UpdateMessage
