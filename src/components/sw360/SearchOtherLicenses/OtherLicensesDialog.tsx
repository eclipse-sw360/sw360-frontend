// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

import { HttpStatus, Licenses, LicensesType } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { notFound, useSearchParams } from 'next/navigation'
import SelectTableOtherLicenses from './SelectTableOtherLicenses'

interface Props {
    show?: boolean
    setShow?: React.Dispatch<React.SetStateAction<boolean>>
    selectLicenses?: LicensesType
}

const OtherLicensesDialog = ({ show, setShow, selectLicenses }: Props) => {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const params = useSearchParams()
    const [data, setData] = useState([])
    const [licenses] = useState([])
    const [licensesResponse, setLicensesResponse] = useState<Licenses>()
    const [licenseDatas, setLicenseDatas] = useState([])

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const searchVendor = () => {
        setLicenseDatas(data)
    }

    useEffect(() => {
        const controller = new AbortController()
        const signal = controller.signal

        ;(async () => {
            try {
                const queryUrl = CommonUtils.createUrlWithParams(`licenses`, Object.fromEntries(params))
                const response = await ApiUtils.GET(queryUrl, session.user.access_token, signal)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const licenses = await response.json()
                if (typeof licenses == 'undefined') {
                    setData([])
                    return
                }
                if (
                    !CommonUtils.isNullOrUndefined(licenses['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(licenses['_embedded']['sw360:licenses'])
                ) {
                    const data = licenses['_embedded']['sw360:licenses'].map((item: any) => [item, item.fullName])
                    setData(data)
                }
            } catch (e) {
                console.error(e)
            }
        })()
        return () => controller.abort()
    }, [params, session])

    const handleClickSelectModerators = () => {
        selectLicenses(licensesResponse)
        setShow(!show)
    }

    const getLicenses: LicensesType = useCallback((licenses: Licenses) => setLicensesResponse(licenses), [])

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Licenses')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter search text')}
                                aria-describedby='Search Licenses'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                                onClick={searchVendor}
                            >
                                {t('Search')}
                            </button>
                            <button type='button' className={`fw-bold btn btn-light button-plain me-2`}>
                                {t('Reset')}
                            </button>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <SelectTableOtherLicenses
                            licenseDatas={licenseDatas}
                            setLicenses={getLicenses}
                            fullnames={licenses}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    className={`fw-bold btn btn-light button-plain me-2`}
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button
                    type='button'
                    className={`fw-bold btn btn-light button-orange`}
                    onClick={handleClickSelectModerators}
                >
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default OtherLicensesDialog
