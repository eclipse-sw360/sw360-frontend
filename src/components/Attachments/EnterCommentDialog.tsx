// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Session } from '@/object-types/Session'
import { notFound } from 'next/navigation'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import React, { useCallback, useEffect, useState } from 'react'
import CommonUtils from '@/utils/common.utils'
import { VendorType } from '@/object-types/VendorType'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    session: Session
}

const EnterCommentDialog = ({ show, setShow, session }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const handleCloseDialog = () => {
        setShow(!show)
    }



    // const fetchData: any = useCallback(async (url: string) => {
    //     const response = await ApiUtils.GET(url, session.user.access_token)
    //     if (response.status == HttpStatus.OK) {
    //         const data = await response.json()
    //         return data
    //     } else {
    //         notFound()
    //     }
    // }, [])

    // useEffect(() => {
    //     fetchData(`vendors`).then((vendors: any) => {
    //         if (
    //             !CommonUtils.isNullOrUndefined(vendors['_embedded']) &&
    //             !CommonUtils.isNullOrUndefined(vendors['_embedded']['sw360:vendors'])
    //         ) {
    //             const data = vendors['_embedded']['sw360:vendors'].map((item: any) => [
    //                 item,
    //                 item.fullName,
    //                 item.shortName,
    //                 item.url,
    //                 '',
    //             ])
    //             setData(data)
    //         }
    //     })
    // }, [])

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Update create comment')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Update create comment')}
                            aria-describedby=''
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
                    {t('Cancel')}
                </Button>
                <Button
                    type='button'
                    className={`fw-bold btn btn-light button-orange`}
                >
                    {t('Update')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EnterCommentDialog
