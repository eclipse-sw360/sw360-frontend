// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useRouter, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageButtonHeader } from 'next-sw360'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Col, ListGroup, Row, Tab } from 'react-bootstrap'
import { AccessControl } from '@/components/AccessControl/AccessControl'
import LinkedObligations from '@/components/LinkedObligations/LinkedObligations'
import LinkedObligationsDialog from '@/components/sw360/SearchObligations/LinkedObligationsDialog'
import { LicenseDetail, LicensePayload, LicenseTabIds, UserGroupType } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import DeleteLicenseDialog from '../../components/DeleteLicenseDialog'
import EditLicenseSummary from './EditLicenseSummary'

interface Props {
    licenseId: string
}

function EditLicense({ licenseId }: Props): ReactNode {
    const t = useTranslations('default')
    const router = useRouter()
    const params = useSearchParams()

    const [addObligationDiaglog, setAddObligationDiaglog] = useState<boolean>(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
    const [inputValid, setInputValid] = useState<boolean>(false)
    const [errorFullName, setErrorFullName] = useState<boolean>(false)
    const [licensePayload, setLicensePayload] = useState<LicensePayload>({
        shortName: '',
        fullName: '',
        note: '',
        OSIApproved: 'NA',
        FSFLibre: 'NA',
        obligationDatabaseIds: [],
        text: '',
        checked: false,
        licenseTypeDatabaseId: '',
    })
    const session = useSession()
    const [activeKey, setActiveKey] = useState(LicenseTabIds.DETAILS)

    const handleSelect = (key: string | null) => {
        setActiveKey(key ?? LicenseTabIds.DETAILS)
    }

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const handleClickAddObligations = useCallback(() => setAddObligationDiaglog(true), [])

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const queryUrl = CommonUtils.createUrlWithParams(`licenses/${licenseId}`, Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.data.user.access_token, signal)
                if (response.status === StatusCodes.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== StatusCodes.OK) {
                    return notFound()
                }
                const license = (await response.json()) as LicenseDetail
                setLicensePayload(license)
            } catch (error) {
                ApiUtils.reportError(error)
            }
        })()
        return () => controller.abort()
    }, [
        params,
        licenseId,
    ])

    const submit = async () => {
        setInputValid(true)
        if (CommonUtils.isNullEmptyOrUndefinedString(licensePayload.fullName)) {
            setErrorFullName(true)
            MessageService.error(t('Fullname not null or empty'))
            return
        }

        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }

        try {
            const response = await ApiUtils.PATCH(`licenses/${licenseId}`, licensePayload, session.user.access_token)

            if (response.status === StatusCodes.OK) {
                const data = (await response.json()) as LicensePayload
                MessageService.success(t('License updated successfully'))
                router.push(`/licenses/detail?id=${data.shortName}`)
            } else if (response.status === StatusCodes.ACCEPTED) {
                MessageService.success(t('License update sent for moderation'))
                router.push(`/licenses/detail?id=${licensePayload.shortName}`)
            } else {
                const responseMessage = await response.text()
                MessageService.error(responseMessage)
            }
        } catch (error) {
            ApiUtils.reportError(error)
        }
    }
    const deleteLicense = () => {
        setDeleteDialogOpen(true)
    }

    const headerButtons = {
        'Update License': {
            link: '',
            type: 'primary',
            onClick: submit,
            name: t('Update License'),
        },
        'Delete License': {
            link: '',
            type: 'danger',
            onClick: deleteLicense,
            name: t('Delete License'),
        },
        Cancel: {
            link: `/licenses/detail?id=${licenseId}`,
            type: 'light',
            name: t('Cancel'),
        },
    }

    const headerButtonAddObligations = {
        'Update License': {
            link: '',
            type: 'primary',
            onClick: submit,
            name: t('Update License'),
        },
        'Delete License': {
            link: '',
            type: 'danger',
            onClick: deleteLicense,
            name: t('Delete License'),
        },
        'Add Obligation': {
            link: '',
            type: 'secondary',
            onClick: handleClickAddObligations,
            name: t('Add Obligation'),
        },
        Cancel: {
            link: `/licenses/detail?id=${licenseId}`,
            type: 'light',
            name: t('Cancel'),
        },
    }

    return (
        <div className='container page-content'>
            <DeleteLicenseDialog
                licensePayload={licensePayload}
                show={deleteDialogOpen}
                setShow={setDeleteDialogOpen}
            />
            <Tab.Container
                activeKey={activeKey}
                onSelect={(k) => handleSelect(k)}
            >
                <Row>
                    <Col
                        sm={2}
                        className='me-3'
                    >
                        <ListGroup>
                            <ListGroup.Item
                                action
                                eventKey={LicenseTabIds.DETAILS}
                            >
                                <div className='my-2'>{t('Details')}</div>
                            </ListGroup.Item>
                        </ListGroup>
                        <ListGroup>
                            <ListGroup.Item
                                action
                                eventKey={LicenseTabIds.OBLIGATIONS}
                            >
                                <div className='my-2'>{t('Obligations')}</div>
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col>
                        <Row className='mb-3'>
                            {activeKey === LicenseTabIds.OBLIGATIONS ? (
                                <PageButtonHeader
                                    title={`${licensePayload.fullName} (${licensePayload.shortName})`}
                                    buttons={headerButtonAddObligations}
                                    checked={licensePayload.checked}
                                ></PageButtonHeader>
                            ) : (
                                <PageButtonHeader
                                    title={`${licensePayload.fullName} (${licensePayload.shortName})`}
                                    buttons={headerButtons}
                                    checked={licensePayload.checked}
                                ></PageButtonHeader>
                            )}
                        </Row>
                        <Row>
                            <Tab.Content>
                                <Tab.Pane eventKey={LicenseTabIds.DETAILS}>
                                    <EditLicenseSummary
                                        errorFullName={errorFullName}
                                        inputValid={inputValid}
                                        setErrorFullName={setErrorFullName}
                                        licensePayload={licensePayload}
                                        setLicensePayload={setLicensePayload}
                                    />
                                </Tab.Pane>
                                <Tab.Pane eventKey={LicenseTabIds.OBLIGATIONS}>
                                    <LinkedObligationsDialog
                                        show={addObligationDiaglog}
                                        setShow={setAddObligationDiaglog}
                                        licensePayload={licensePayload}
                                        setLicensePayload={setLicensePayload}
                                    />
                                    <LinkedObligations
                                        licensePayload={licensePayload}
                                        setLicensePayload={setLicensePayload}
                                    />
                                </Tab.Pane>
                            </Tab.Content>
                        </Row>
                    </Col>
                </Row>
            </Tab.Container>
        </div>
    )
}

// Pass notAllowedUserGroups to AccessControl to restrict access
export default AccessControl(EditLicense, [
    UserGroupType.SECURITY_USER,
    UserGroupType.VIEWER,
])
