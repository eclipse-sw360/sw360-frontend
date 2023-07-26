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
import React from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    checkedComment: any
    setCheckedComment: any
}

const EnterCheckedCommentDialog = ({ show, setShow, checkedComment, setCheckedComment }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const handleCloseDialog = () => {
        setShow(!show)
    }

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
                            onChange={(e) => {
                                setCheckedComment(e.target.value)
                            }}
                            value={checkedComment}
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
                <Button type='button' className={`fw-bold btn btn-light button-orange`}>
                    {t('Update')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EnterCheckedCommentDialog
