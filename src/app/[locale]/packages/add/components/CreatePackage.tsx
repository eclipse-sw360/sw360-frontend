// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type JSX, useState } from 'react'
import { ListGroup, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import { Package, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { getAuthenticatedUserIdentity } from '@/utils/api/authenticatedUser.util'
import CreateOrEditPackage from '../../components/CreateOrEditPackage'
import { extractPackageManagerFromPurl } from '../../components/purlUtils'

function CreatePackage(): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()
    const d = new Date()
    const [packagePayload, setPackagePayload] = useState<Package>({
        createdOn: `${d.getFullYear()}-${d.getMonth() < 10 ? `0${d.getMonth()}` : d.getMonth()}-${d.getDate() < 10 ? `0${d.getDate()}` : d.getDate()}`,
    })
    const [creatingPackage, setCreatingPackage] = useState(false)

    const handleGoBack = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.push('/packages')
        }
    }

    const handleCreatePackage = async () => {
        try {
            setCreatingPackage(true)
            const userIdentity = await getAuthenticatedUserIdentity()

            const normalizedPurl = packagePayload.purl?.trim()
            const packageManager = extractPackageManagerFromPurl(normalizedPurl)
            if (!normalizedPurl || !packageManager) {
                MessageService.error(t('Enter a valid pURL'))
                return
            }

            const response = await ApiUtils.POST('packages', {
                ...packagePayload,
                purl: normalizedPurl,
                createdBy: userIdentity.email,
                packageManager,
            })
            let res: Record<string, string> = {}
            try {
                res = (await response.json()) as Record<string, string>
            } catch (error) {
                ApiUtils.reportError(error)
            }
            if (response.status == StatusCodes.CREATED) {
                MessageService.success(t('Package created successfully'))
                if (res.id) {
                    router.push(`/packages/detail/${res.id}`)
                } else {
                    handleGoBack()
                }
            } else {
                const errorMessage = res.message ?? response.statusText
                if (
                    errorMessage?.includes('Dependent document Id/ids not valid') ||
                    errorMessage?.includes('Invalid pURL')
                ) {
                    MessageService.error(t('Enter a valid pURL'))
                } else {
                    MessageService.error(`${t('Something went wrong')}: ${errorMessage}`)
                }
            }
        } catch (e) {
            ApiUtils.reportError(e)
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

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(CreatePackage, [
    UserGroupType.SECURITY_USER,
])
