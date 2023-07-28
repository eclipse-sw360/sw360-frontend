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
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import AttachmentDetail from '@/object-types/AttachmentDetail'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    session: Session
    attachmentUpload: any
    setAttachmentFromUpload: any
    onReRender: () => void
}

const SelectAttachment = ({ show, setShow, session, attachmentUpload, setAttachmentFromUpload, onReRender }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [files, setFiles] = useState(null)

    const handleCloseDialog = () => {
        setShow(!show)
    }
    const handleInputFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(event.target.files)
    }

    const handleUploadFiles = async () => {
        if (!files) {
            return
        }
        const formData = new FormData()
        for (const key of Object.keys(files)) {
            formData.append('files', files[key])
        }

        fetch('http://10.116.43.147:8080/resource/api/attachments', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${session.user.access_token}`,
            },
        })
            .then((res) => res.json())
            .then((json) => {
                json.map((item: AttachmentDetail) => attachmentUpload.push(item))
                setAttachmentFromUpload(attachmentUpload)
                onReRender()
            })
        setShow(!show)
    }

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Upload Attachment')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='lfr-dynamic-uploader'>
                            <div className='lfr-upload-container'>
                                <div id='fileupload-drop' className='upload-target'>
                                    <span>Drpo a file here</span>
                                    <br />
                                    or
                                    <br />
                                    <input type='file' multiple onChange={handleInputFiles} />
                                    {/* <button id="fileupload-browse" type="button" className="btn btn-secondary">Browser</button> */}
                                </div>
                            </div>
                        </div>
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
                <Button type='button' className={`fw-bold btn btn-light button-plain me-2`}>
                    {t('Pause')}
                </Button>
                <Button type='button' className={`fw-bold btn btn-light button-orange`} onClick={handleUploadFiles}>
                    {t('Upload')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SelectAttachment
