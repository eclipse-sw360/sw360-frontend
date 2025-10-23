// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useRouter } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { ListGroup, Spinner, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { Package, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import CreateOrEditPackage from '../../../components/CreateOrEditPackage'

function EditPackage({ packageId }: { packageId: string }): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const [packagePayload, setPackagePayload] = useState<Package | undefined>(undefined)
    const [updatingPackage, setUpdatingPackage] = useState(false)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    useEffect(() => {
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session)) return signOut()
                const response = await ApiUtils.GET(`packages/${packageId}`, session.user.access_token)
                if (response.status === StatusCodes.OK) {
                    setPackagePayload((await response.json()) as Package)
                } else {
                    notFound()
                }
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    const handleEditPackage = async () => {
        try {
            setUpdatingPackage(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.PATCH(
                `packages/${packageId}`,
                {
                    ...packagePayload,
                    packageManager: packagePayload?.purl?.substring(4, packagePayload.purl.indexOf('/')).toUpperCase(),
                },
                session.user.access_token,
            )
            if (response.status == StatusCodes.OK) {
                MessageService.success(t('Package updated successfully'))
                router.push(`/packages/detail/${packageId}`)
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                await signOut()
            } else {
                const res = (await response.json()) as Record<string, string>
                MessageService.error(`${t('Something went wrong')}: ${res.message}`)
            }
        } finally {
            setUpdatingPackage(false)
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
                                {packagePayload ? (
                                    <CreateOrEditPackage
                                        packagePayload={packagePayload}
                                        setPackagePayload={setPackagePayload as Dispatch<SetStateAction<Package>>}
                                        handleSubmit={() => {
                                            handleEditPackage().catch((e) => console.error(e))
                                        }}
                                        isPending={updatingPackage}
                                        isEditPage={true}
                                        packageId={packageId}
                                    />
                                ) : (
                                    <div className='col-12 mt-1 text-center'>
                                        <Spinner className='spinner' />
                                    </div>
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </div>
            </Tab.Container>
        </>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EditPackage, [
    UserGroupType.SECURITY_USER,
])
