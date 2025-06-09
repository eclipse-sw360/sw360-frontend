// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, Package } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import { ListGroup, Tab } from 'react-bootstrap'
import CreateOrEditPackage from '../../components/CreateOrEditPackage'

export default function CreatePackage(): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const d = new Date()
    const [packagePayload, setPackagePayload] = useState<Package>({
        createdOn: `${d.getFullYear()}-${d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth()}-${d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}`,
    })
    const [creatingPackage, setCreatingPackage] = useState(false)

    const handleCreatePackage = async () => {
        try {
            setCreatingPackage(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return
            const response = await ApiUtils.POST(
                'packages',
                {
                    ...packagePayload,
                    createdBy: session.user.email,
                    packageManager: packagePayload.purl?.substring(4, packagePayload.purl.indexOf('/')).toUpperCase(),
                },
                session.user.access_token,
            )
            if (response.status == HttpStatus.CREATED) {
                MessageService.success(t('Package created successfully'))
                router.push('/packages')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                const res = (await response.json()) as Record<string, string>
                MessageService.error(`${t('Something went wrong')}: ${res.message}`)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setCreatingPackage(false)
        }
    }

    return (
        <>
            <Tab.Container
                defaultActiveKey='summary'
                mountOnEnter={true}
                unmountOnExit={true}
            >
                <div className='row mx-2 mt-3'>
                    <div className='col-lg-2'>
                        <ListGroup>
                            <ListGroup.Item
                                action
                                eventKey='summary'
                            >
                                <div className='my-2'>{t('Summary')}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </div>
                    <div className='col ms-2 me-4 mt-2'>
                        <Tab.Content>
                            <Tab.Pane eventKey='summary'>
                                <CreateOrEditPackage
                                    packagePayload={packagePayload}
                                    setPackagePayload={setPackagePayload}
                                    handleSubmit={() => {
                                        handleCreatePackage().catch((e) => console.error(e))
                                    }}
                                    isPending={creatingPackage}
                                    isEditPage={false}
                                />
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </div>
            </Tab.Container>
        </>
    )
}
