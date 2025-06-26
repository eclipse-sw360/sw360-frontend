// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, ErrorDetails, HttpStatus, Release, Session, Vendor } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { SW360_API_URL } from '@/utils/env'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { QuickFilter, Table, VendorDialog, _ } from 'next-sw360'
import React, { Dispatch, SetStateAction, useEffect, useState, type JSX } from 'react'
import { Alert, Modal, Spinner } from 'react-bootstrap'
import { GiCancel } from 'react-icons/gi'

const MemoTable = React.memo(Table, () => true)

interface AlertData {
    variant: string
    message: JSX.Element
}

function UpdateReleaseModal({
    release,
    setRelease,
    reloadKey,
    setReloadKey,
}: {
    release: Release | null
    setRelease: Dispatch<SetStateAction<Release | null>>
    reloadKey: number
    setReloadKey: Dispatch<SetStateAction<number>>
}): JSX.Element {
    const t = useTranslations('default')
    const [vendor, setVendor] = useState<Vendor>(release?.vendor ?? {})
    const [selectVendor, setSelectVendor] = useState(false)
    const [alert, setAlert] = useState<AlertData | null>(null)

    useEffect(() => {
        setVendor(release?.vendor ?? {})
    }, [release?.vendor])

    function handleClose() {
        setVendor({})
        setSelectVendor(false)
        setRelease(null)
        setAlert(null)
    }

    const handleEditRelease = async (release: Release | null) => {
        if (release === null) return
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()

            const response = await ApiUtils.PATCH(`releases/${release.id}`, release, session.user.access_token)

            if (response.status == HttpStatus.OK) {
                setAlert({
                    variant: 'success',
                    message: (
                        <>
                            <p>{t('Release updated successfully')}!</p>
                        </>
                    ),
                })
                setReloadKey(reloadKey + 1)
            } else {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            setAlert({
                variant: 'danger',
                message: (
                    <>
                        <p>{message}!</p>
                    </>
                ),
            })
        }
    }

    const updateInputField = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        release: Release,
        setRelease: Dispatch<SetStateAction<Release | null>>,
    ) => {
        if (release === null) return
        setRelease({
            ...release,
            [event.target.name]: event.target.value,
        })
    }

    const handleSetVendorData = (vendorResponse: Vendor) => {
        setVendor(vendorResponse)
        setRelease({
            ...release,
            vendorId: vendorResponse.id,
        })
    }

    return (
        <Modal
            show={release !== null}
            onHide={handleClose}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header className='header'>
                <Modal.Title>{t('Update Release')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alert && (
                    <Alert
                        variant={alert.variant}
                        id='updateRelease.message.alert'
                    >
                        {alert.message}
                    </Alert>
                )}
                {release && (
                    <>
                        <div className='row my-2'>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.cpeid'
                                    className='form-label fw-medium'
                                >
                                    {t('CPE ID')}
                                </label>
                                <input
                                    type='text'
                                    id='bulkReleaseEdit.cpeid'
                                    className='form-control'
                                    name='cpeid'
                                    placeholder={t('Enter CPE ID')}
                                    value={release.cpeid ?? ''}
                                    onChange={(e) => updateInputField(e, release, setRelease)}
                                />
                            </div>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.vendor'
                                    className='form-label fw-medium'
                                >
                                    {t('Vendor')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    placeholder={t('Click to set vendor')}
                                    readOnly
                                    id='bulkReleaseEdit.vendor'
                                    onClick={() => setSelectVendor(!selectVendor)}
                                    value={vendor.fullName ?? ''}
                                />
                                <div className='form-text'>
                                    <GiCancel
                                        onClick={() => {
                                            setVendor({})
                                            setRelease({
                                                ...release,
                                                vendorId: '',
                                            })
                                        }}
                                    />
                                </div>
                                <VendorDialog
                                    show={selectVendor}
                                    setShow={setSelectVendor}
                                    selectVendor={handleSetVendorData}
                                />
                            </div>
                        </div>
                        <div className='row my-2'>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.name'
                                    className='form-label fw-medium'
                                >
                                    {t('Release name')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='name'
                                    placeholder={t('Enter Name')}
                                    value={release.name ?? ''}
                                    id='bulkReleaseEdit.name'
                                    onChange={(e) => updateInputField(e, release, setRelease)}
                                />
                            </div>
                            <div className='col'>
                                <label
                                    htmlFor='bulkReleaseEdit.name'
                                    className='form-label fw-medium'
                                >
                                    {t('Release name')}
                                </label>
                                <input
                                    type='text'
                                    className='form-control col'
                                    name='version'
                                    placeholder={t('Enter Version')}
                                    value={release.version ?? ''}
                                    onChange={(e) => updateInputField(e, release, setRelease)}
                                />
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button
                    className='btn btn-secondary'
                    onClick={handleClose}
                >
                    {t('Cancel')}
                </button>
                <button
                    className='btn btn-primary'
                    onClick={() => void handleEditRelease(release)}
                >
                    {t('Update')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default function BulkReleaseEdit(): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()

    const [release, setRelease] = useState<Release | null>(null)
    const [reloadKey, setReloadKey] = useState(1)
    const [search, setSearch] = useState('')

    const columns = [
        {
            id: 'releases.cpeid',
            name: t('CPE ID'),
            width: '20%',
            formatter: (cpeid: string) =>
                _(
                    <input
                        type='text'
                        className='form-control'
                        value={cpeid}
                        readOnly
                    />,
                ),
            sort: true,
        },
        {
            id: 'releases.vendor',
            name: t('Vendor'),
            formatter: (fullName: string) => {
                return _(
                    <input
                        type='text'
                        className='form-control'
                        readOnly
                        value={fullName}
                    />,
                )
            },
            sort: true,
        },
        {
            id: 'releases.name',
            name: t('Release name'),
            formatter: (releaseName: string) =>
                _(
                    <input
                        type='text'
                        className='form-control'
                        value={releaseName}
                        readOnly
                    />,
                ),
            sort: true,
        },
        {
            id: 'releases.version',
            name: t('Release version'),
            formatter: (releaseVersion: string) =>
                _(
                    <input
                        type='text'
                        className='form-control'
                        value={releaseVersion}
                        readOnly
                    />,
                ),
            sort: true,
        },
        {
            id: 'releases.submit',
            name: t('Update'),
            width: '10%',
            formatter: (release: Release) =>
                _(
                    <div className='text-center'>
                        <button
                            type='button'
                            onClick={() => setRelease(release)}
                            className='btn btn-primary'
                        >
                            {t('Update')}
                        </button>
                    </div>,
                ),
            sort: false,
        },
    ]

    const initServerPaginationConfig = (session: Session) => {
        return {
            url: `${SW360_API_URL}/resource/api/releases?allDetails=true${search !== '' ? `&luceneSearch=true&name=${search}` : ''}`,
            then: (data: Embedded<Release, 'sw360:releases'>) => {
                return data._embedded['sw360:releases'].map((release: Release) => {
                    return [
                        release.cpeid ?? '',
                        release.vendor?.fullName ?? '',
                        release.name ?? '',
                        release.version ?? '',
                        release,
                    ]
                })
            },
            total: (data: Embedded<Release, 'sw360:releases'>) => (data.page ? data.page.totalElements : 0),
            headers: { Authorization: `${session.user?.access_token}` },
        }
    }

    const doSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setSearch(event.currentTarget.value)
        setReloadKey(reloadKey + 1)
    }

    return (
        <>
            <UpdateReleaseModal
                release={release}
                setRelease={setRelease}
                reloadKey={reloadKey}
                setReloadKey={setReloadKey}
            />
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2 mt-1'>
                        <QuickFilter
                            id='vendorSearch'
                            searchFunction={doSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-end ms-1'>
                            <div className='col-auto buttonheader-title'>{t('Release Bulk Edit')}</div>
                        </div>
                        {status === 'authenticated' ? (
                            <div className='ms-1'>
                                <MemoTable
                                    key={reloadKey}
                                    columns={columns}
                                    server={initServerPaginationConfig(session)}
                                    selector={true}
                                    sort={false}
                                />
                            </div>
                        ) : (
                            <div className='col-12 mt-1 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
