// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { notFound, useSearchParams } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

import { HttpStatus, Vendor, VendorType } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, useSession } from 'next-auth/react'
import SelectTableVendor from './SelectTableVendor'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    selectVendor: VendorType
}

const VendorDialog = ({ show, setShow, selectVendor }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const params = useSearchParams()
    const [data, setData] = useState()
    const [vendor, setVendor] = useState<Vendor>()
    const [vendors, setVendors] = useState([])
    const handleCloseDialog = () => {
        setShow(!show)
    }

    const searchVendor = () => {
        setVendors(data)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(`vendors`, Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const vendors = await response.json()
                if (
                    !CommonUtils.isNullOrUndefined(vendors['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(vendors['_embedded']['sw360:vendors'])
                ) {
                    const data = vendors['_embedded']['sw360:vendors'].map((item: any) => [
                        item,
                        item.fullName,
                        item.shortName,
                        item.url,
                        '',
                    ])
                    setData(data)
                }
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [params, session])

    const handleClickSelectVendor = () => {
        selectVendor(vendor)
        setShow(!show)
    }

    const getVendor: VendorType = useCallback((Vendor: Vendor) => setVendor(Vendor), [])

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Vendor')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter search text')}
                                aria-describedby='Search Vendor'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button type='button' className='btn btn-secondary me-2' onClick={searchVendor}>
                                {t('Search')}
                            </button>
                            <button type='button' className='btn btn-secondary me-2'>
                                {t('Reset')}
                            </button>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <SelectTableVendor vendors={vendors} setVendor={getVendor} />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    className='fw-bold btn btn-light button-plain me-2'
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button type='button' className='fw-bold btn btn-light button-plain me-2'>
                    {t('Add Vendor')}
                </Button>
                <Button type='button' className='btn btn-primary' onClick={handleClickSelectVendor}>
                    {t('Select Vendor')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default VendorDialog
