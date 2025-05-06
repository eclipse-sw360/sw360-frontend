// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, LicenseDetail } from '@/object-types';
import MessageService from '@/services/message.service';
import CommonUtils from '@/utils/common.utils';
import { ApiUtils } from '@/utils/index';
import { getSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { _, Table } from 'next-sw360';
import { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';

interface Props {
    showMainLicenseModal: boolean
    setShowMainLicenseModal: React.Dispatch<React.SetStateAction<boolean>>
    setMainLicensesToPayload: (licenseIds: { [k: string]: string }) => void
    exisitngMainLicenses: { [k: string]: string }
    multiple: boolean
}

type EmbeddedLicenses= Embedded<LicenseDetail, 'sw360:licenses'>

type RowData = (string | LicenseDetail)[]

export default function AddMainLicenseModal({ showMainLicenseModal,
                                              setShowMainLicenseModal,
                                              setMainLicensesToPayload,
                                              exisitngMainLicenses,
                                              multiple }: Props) : JSX.Element {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [newMainLicense, setNewMainLicense] = useState({})
    const searchText = useRef<string>('')
    const [variant, setVariant] = useState('success')
    const [message, setMessage] = useState<JSX.Element>()
    const [showMessage, setShowMessage] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fetchedLicenses, setFetchedLicenses] = useState<Array<RowData>>([])

    const displayMessage = (variant: string, message: JSX.Element) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const handleCloseDialog = () => {
        setShowMainLicenseModal(!showMainLicenseModal)
        setNewMainLicense(exisitngMainLicenses)
    }
    console.log(multiple)
    console.log(loading)

    const fetchData = useCallback(
        async (url: string) => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)){
                displayMessage('danger', <>{t('Session has expired')}</>)
                setLoading(false)
                return signOut()
            }
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status === HttpStatus.UNAUTHORIZED) {
                displayMessage('warning', <>{t('Unauthorized request')}</>)
                setLoading(false)
                return
            }
            else if (response.status === HttpStatus.OK) {
                const data = await response.json() as EmbeddedLicenses
                return data
            } else {
                return undefined
            }
        },
        []
    )

    useEffect(() => {
        setLoading(true)
        try{
            fetchData('licenses')
            .then((mainLicenses: EmbeddedLicenses | undefined) => {
                if (mainLicenses === undefined) return
                if (
                    !CommonUtils.isNullOrUndefined(mainLicenses['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(mainLicenses['_embedded']['sw360:licenses'])
                ) {
                    const data = mainLicenses['_embedded']['sw360:licenses']
                                 .map((license: LicenseDetail) => [
                        license,
                        license.fullName ?? ''
                    ])
                    setTableData(data)
                    setFetchedLicenses(data)
                } else {
                    setTableData([])
                }
                setNewMainLicense(exisitngMainLicenses)
            })
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        } finally{
            setLoading(false)
            }
    }, [fetchData, showMainLicenseModal, exisitngMainLicenses])

    const handleClickSelectLicenses = () => {
        setShowMainLicenseModal(!showMainLicenseModal)
        setMainLicensesToPayload(newMainLicense)
    }

    const searchLicenses = (searchText: string,
                            licenses: Array<RowData> ): Array<RowData> => {
        if (!searchText.trim()) {
            return licenses
        }
        const normalizedSearchText = searchText.toLowerCase().trim();
        return licenses.filter((row) => {
            const license = row[0] as LicenseDetail
            const fullName = (row[1] as string) || ''
            const licenseId = license.id ?? ''
            return (
                (licenseId.toLowerCase().includes(normalizedSearchText)) ||
                fullName.toLowerCase().includes(normalizedSearchText)
            )
        })
    }
    
    const handleSearch = (searchText: string) => {
        const filteredResults = searchLicenses(searchText, fetchedLicenses)
        setTableData(filteredResults)
    }

    const resetSelection = () => {
        setTableData(fetchedLicenses)
    }

    const columns = [
            {
                id: 'license-selection',
                name: '',
                formatter: () =>
                    _(
                        <Form.Check
                            name='license-selection'
                            type= { multiple ? 'checkbox' : 'radio' }
                        ></Form.Check>
                    ),
                width: '7%',
                sort: false,
            },
            {
                id: 'fullName',
                name: 'Full Name',
                width: 'auto',
                sort: true,
            },
    ]

    return (
        <Modal show={showMainLicenseModal}
               onHide={handleCloseDialog}
               backdrop='static'
               centered size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Licenses')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert  variant={variant}
                        onClose={() => setShowMessage(false)}
                        show={showMessage}
                        dismissible>
                        {message}
                </Alert>
                <div className='row'>
                    <div className='col-lg-8'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Enter search text')}
                            aria-describedby='Search Licenses'
                            onChange={(event) => {searchText.current = event.target.value }}
                        />
                    </div>
                    <div className='col-lg-4'>
                        <button type='button'
                                className='btn btn-secondary me-2'
                                onClick={() => void handleSearch(searchText.current)}
                        >
                            {t('Search')}
                        </button>
                        <button type='button'
                                className='btn btn-secondary me-2'
                                onClick={resetSelection}
                        >
                            {t('Reset')}
                        </button>
                    </div>
                </div>
                <div className='mt-3'>
                    <Table columns={columns} data={tableData} />
                </div>

            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    variant='secondary'
                    className='me-2'
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button type='button' className='btn btn-primary' onClick={handleClickSelectLicenses}>
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
