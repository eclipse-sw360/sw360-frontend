// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, OAuthClient } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import React, { ReactNode, useState, useEffect } from 'react'
import AddClientDialog from './AddClientDialog'
import DeleteClientDialog from './DeleteClientDialog'
import OAuthClientTable from './OAuthClientTable'
import CommonUtils from '@/utils/common.utils'
import MessageService from '@/services/message.service'

function OAuthClientsList(): ReactNode {
    const t = useTranslations('default')
    const [numberClient, setNumberClient] = useState(0)
    const { status } = useSession()
    const [openAddClientDialog, setOpenAddClientDialog] = useState(false)
    const [openDeleteClientDialog, setOpenDeleteClientDialog] = useState(false)
    const [selectedClient, setSelectedClient] = useState<OAuthClient | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [clients, setClients] = useState<OAuthClient[]>([])
    const [loading, setLoading] = useState(true)

    const addClient = () => {
        setSelectedClient(null)
        setOpenAddClientDialog(true)
    }

    const updateClient = (client: OAuthClient) => {
        setSelectedClient(client)
        setOpenAddClientDialog(true)
    }

    const deleteClient = (client: OAuthClient) => {
        setSelectedClient(client)
        setOpenDeleteClientDialog(true)
    }

    const handleDialogClose = () => {
        setOpenDeleteClientDialog(false)
        setOpenAddClientDialog(false)
        setRefreshTrigger((prev) => prev + 1)
    }

    const headerButtons = {
        'Add Client': {
            link: '/admin/oauthclient',
            type: 'primary',
            name: 'Add Client',
            onClick: addClient,
        },
    }

    const sendOAuthClientRequest = async (token: string): Promise<Response> => {
        return fetch(`${SW360_API_URL}/authorization/client-management`, {
            method: 'GET',
            headers: {
                Accept: 'application/*',
                'Content-Type': 'application/json',
                Authorization: token,
            },
        })
    }

    const fetchClientsData = async () => {
        setLoading(true)
        try {
            const session = await getSession()
            console.log('Session:', session)
            if (CommonUtils.isNullOrUndefined(session)) {
                console.log('Session is null or undefined')
                setLoading(false)
                return
            }

            const response = await sendOAuthClientRequest(session.user.access_token)
            console.log('Response:', response)
            if (response.status === HttpStatus.OK) {
                const data = await response.json() as OAuthClient[]
                setClients(data)
                setNumberClient(data.length)
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                MessageService.error(t('Error when processing'))
            }
        } catch (err) {
            console.error('Error fetching clients:', err)
            MessageService.error(t('Error when processing'))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClientsData()
    }, [refreshTrigger])

    if (status === 'unauthenticated') {
        return signOut()
    } else {
        return (
            <div className="container page-content">
                <AddClientDialog show={openAddClientDialog} setShow={handleDialogClose} client={selectedClient} />
                {selectedClient && (
                    <DeleteClientDialog
                        show={openDeleteClientDialog}
                        setShow={handleDialogClose}
                        clientId={selectedClient.client_id}
                    />
                )}
                <div className="row">
                    <div className="col col-12">
                        <div className="col">
                            <div className="row">
                                <PageButtonHeader
                                    buttons={headerButtons}
                                    title={`${t('OAuth Client')} (${numberClient})`}
                                />

                                <div className="row mt-3">
                                    {loading ? (
                                        <p>Loading clients...</p>
                                    ) : (
                                        <OAuthClientTable updateClient={updateClient} deleteClient={deleteClient} clients={clients} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default OAuthClientsList