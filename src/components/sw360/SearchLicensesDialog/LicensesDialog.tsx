// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useRef, useState, type JSX } from 'react'
import { Button, Modal } from 'react-bootstrap'

import { Embedded, HttpStatus, LicenseDetail } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession } from 'next-auth/react'
import LicensesTable from './LicensesTable'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    selectLicenses: (licenses: { [k: string]: string }) => void
    releaseLicenses: { [k: string]: string }
}

type EmbeddedLicenses = Embedded<LicenseDetail, 'sw360:licenses'>

const LicensesDialog = ({ show, setShow, selectLicenses, releaseLicenses }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [selectedLicenses, setSelectedLicenses] = useState<{ [k: string]: string }>(releaseLicenses)
    const [licenseDatas, setLicenseDatas] = useState<Array<(LicenseDetail | string)[]>>([])

    const searchText = useRef<string>('')

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const searchLicenses = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const queryUrl = CommonUtils.createUrlWithParams(`licenses`, {})
        const response = await ApiUtils.GET(queryUrl, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return
        } else if (response.status !== HttpStatus.OK) {
            MessageService.error(t('Error while processing'))
            return
        }
        const licenses = (await response.json()) as EmbeddedLicenses
        if (typeof licenses == 'undefined') {
            setLicenseDatas([])
            return
        }
        if (
            !CommonUtils.isNullOrUndefined(licenses['_embedded']) &&
            !CommonUtils.isNullOrUndefined(licenses['_embedded']['sw360:licenses'])
        ) {
            const data = licenses['_embedded']['sw360:licenses'].map((item: LicenseDetail) => [
                item,
                item.fullName ?? '',
            ])
            setLicenseDatas(data)
        }
    }

    const handleClickSelectLicenses = () => {
        selectLicenses(selectedLicenses)
        setShow(!show)
    }

    return (
        <Modal
            show={show}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
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
                                onChange={(event) => {
                                    searchText.current = event.target.value
                                }}
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                                onClick={() => void searchLicenses()}
                            >
                                {t('Search')}
                            </button>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                            >
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
                <Button
                    type='button'
                    className={`btn btn-primary`}
                    onClick={handleClickSelectLicenses}
                >
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LicensesDialog
