// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, ErrorDetails, HttpStatus, Session, Vendor } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { SW360_API_URL } from '@/utils/env'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { QuickFilter, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState, type JSX } from 'react'
import { Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { FaTrashAlt } from 'react-icons/fa'
import { FiEdit2 } from 'react-icons/fi'
import { IoMdGitMerge } from 'react-icons/io'

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

const DeleteVendor = async (vendorId: string) => {
    try {
        const session = await getSession()
        if (!session) {
            return signOut()
        }
        const response = await ApiUtils.DELETE(`vendors/${vendorId}`, session.user.access_token)
        if (response.status !== HttpStatus.NO_CONTENT) {
            const err = (await response.json()) as ErrorDetails
            throw new Error(err.message)
        }
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            return
        }
        const message = error instanceof Error ? error.message : String(error)
        MessageService.error(message)
    }
}

function DeletionModal({
    vendor,
    setVendor,
}: {
    setVendor: Dispatch<SetStateAction<Vendor | null>>
    vendor: Vendor | null
}) {
    const t = useTranslations('default')
    return (
        <Modal
            size='lg'
            show={vendor !== null}
            onHide={() => setVendor(null)}
        >
            <Modal.Header
                style={{ backgroundColor: '#feefef', color: '#da1414' }}
                closeButton
            >
                <Modal.Title className='fw-bold'>
                    <AiOutlineQuestionCircle /> {t('Delete Vendor')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className='fs-5'>
                {t.rich('Do you really want to delete the vendor', {
                    name: vendor?.shortName ?? '',
                    strong: (chunks) => <b>{chunks}</b>,
                })}
                ?
            </Modal.Body>
            <Modal.Footer>
                <button
                    className='btn btn-secondary'
                    onClick={() => setVendor(null)}
                >
                    {t('Cancel')}
                </button>
                <button
                    className='btn btn-danger'
                    onClick={() => {
                        ;(async () => {
                            await DeleteVendor(vendor?._links?.self.href.split('/').at(-1) ?? '')
                            setVendor(null)
                        })()
                    }}
                >
                    {t('Delete Vendor')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default function VendorsList(): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()

    const [numVendors, setNumVendors] = useState<null | number>(null)
    const [delVendor, setDelVendor] = useState<Vendor | null>(null)
    const { data: session, status } = useSession()
    const handleAddVendor = () => {
        router.push('/admin/vendors/add')
    }

    const columns = [
        {
            id: 'vendors.fullName',
            name: t('Full Name'),
            formatter: ({ name, id }: { name: string; id: string }) =>
                _(
                    <>
                        <Link
                            href={`/admin/vendors/edit/${id}`}
                            className='text-link'
                        >
                            {name}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'vendors.shortName',
            name: t('Short Name'),
            sort: true,
        },
        {
            id: 'vendors.url',
            name: t('URL'),
            sort: true,
        },
        {
            id: 'vendors.actions',
            name: t('Actions'),
            width: '8%',
            formatter: (vendor: Vendor) => {
                return _(
                    <div className='d-flex justify-content-between'>
                        <Link
                            href={`/admin/vendors/edit/${vendor._links?.self.href.split('/').at(-1)}`}
                            className='text-link'
                        >
                            <FiEdit2 className='btn-icon' />
                        </Link>
                        <span
                            className='d-inline-block'
                            onClick={() => {
                                setDelVendor(vendor)
                            }}
                        >
                            <FaTrashAlt className='btn-icon' />
                        </span>
                        <Link
                            href={`vendors/merge/${vendor._links?.self.href.split('/').at(-1)}`}
                            className='text-link'
                        >
                            <IoMdGitMerge className='btn-icon' />
                        </Link>
                    </div>,
                )
            },
            sort: true,
        },
    ]

    const handleExportSpreadsheet = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const url = 'vendors/exportVendorDetails'
            const currentDate = new Date().toISOString().split('T')[0]
            DownloadService.download(url, session, `vendors-${currentDate}.xlsx`)
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        }
    }

    const initServerPaginationConfig = (session: Session) => {
        return {
            url: `${SW360_API_URL}/resource/api/vendors`,
            then: (data: EmbeddedVendors) => {
                setNumVendors(data.page?.totalElements ?? 0)
                return data._embedded['sw360:vendors'].map((elem: Vendor) => [
                    { name: elem.fullName ?? '', id: elem._links?.self.href.split('/').at(-1) ?? '' },
                    elem.shortName ?? '',
                    elem.url ?? '',
                    elem,
                ])
            },
            total: (data: EmbeddedVendors) => (data.page ? data.page.totalElements : 0),
            headers: { Authorization: `${session.user?.access_token}` },
        }
    }

    return (
        <>
            <DeletionModal
                vendor={delVendor}
                setVendor={setDelVendor}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <QuickFilter id='vendorSearch' />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-lg-5'>
                                <button
                                    className='btn btn-primary col-auto me-2'
                                    onClick={handleAddVendor}
                                >
                                    {t('Add Vendor')}
                                </button>
                                <button
                                    className='btn btn-secondary col-auto'
                                    onClick={() => handleExportSpreadsheet()}
                                >
                                    {t('Export Spreadsheet')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>{`${t('VENDORS')} (${numVendors ?? ''})`}</div>
                        </div>
                        {status === 'authenticated' ? (
                            <Table
                                columns={columns}
                                server={initServerPaginationConfig(session)}
                                selector={true}
                                sort={false}
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
