// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AccessToken, Embedded, HttpStatus } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import React, { ReactNode, useCallback, useEffect, useState, type JSX } from 'react'
import { Button } from 'react-bootstrap'

interface Props {
    generatedToken: string
}

const TokensTable = ({ generatedToken }: Props): ReactNode => {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<(string | JSX.Element)[][]>([])

    const fetchData = useCallback(async (url: string) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return
            const response = await ApiUtils.GET(url, session.user.access_token)

            if (response.status === HttpStatus.OK) {
                const data: Embedded<AccessToken, 'sw360:restApiTokens'> = (await response.json()) as Embedded<
                    AccessToken,
                    'sw360:restApiTokens'
                >

                const tableData = Object.values(data._embedded['sw360:restApiTokens']).map((token: AccessToken) => {
                    const expirationDate = new Date(
                        Date.parse(token.createdOn + ' +0000') +
                            token.numberOfDaysValid * 24 * 60 * 60 * 1000 -
                            new Date().getTimezoneOffset() * 60000,
                    )

                    return [
                        token.name,
                        new Date(Date.parse(token.createdOn + ' +0000') - new Date().getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 19)
                            .replace('T', ' '),
                        expirationDate.toISOString().slice(0, 19).replace('T', ' '),
                        '[' + token.authorities.join(', ') + ']',
                        _(
                            <Button
                                variant='danger'
                                onClick={() => {
                                    revokeToken(token.name).catch((error) => console.error(error))
                                }}
                            >
                                {t('Revoke Token')}
                            </Button>,
                        ),
                    ]
                })
                setTableData(tableData)
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                setTableData([])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            setTableData([])
        }
    }, [])

    const revokeToken = async (tokenName: string) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return
            const response = await ApiUtils.DELETE(
                CommonUtils.createUrlWithParams('users/tokens', { name: tokenName }),
                session.user.access_token,
            )

            if (response.status === HttpStatus.NO_CONTENT) {
                MessageService.success(t('Revoke token sucessfully'))
                await fetchData('users/tokens')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                MessageService.error(t('Error while processing'))
            }
        } catch (error) {
            console.error('An error occurred while revoking token:', error)
            MessageService.error(t('Error while processing'))
        }
    }

    useEffect(() => {
        fetchData('users/tokens').catch((error) => {
            console.error(error)
        })
    }, [fetchData, generatedToken])

    const columns = [
        {
            id: 'token-name',
            name: t('Token Name'),
            sort: false,
        },
        {
            id: 'created-on',
            name: t('Created on'),
            sort: false,
        },
        {
            id: 'expiration-date',
            name: t('Expiration Date'),
            sort: false,
        },
        {
            id: 'authorities',
            name: t('Authorities'),
            sort: false,
        },
        {
            id: 'action',
            sort: false,
            width: '10%',
        },
    ]

    return (
        <div className='row'>
            {tableData.length > 0 && (
                <Table
                    columns={columns}
                    data={tableData}
                />
            )}
        </div>
    )
}

export default React.memo(TokensTable)
