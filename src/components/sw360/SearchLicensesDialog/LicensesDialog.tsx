// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

import { HttpStatus, LicenseDetail } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, getSession } from 'next-auth/react'
import { notFound } from 'next/navigation'
import LicensesTable from './LicensesTable'

interface Props {
    show?: boolean
    setShow?: React.Dispatch<React.SetStateAction<boolean>>
    selectLicenses?: (licenses: { [k: string]: string }) => void
    releaseLicenses: { [k: string]: string }
}

const LicensesDialog = ({ show, setShow, selectLicenses, releaseLicenses }: Props) => {
    const t = useTranslations('default')
    const [selectedLicenses, setSelectedLicenses] = useState<{ [k: string]: string }>(releaseLicenses)
    const [licenseDatas, setLicenseDatas] = useState([])

    const searchText = useRef<string>('')

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const searchLicenses = async () => {
        const session = await getSession()
        const queryUrl = CommonUtils.createUrlWithParams(`licenses`, {})
        const response = await ApiUtils.GET(queryUrl, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        } else if (response.status !== HttpStatus.OK) {
            return notFound()
        }
        const licenses = await response.json()
        if (typeof licenses == 'undefined') {
            setLicenseDatas([])
            return
        }
        if (
            !CommonUtils.isNullOrUndefined(licenses['_embedded']) &&
            !CommonUtils.isNullOrUndefined(licenses['_embedded']['sw360:licenses'])
        ) {
            const data = licenses['_embedded']['sw360:licenses'].map((item: LicenseDetail) => [item, item.fullName])
            setLicenseDatas(data)
        }
    }

    const handleClickSelectLicenses = () => {
        selectLicenses(selectedLicenses)
        setShow(!show)
    }

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
                                onChange={(event) => { searchText.current = event.target.value }}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                                onClick={searchLicenses}
                            >
                                {t('Search')}
                            </button>
                            <button type='button' className={`fw-bold btn btn-light button-plain me-2`}>
                                {t('Reset')}
                            </button>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <LicensesTable
                            licenseDatas={licenseDatas}
                            setLicenses={setSelectedLicenses}
                            selectedLicenses={selectedLicenses}
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
                <Button type='button' className={`btn btn-primary`} onClick={handleClickSelectLicenses}>
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LicensesDialog
