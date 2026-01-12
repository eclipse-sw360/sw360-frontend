// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import React, { type JSX, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { BsExclamationTriangle, BsFillTrashFill, BsQuestionCircle } from 'react-icons/bs'
import { AttachmentTypes } from '@/object-types'
import AttachmentRowData from '../AttachmentRowData'

interface Props {
    beforeUpdateAttachmentsCheckStatus: Array<string>
    setBeforeUpdateAttachmentsCheckStatus: React.Dispatch<React.SetStateAction<Array<string>>>
    setAttachmentsData: React.Dispatch<React.SetStateAction<Array<AttachmentRowData>>>
    attachmentsData: Array<AttachmentRowData>
}

function TableAttachment({
    beforeUpdateAttachmentsCheckStatus,
    setBeforeUpdateAttachmentsCheckStatus,
    attachmentsData,
    setAttachmentsData,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingAttachment, setDeletingAttachment] = useState<AttachmentRowData | undefined>(undefined)
    const [deletingAttachmentIndex, setDeletingAttachmentIndex] = useState<number | undefined>(undefined)

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target
        const list: Array<AttachmentRowData> = [
            ...attachmentsData,
        ]
        // @ts-expect-error: value is a valid
        list[index][name as keyof Attachment] = value
        setAttachmentsData(list)
    }

    const handleClickDelete = () => {
        if (deletingAttachmentIndex === undefined) {
            closeDeleteModal()
            return
        }

        const list: Array<AttachmentRowData> = [
            ...attachmentsData,
        ]
        list.splice(deletingAttachmentIndex, 1)
        setAttachmentsData(list)

        const statusList = [
            ...beforeUpdateAttachmentsCheckStatus,
        ]
        statusList.splice(deletingAttachmentIndex, 1)
        setBeforeUpdateAttachmentsCheckStatus(statusList)
        closeDeleteModal()
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingAttachment(undefined)
        setDeletingAttachmentIndex(undefined)
    }

    const openDeleteModal = (attachment: AttachmentRowData, index: number) => {
        setShowDeleteModal(true)
        setDeletingAttachment(attachment)
        setDeletingAttachmentIndex(index)
    }

    return (
        <>
            {deletingAttachmentIndex !== undefined && (
                <Modal
                    show={showDeleteModal}
                    onHide={() => closeDeleteModal()}
                    backdrop='static'
                    centered
                    size='lg'
                    dialogClassName={
                        beforeUpdateAttachmentsCheckStatus[deletingAttachmentIndex] === 'ACCEPTED'
                            ? 'modal-warning'
                            : 'modal-danger'
                    }
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            {beforeUpdateAttachmentsCheckStatus[deletingAttachmentIndex] === 'ACCEPTED' ? (
                                <>
                                    <BsExclamationTriangle size={20} />
                                    {t('Warning')}
                                </>
                            ) : (
                                <>
                                    <BsQuestionCircle size={20} /> {t('Delete Attachment')}?
                                </>
                            )}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {beforeUpdateAttachmentsCheckStatus[deletingAttachmentIndex] === 'ACCEPTED' ? (
                            <p>{t('An attachment cannot be deleted while it is approved')}.</p>
                        ) : (
                            <p className='confirm-delete-message'>
                                {t('Do you really want to delete attachment')}{' '}
                                <b>{`${deletingAttachment?.filename} (${deletingAttachment?.attachmentContentId})`}</b>?
                            </p>
                        )}
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        {beforeUpdateAttachmentsCheckStatus[deletingAttachmentIndex] === 'ACCEPTED' ? (
                            <>
                                <button
                                    type='button'
                                    data-bs-dismiss='modal'
                                    className='me-2 btn btn-light'
                                    onClick={() => closeDeleteModal()}
                                >
                                    OK
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    type='button'
                                    data-bs-dismiss='modal'
                                    className='me-2 btn btn-light'
                                    onClick={() => closeDeleteModal()}
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type='submit'
                                    className='btn btn-danger'
                                    onClick={() => handleClickDelete()}
                                >
                                    {t('Delete Attachment')}
                                </button>
                            </>
                        )}
                    </Modal.Footer>
                </Modal>
            )}
            <tbody>
                {attachmentsData.map((attachment: AttachmentRowData, index: number) => (
                    <tr
                        key={attachment.attachmentContentId}
                        id={`att-${attachment.attachmentContentId}`}
                        role='row'
                        className={`attachment-row ${attachment.isAddedNew === true ? 'new-added-attachment' : ''}`}
                    >
                        <td className='align-middle'>{attachment.filename}</td>
                        <td>
                            <div className='form-group'>
                                <select
                                    name='attachmentType'
                                    className='attachmentType toplabelledInput form-control'
                                    onChange={(e) => handleInputChange(e, index)}
                                >
                                    {Object.keys(AttachmentTypes).map((type: string) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {t(type as never)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </td>
                        <td>
                            <div className='form-group'>
                                <input
                                    type='text'
                                    className='toplabelledInput form-control'
                                    placeholder='Enter comments'
                                    name='createdComment'
                                    onChange={(e) => handleInputChange(e, index)}
                                    value={attachment.createdComment ?? ''}
                                />
                            </div>
                        </td>
                        <td className='align-middle'>
                            <span className='text-truncate'>{attachment.createdTeam ?? ''}</span>
                        </td>
                        <td className='align-middle'>
                            <span className='text-truncate'>{attachment.createdBy ?? ''}</span>
                        </td>
                        <td className='align-middle'>{attachment.createdOn ?? ''}</td>
                        <td className='checkStatus'>
                            <div className='form-group'>
                                <select
                                    name='checkStatus'
                                    className='toplabelledInput form-control'
                                    defaultValue={attachment.checkStatus}
                                    onChange={(e) => handleInputChange(e, index)}
                                >
                                    <option
                                        className='textlabel'
                                        value='NOTCHECKED'
                                    >
                                        {t('NOT_CHECKED')}
                                    </option>
                                    <option
                                        className='textlabel'
                                        value='ACCEPTED'
                                    >
                                        {t('ACCEPTED')}
                                    </option>
                                    <option
                                        className='textlabel'
                                        value='REJECTED'
                                    >
                                        {t('REJECTED')}
                                    </option>
                                </select>
                            </div>
                        </td>
                        <td className='checked-comment'>
                            <div className='form-group'>
                                <input
                                    type='text'
                                    name='checkedComment'
                                    className='check-comment form-control'
                                    placeholder='Enter comments'
                                    onChange={(e) => handleInputChange(e, index)}
                                    value={attachment.checkedComment}
                                />
                            </div>
                        </td>
                        <td className='align-middle checked-team'>
                            <span className='text-truncate'>{attachment.checkedTeam}</span>
                        </td>
                        <td className='align-middle checked-by'>
                            <span className='text-truncate'>{attachment.checkedBy}</span>
                        </td>
                        <td className='align-middle checked-on'>{attachment.checkedOn}</td>
                        <td
                            className='align-middle action delete cursor-pointer'
                            onClick={() => openDeleteModal(attachment, index)}
                        >
                            <BsFillTrashFill size={20} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </>
    )
}

export default TableAttachment
