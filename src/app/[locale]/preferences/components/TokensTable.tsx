// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table } from 'next-sw360'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { Button, Spinner } from 'react-bootstrap'
import { AccessToken, Embedded, ErrorDetails } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiError, ApiUtils, CommonUtils } from '@/utils/index'

type EmbeddedAccessTokens = Embedded<AccessToken, 'sw360:restApiTokens'>

interface Props {
    generatedToken: string
}

const TokensTable = ({ generatedToken }: Props): ReactNode => {
    const t = useTranslations('default')
    const session = useSession()
    const [revoked, setRevoked] = useState(false)

    const revokeToken = async (tokenName: string) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.DELETE(
                CommonUtils.createUrlWithParams('users/tokens', {
                    name: tokenName,
                }),
                session.user.access_token,
            )

            if (response.status === StatusCodes.NO_CONTENT) {
                MessageService.success(t('Revoke token sucessfully'))
                setRevoked(!revoked)
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                await signOut()
            } else {
                MessageService.error(t('Error while processing'))
            }
        } catch (error) {
            console.error('An error occurred while revoking token:', error)
            MessageService.error(t('Error while processing'))
        }
    }

    const columns = useMemo<ColumnDef<AccessToken>[]>(
        () => [
            {
                id: 'name',
                header: t('Token Name'),
                cell: ({ row }) => <>{row.original.name}</>,
            },
            {
                id: 'createdOn',
                name: t('Created on'),
                cell: ({ row }) => (
                    <>
                        {new Date(
                            Date.parse(row.original.createdOn + ' +0000') - new Date().getTimezoneOffset() * 60000,
                        )
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' ')}
                    </>
                ),
            },
            {
                id: 'expiration-date',
                header: t('Expiration Date'),
                cell: ({ row }) => {
                    const expirationDate = new Date(
                        Date.parse(row.original.createdOn + ' +0000') +
                            row.original.numberOfDaysValid * 24 * 60 * 60 * 1000 -
                            new Date().getTimezoneOffset() * 60000,
                    )
                    return <>{expirationDate.toISOString().slice(0, 19).replace('T', ' ')}</>
                },
            },
            {
                id: 'authorities',
                header: t('Authorities'),
                cell: ({ row }) => <>{'[' + row.original.authorities.join(', ') + ']'}</>,
            },
            {
                id: 'action',
                cell: ({ row }) => (
                    <Button
                        variant='danger'
                        onClick={() => {
                            void revokeToken(row.original.name)
                        }}
                    >
                        {t('Revoke Token')}
                    </Button>
                ),
                meta: {
                    width: '10%',
                },
            },
        ],
        [
            t,
            generatedToken,
            revoked,
        ],
    )
    const [componentData, setComponentData] = useState<AccessToken[]>(() => [])
    const memoizedData = useMemo(
        () => componentData,
        [
            componentData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = componentData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET('users/tokens', session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedAccessTokens
                setComponentData(
                    CommonUtils.isNullOrUndefined(data['_embedded']?.['sw360:restApiTokens'])
                        ? []
                        : data['_embedded']['sw360:restApiTokens'],
                )
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
        revoked,
        generatedToken,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className='mb-3'>
            {table ? (
                <>
                    <SW360Table
                        table={table}
                        showProcessing={showProcessing}
                    />
                </>
            ) : (
                <div className='col-12 mt-1 text-center'>
                    <Spinner className='spinner' />
                </div>
            )}
        </div>
    )
}

export default React.memo(TokensTable)
