// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { useRef, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'

import { Attachment, ComponentPayload, DocumentTypes, Release } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'
import styles from './SelectAttachment.module.css'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    attachmentUpload: Array<Attachment>
    setAttachmentFromUpload: React.Dispatch<React.SetStateAction<Array<Attachment>>>
    onReRender: () => void
    componentPayload?: ComponentPayload
    setComponentPayload?: React.Dispatch<React.SetStateAction<ComponentPayload>>
    documentType?: string
    releasePayload?: Release
    setReleasePayload?: React.Dispatch<React.SetStateAction<Release>>
}

function SelectAttachment({
    show,
    setShow,
    attachmentUpload,
    setAttachmentFromUpload,
    onReRender,
    componentPayload,
    setComponentPayload,
    releasePayload,
    setReleasePayload,
    documentType,
}: Props) {
    const t = useTranslations('default')
    const { data: session } = useSession()
    const [files, setFiles] = useState([])
    const inputRef = useRef(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.prototype.slice.call(e.target.files)
        setFiles(files)
    }

    const handleButtonClick = () => {
        inputRef.current?.click()
    }
    const handleCloseDialog = () => {
        setShow(!show)
    }

    const handleUploadFiles = async () => {
        if (!files) {
            return
        }
        const formData = new FormData()

        for (const iterator of files) {
            formData.append('files', iterator)
        }

        const url = SW360_API_URL + '/resource/api/attachments'
        fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `${session.user.access_token}`,
            },
        })
            .then((res) => res.json())
            .then((json) => {
                json.map((item: Attachment) => attachmentUpload.push(item))
                setAttachmentFromUpload(attachmentUpload)
                if (documentType === DocumentTypes.COMPONENT) {
                    setComponentPayload({
                        ...componentPayload,
                        attachmentDTOs: attachmentUpload,
                    })
                } else {
                    setReleasePayload({
                        ...releasePayload,
                        attachmentDTOs: attachmentUpload,
                    })
                }
                onReRender()
            })
        setShow(!show)
    }

    const handleRemoveClick = (index: number) => {
        const list = [...files]
        list.splice(index, 1)
        setFiles(list)
    }

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Upload Attachment')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className={`${styles['modal-body-first']}`}>
                        <div className={`${styles['modal-body-second']}`}>
                            <span>Drop a File Here</span>
                            <br />
                            Or
                            <br />
                            <input
                                className={`${styles['input']}`}
                                ref={inputRef}
                                type='file'
                                placeholder={t('Upload Attachment')}
                                multiple
                                onChange={handleFileChange}
                            />
                            <button className={`${styles['button-browse']}`} onClick={handleButtonClick}>
                                Browse
                            </button>
                        </div>
                    </div>
                </div>
                <br />
                <br />
                <div style={{}}>
                    {files.map((file, j) => (
                        <>
                            <div key={file.name} className={`${styles['div-list-file']}`}>
                                <div className={`${styles['div-filename']}`}>
                                    {file.name} ({file.size}b)
                                </div>
                                <div className={`${styles['button-delete']}`}>
                                    <Button onClick={() => handleRemoveClick(j)}>Delete</Button>
                                </div>
                            </div>
                            <br />
                            <br />
                        </>
                    ))}
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
