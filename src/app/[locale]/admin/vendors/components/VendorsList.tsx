// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, Vendor } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { QuickFilter, Table, _ } from 'next-sw360'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react';
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import { FiEdit2 } from 'react-icons/fi'
import { IoMdGitMerge } from 'react-icons/io'

type EmbeddedVendors = Embedded<Vendor, 'sw360:vendors'>

export default function VendorsList(): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()

    const [numVendors, setNumVendors] = useState<null | number>(null)
    const [VendorData, setVendorData] = useState<Array<(Vendor | JSX.Element)[]>>([])
    const [delVendor, setDelVendor] = useState<boolean>(true)
    const [loading, setLoading] = useState<boolean>(true)
    const handleAddVendor = () => {
        router.push('/admin/vendors/add')
    }

    const DeleteVendor = async(vendorId: string) => {
        try {
            const session = await getSession()
            if (!session) {
                return signOut()
            }
            const response = await ApiUtils.DELETE(
                `vendors/${vendorId}`,
                session.user.access_token,
            )
            if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status !== HttpStatus.NO_CONTENT) {
                return notFound()
            }
        } catch (e) {
            if (e instanceof Error) {
                throw new Error(e.message)
            }
        }finally{
            setDelVendor((prev) => !prev)
        }
    }

    const columns = [
        {
            id: 'vendors.fullName',
            name: t('Full Name'),
            formatter: (name: string) =>
                _(
                    <>
                        <Link href='#' className='text-link'>
                            {name}
                        </Link>
                    </>
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
            formatter: (cell:string) =>{
                const VendorId=cell.toString().split('/resource/api/vendors/')[1];
                return _(
                    <div className='d-flex justify-content-between'>
                        <Link href='#' className='text-link'>
                            <FiEdit2 className='btn-icon' />
                        </Link>
                       
                        <OverlayTrigger overlay={<Tooltip>{t('Delete Vendor')}</Tooltip>}>
                            <span
                                className='d-inline-block'
                                onClick={()=>{DeleteVendor(VendorId)}}
                            >
                                <FaTrashAlt className='btn-icon' />

                            </span>
                        </OverlayTrigger>
                        <Link href={`vendors/merge/${VendorId}`} className='text-link'>
                            <IoMdGitMerge className='btn-icon' />
                        </Link>
                    </div>
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
        }
        catch(error: unknown) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return
            }    
            const message = error instanceof Error ? error.message : String(error);
            MessageService.error(message)
        }
    }

    useEffect(()=>{
        void (async() => {
            setLoading(true)
            const controller = new AbortController()
            const signal = controller.signal
            try {
                const session = await getSession()
                if (!session) {
                    return signOut()
                }
                const response = await ApiUtils.GET(
                    `vendors`,
                    session.user.access_token,
                    signal
                )
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const vendors = (await response.json()) as EmbeddedVendors

                // Set the total number of vendors
                setNumVendors(vendors.page?.totalElements ?? 0)

                // Set the vendor data with proper type safety
                setVendorData(
                    vendors._embedded?.['sw360:vendors']?.map((elem: Vendor) => {
                        return [
                            elem.fullName ?? '',
                            elem.shortName ?? '',
                            elem.url ?? '',
                            elem._links?.self?.href ?? '',
                        ] as (Vendor | JSX.Element)[]
                    }) ?? []
                )
            } catch (e) {
                if (e instanceof Error) {
                    throw new Error(e.message)
                }
            }finally{
                setLoading(false)
                controller.abort();
            }
        })()
    },[delVendor,])

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <QuickFilter id='vendorSearch' />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between'>
                            <div className='col-lg-5'>
                                <button className='btn btn-primary col-auto me-2' onClick={handleAddVendor}>
                                    {t('Add Vendor')}
                                </button>
                                <button className='btn btn-secondary col-auto'
                                        onClick={() => handleExportSpreadsheet()}
                                >
                                    {t('Export Spreadsheet')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>{`${t('VENDORS')} (${numVendors ?? ''})`}</div>
                        </div>
                        {!loading ? (
                            <Table 
                                columns={columns} 
                                data={VendorData}
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
