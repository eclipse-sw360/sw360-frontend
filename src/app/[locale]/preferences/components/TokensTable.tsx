// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { AccessToken, Embedded, HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { MessageContext } from './MessageContextProvider'

interface Props {
    generatedToken: string
}

const TokensTable = ({ generatedToken }: Props) => {
    const t = useTranslations('default')
    const { setToastData } = useContext(MessageContext)
    const [tableData, setTableData] = useState([])

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = (await response.json()) as Embedded<AccessToken, 'sw360:restApiTokens'>
            if (data._embedded === undefined) {
                setTableData([])
                return
            }
            const tableData = Object.values(data._embedded['sw360:restApiTokens']).map((token: AccessToken) => {
                const expirationDate = new Date(
                    Date.parse(token.createdOn + ' +0000') +
                        token.numberOfDaysValid * 24 * 60 * 60 * 1000 -
                        new Date().getTimezoneOffset() * 60000
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
                        <Button variant='danger' onClick={() => revokeToken(token.name)}>
                            {t('Revoke Token')}
                        </Button>
                    ),
                ]
            })
            setTableData(tableData)
        } else if (response.status == HttpStatus.UNAUTHORIZED) {
            await signOut()
        } else {
            setTableData([])
        }
    }, [])

    const revokeToken = async (tokenName: string) => {
        const session = await getSession()
        const response = await ApiUtils.DELETE(
            CommonUtils.createUrlWithParams('users/tokens', { name: tokenName }),
            session.user.access_token
        )
        if (response.status === HttpStatus.NO_CONTENT) {
            setToastData({
                show: true,
                message: t('Revoke token sucessfully'),
                type: t('Success'),
                contextual: 'success',
            })
            fetchData('users/tokens')
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            signOut()
        } else {
            setToastData({
                show: true,
                message: t('Error while processing'),
                type: t('Error'),
                contextual: 'danger',
            })
        }
    }

    useEffect(() => {
        fetchData('users/tokens')
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

    return <div className='row'>{tableData.length > 0 && <Table columns={columns} data={tableData} />}</div>
}

export default React.memo(TokensTable)