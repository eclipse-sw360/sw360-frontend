// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { ToastData } from '@/object-types'
import { Dispatch, ReactNode, SetStateAction, createContext, useState } from 'react'

interface ProviderProps {
    children: ReactNode
}

interface ContextDataType {
    toastData: ToastData
    setToastData: Dispatch<SetStateAction<ToastData>>
}

export const MessageContext = createContext<ContextDataType>(undefined)

const MessageContextProvider = ({ children }: ProviderProps) => {
    const [toastData, setToastData] = useState<ToastData>({
        show: false,
        type: '',
        message: '',
        contextual: '',
    })

    const contextData: ContextDataType = {
        toastData,
        setToastData,
    }

    return <MessageContext.Provider value={contextData}>{children}</MessageContext.Provider>
}

export default MessageContextProvider
