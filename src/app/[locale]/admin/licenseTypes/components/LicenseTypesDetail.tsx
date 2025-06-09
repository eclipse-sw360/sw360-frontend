// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, LicenseType } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { _, QuickFilter, Table } from 'next-sw360'
import { useRouter } from 'next/navigation'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import DeleteLicenseTypesModal from './DeleteLicenseTypesModal'

type EmbeddedLicenseTypes = Embedded<LicenseType, 'sw360:licenseTypes'>

export default function LicenseTypesDetail(): ReactNode {
    const router = useRouter()
    const t = useTranslations('default')
    const [quickFilter, setQuickFilter] = useState({})
    const [loading, setLoading] = useState<boolean>(false)
    const [licenseTypeId, setLicenseTypeId] = useState<string>('')
    const [licenseTypeName, setLicenseTypeName] = useState<string>('')
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false)
    const [licenseTypeData, setLicenseTypeData] = useState<Array<Array<string | string[]>>>([])
    const [licenseTypeCount, setLicenseTypeCount] = useState<null | number>(null)

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedLicenseTypes
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Unauthorized request'))
            return
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        void fetchData('licenseTypes')
            .then((licenseTypeDetails: EmbeddedLicenseTypes | undefined) => {
                if (licenseTypeDetails === undefined) {
                    return
                }
                if (!CommonUtils.isNullOrUndefined(licenseTypeDetails['_embedded']['sw360:licenseTypes'])) {
                    setLicenseTypeData(
                        licenseTypeDetails._embedded['sw360:licenseTypes'].map((item: LicenseType) => [
                            item.licenseType,
                            [item.id, item.licenseType],
                        ]),
                    )

                    setLicenseTypeCount(licenseTypeDetails._embedded['sw360:licenseTypes'].length)
                }
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [fetchData])

    const handleAddLicenseType = () => {
        router.push('/admin/licenseTypes/add')
    }

    const handleDeleteLicenseType = (id: string, licenseTypeName: string) => {
        setShowDeleteModal(true)
        setLicenseTypeId(id)
        setLicenseTypeName(licenseTypeName)
    }

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setQuickFilter({ keyword: event.currentTarget.value })
    }

    const columns = [
        {
            id: 'licenseType.licenseType',
            name: t('License Type'),
            width: '80%',
            sort: true,
        },
        {
            id: 'licenseType.actions',
            name: t('Actions'),
            width: '20%',
            formatter: ([id, licenseTypeName]: Array<string>) =>
                _(
                    <div className='d-flex justify-content-between'>
                        <OverlayTrigger overlay={<Tooltip>{t('Delete License Type')}</Tooltip>}>
                            <span
                                className='d-inline-block'
                                onClick={() => {
                                    handleDeleteLicenseType(id, licenseTypeName)
                                }}
                            >
                                <FaTrashAlt className='btn-icon' />
                            </span>
                        </OverlayTrigger>
                    </div>,
                ),
            sort: true,
        },
    ]

    return (
        <>
            <DeleteLicenseTypesModal
                licenseTypeId={licenseTypeId}
                licenseTypeName={licenseTypeName}
                show={showDeleteModal}
                setShow={setShowDeleteModal}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <QuickFilter
                            id='licenseTypeSearch'
                            searchFunction={doSearch}
                            title={t('Quick Filter')}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-lg-5'>
                                <button
                                    className='btn btn-primary col-auto me-2'
                                    onClick={() => handleAddLicenseType()}
                                >
                                    {t('Add License Type')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>
                                {`${t('License Types')} (${licenseTypeCount ?? ''})`}
                            </div>
                        </div>
                        {!loading ? (
                            <Table
                                columns={columns}
                                data={licenseTypeData}
                                selector={true}
                                sort={false}
                                search={quickFilter}
                            />
                        ) : (
                            <div className='col-12 d-flex justify-content-center align-items-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
