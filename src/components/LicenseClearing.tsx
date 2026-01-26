// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut } from 'next-auth/react'
import { ReactNode, useEffect, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { ErrorDetails } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'

export interface LicenseClearingData {
    'Release Count': number
    'Approved Count': number
}

interface LicenseClearingProps {
    projectId: string
    data?: LicenseClearingData
}

export default function LicenseClearing({ projectId, data }: LicenseClearingProps): ReactNode {
    const [lcData, setLcData] = useState<LicenseClearingData | null>(data ?? null)

    useEffect(() => {
        if (data) {
            setLcData(data)
            return
        }

        const controller = new AbortController()
        const signal = controller.signal
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()

                const response = await ApiUtils.GET(
                    `projects/${projectId}/licenseClearingCount`,
                    session.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as LicenseClearingData

                setLcData(data)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()
        return () => controller.abort()
    }, [
        projectId,
        data,
    ])

    return (
        <>
            {lcData ? (
                <div className='text-center'>{`${lcData['Approved Count']}/${lcData['Release Count']}`}</div>
            ) : (
                <div className='col-12 text-center'>
                    <Spinner
                        className='spinner'
                        size='sm'
                    />
                </div>
            )}
        </>
    )
}
