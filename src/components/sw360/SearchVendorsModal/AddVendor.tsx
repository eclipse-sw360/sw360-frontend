// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, Vendor } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { useState, type JSX } from 'react'
import { Modal } from 'react-bootstrap'

interface AlertData {
    variant: string
    message: JSX.Element
}

enum AddVendorState {
    ADD_NEW_VENDOR = 'add_new_vendor',
    VENDOR_ADDED = 'vendor_added',
    ADD_NEW_VENDOR_REQUEST_PENDING = 'add_new_vendor_request_pending',
}

const AddVendorDialog = ({
    show,
    setShow,
}: {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element => {
    const t = useTranslations('default')
    const [vendor, setVendor] = useState<Vendor>({
        fullName: '',
        shortName: '',
        url: '',
    })
    const [alert, setAlert] = useState<AlertData | null>(null)
    const [state, setState] = useState<AddVendorState>(AddVendorState.ADD_NEW_VENDOR)

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setVendor((prev: Vendor) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async () => {
        try {
            setState(AddVendorState.ADD_NEW_VENDOR_REQUEST_PENDING)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                setState(AddVendorState.ADD_NEW_VENDOR)
                return
            }
            const payload: Vendor = {
                fullName: vendor.fullName,
                shortName: vendor.shortName,
                url: vendor.url,
            }
            const response = await ApiUtils.POST('vendors', payload, session.user.access_token)
            if (response.status == HttpStatus.CREATED) {
                setAlert({
                    variant: 'success',
                    message: (
                        <>
                            <p>{t('Vendor is created')}</p>
                        </>
                    ),
                })
                setState(AddVendorState.VENDOR_ADDED)
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                MessageService.error(t('Session has expired'))
                setState(AddVendorState.ADD_NEW_VENDOR)
                return signOut()
            } else if (response.status === HttpStatus.CONFLICT) {
                setAlert({
                    variant: 'danger',
                    message: (
                        <>
                            <p>{t('A vendor with same name already exists')}</p>
                        </>
                    ),
                })
                setState(AddVendorState.ADD_NEW_VENDOR)
            } else {
                setAlert({
                    variant: 'danger',
                    message: (
                        <>
                            <p>{t('Something went wrong')}</p>
                        </>
                    ),
                })
                setState(AddVendorState.ADD_NEW_VENDOR)
            }
        } catch (e) {
            console.error(e)
            setState(AddVendorState.ADD_NEW_VENDOR)
        }
    }

    return (
        <Modal
            show={show}
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Create new Vendor')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {alert && (
                    <div
                        className={`alert alert-${alert.variant}`}
                        role='alert'
                    >
                        {alert.message}
                    </div>
                )}
                <div className='row mx-1'>
                    <h6 className='header pb-2 px-2'>{t('Add Vendor')}</h6>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='vendor.fullName'
                            className='form-label fw-medium'
                        >
                            {t('Full Name')}{' '}
                            <span
                                className='text-red'
                                style={{ color: '#F7941E' }}
                            >
                                *
                            </span>
                        </label>
                        <input
                            type='text'
                            name='fullName'
                            value={vendor.fullName}
                            onChange={handleChange}
                            className='form-control'
                            id='vendor.fullName'
                            placeholder={t('Enter vendor full name')}
                            disabled={
                                state === AddVendorState.VENDOR_ADDED ||
                                state === AddVendorState.ADD_NEW_VENDOR_REQUEST_PENDING
                            }
                            required
                        />
                    </div>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='vendor.shortName'
                            className='form-label fw-medium'
                        >
                            {t('Short Name')}{' '}
                            <span
                                className='text-red'
                                style={{ color: '#F7941E' }}
                            >
                                *
                            </span>
                        </label>
                        <input
                            type='text'
                            name='shortName'
                            value={vendor.shortName}
                            onChange={handleChange}
                            className='form-control'
                            id='vendor.shortName'
                            placeholder={t('Enter vendor short name')}
                            disabled={
                                state === AddVendorState.VENDOR_ADDED ||
                                state === AddVendorState.ADD_NEW_VENDOR_REQUEST_PENDING
                            }
                            required
                        />
                    </div>
                    <div className='col-lg-4'>
                        <label
                            htmlFor='vendor.url'
                            className='form-label fw-medium'
                        >
                            {t('URL')}{' '}
                            <span
                                className='text-red'
                                style={{ color: '#F7941E' }}
                            >
                                *
                            </span>
                        </label>
                        <input
                            type='url'
                            name='url'
                            value={vendor.url}
                            onChange={handleChange}
                            className='form-control'
                            id='vendor.url'
                            placeholder={t('Enter vendor url')}
                            disabled={
                                state === AddVendorState.VENDOR_ADDED ||
                                state === AddVendorState.ADD_NEW_VENDOR_REQUEST_PENDING
                            }
                            required
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button
                    type='button'
                    className='fw-bold btn btn-dark me-2'
                    onClick={() => {
                        setShow(!show)
                        setAlert(null)
                        setVendor({
                            fullName: '',
                            shortName: '',
                            url: '',
                        })
                        setState(AddVendorState.ADD_NEW_VENDOR)
                    }}
                >
                    {t('Close')}
                </button>
                <button
                    type='button'
                    className='fw-bold btn btn-primary me-2'
                    onClick={() => void handleSubmit()}
                    disabled={
                        state === AddVendorState.VENDOR_ADDED || state === AddVendorState.ADD_NEW_VENDOR_REQUEST_PENDING
                    }
                >
                    {t('Add Vendor')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddVendorDialog
