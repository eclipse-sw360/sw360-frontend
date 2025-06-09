// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { LicenseDetail, Package } from '@/object-types'
import { useTranslations } from 'next-intl'
import { _, Table } from 'next-sw360'
import { useEffect, useRef, useState, type JSX } from 'react'
import { Button, Modal } from 'react-bootstrap'

interface Props {
    showMainLicenseModal: boolean
    fetchedLicenses: Array<RowData>
    existingMainLicense: Array<string>
    setPackagePayload: React.Dispatch<React.SetStateAction<Package>>
    setShowMainLicenseModal: React.Dispatch<React.SetStateAction<boolean>>
}

type RowData = (string | LicenseDetail)[]

export default function AddMainLicenseModal({
    existingMainLicense,
    fetchedLicenses,
    showMainLicenseModal,
    setPackagePayload,
    setShowMainLicenseModal,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const searchText = useRef<string>('')
    const [tableData, setTableData] = useState<Array<RowData>>([])
    const [newMainLicense, setNewMainLicense] = useState<Array<string>>([])

    useEffect(() => {
        if (fetchedLicenses.length > 0) {
            setTableData(fetchedLicenses)
        }
    }, [fetchedLicenses])

    useEffect(() => {
        if (existingMainLicense.length > 0) {
            setNewMainLicense(existingMainLicense)
        }
    }, [existingMainLicense])

    const searchLicenses = (searchText: string, licenses: Array<RowData>): Array<RowData> => {
        if (!searchText.trim()) {
            return licenses
        }
        const normalizedSearchText = searchText.toLowerCase().trim()
        return licenses.filter((row) => {
            const license = row[0] as LicenseDetail
            const fullName = (row[1] as string) || ''
            const licenseId = license.id ?? ''
            return (
                licenseId.toLowerCase().includes(normalizedSearchText) ||
                fullName.toLowerCase().includes(normalizedSearchText)
            )
        })
    }

    const handleSearch = (searchText: string) => {
        const filteredResults = searchLicenses(searchText, fetchedLicenses)
        setTableData(filteredResults)
    }

    const handleCheckboxes = (licenseId: string) => {
        setNewMainLicense((prevLicenseIds: string[]) => {
            const index = prevLicenseIds.indexOf(licenseId)
            if (index !== -1) {
                const newIds = [...prevLicenseIds]
                newIds.splice(index, 1)
                return newIds
            } else {
                return [...prevLicenseIds, licenseId]
            }
        })
    }

    const handleSelectLicense = () => {
        if (newMainLicense.length > 0) {
            setPackagePayload((prevState: Package) => ({
                ...prevState,
                licenseIds: newMainLicense,
            }))
        }
    }

    const resetSelection = () => {
        setTableData(fetchedLicenses)
    }

    const handleCloseDialog = () => {
        setShowMainLicenseModal(false)
        setNewMainLicense(existingMainLicense)
        setTableData(fetchedLicenses)
    }

    const columns = [
        {
            id: 'license-selection',
            name: '',
            formatter: (licenseId: string) =>
                _(
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            name='licenseId'
                            value={licenseId}
                            id={licenseId}
                            title=''
                            placeholder='License Id'
                            checked={newMainLicense.includes(licenseId)}
                            onChange={() => handleCheckboxes(licenseId)}
                        />
                    </div>,
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
        <Modal
            show={showMainLicenseModal}
            onHide={handleCloseDialog}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Search Licenses')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                            className='btn btn-secondary me-2'
                            onClick={() => void handleSearch(searchText.current)}
                        >
                            {t('Search')}
                        </button>
                        <button
                            type='button'
                            className='btn btn-secondary me-2'
                            onClick={resetSelection}
                        >
                            {t('Reset')}
                        </button>
                    </div>
                </div>
                <div className='mt-3'>
                    <Table
                        columns={columns}
                        data={tableData}
                    />
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
                <Button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => {
                        handleSelectLicense()
                        handleCloseDialog()
                    }}
                >
                    {t('Select Licenses')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
