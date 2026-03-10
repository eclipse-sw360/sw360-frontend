// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table } from 'next-sw360'
import { type ChangeEvent, type JSX, useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { BsExclamationTriangle, BsFillTrashFill, BsQuestionCircle } from 'react-icons/bs'

import UpdateCommentModal from '@/components/UpdateCommentModal/UpdateCommentModal'
import { Attachment, AttachmentTypes, Embedded } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

import AttachmentRowData from './AttachmentRowData'
import SelectAttachment from './SelectAttachment/SelectAttachment'

interface Props<T> {
    documentId: string
    documentType: string
    documentPayload: T
    setDocumentPayload: React.Dispatch<React.SetStateAction<T>>
}

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>
type CommentField = 'createdComment' | 'checkedComment'

interface CommentModalData {
    rowIndex: number
    field: CommentField
    value: string
}

function EditAttachments<T>({ documentId, documentType, documentPayload, setDocumentPayload }: Props<T>): JSX.Element {
    const t = useTranslations('default')
    const [attachmentsData, setAttachmentsData] = useState<Array<AttachmentRowData>>([])
    const [beforeUpdateAttachmentsCheckStatus, setBeforeUpdateAttachmentsCheckStatus] = useState<Array<string>>([])
    const [dialogOpenSelectAttachment, setDialogOpenSelectAttachment] = useState(false)
    const [commentModalData, setCommentModalData] = useState<CommentModalData | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingAttachment, setDeletingAttachment] = useState<AttachmentRowData | undefined>(undefined)
    const [deletingAttachmentIndex, setDeletingAttachmentIndex] = useState<number | undefined>(undefined)
    const handleClickSelectAttachment = useCallback(() => setDialogOpenSelectAttachment(true), [])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === StatusCodes.OK) {
            const data = (await response.json()) as EmbeddedAttachments
            return data
        } else if (response.status === StatusCodes.UNAUTHORIZED) {
            return signOut()
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        fetchData(`${documentType}/${documentId}/attachments`)
            .then((attachments: EmbeddedAttachments | undefined) => {
                if (attachments === undefined) return
                if (
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']) &&
                    !CommonUtils.isNullOrUndefined(attachments['_embedded']['sw360:attachments'])
                ) {
                    const attachmentDetails: Array<Attachment> = []
                    attachments['_embedded']['sw360:attachments'].map((item: Attachment) => {
                        attachmentDetails.push(item)
                    })
                    const existingAttachmentsRowData: Array<AttachmentRowData> = attachmentDetails.map(
                        (attachment) => ({
                            attachmentContentId: CommonUtils.getIdFromUrl(attachment._links?.self.href),
                            filename: attachment.filename,
                            attachmentType: attachment.attachmentType,
                            createdBy: attachment.createdBy,
                            createdTeam: attachment.createdTeam,
                            createdComment: attachment.createdComment,
                            createdOn: attachment.createdOn,
                            checkedTeam: attachment.checkedTeam,
                            checkedComment: attachment.checkedComment,
                            checkedOn: attachment.checkedOn,
                            checkStatus: attachment.checkStatus,
                            checkedBy: attachment.checkedBy,
                            isAddedNew: false,
                        }),
                    )
                    const beforeUpdateAttachmentsCheckStatus = attachmentDetails.map(
                        (attachment) => attachment.checkStatus ?? 'NOTCHECKED',
                    )
                    setBeforeUpdateAttachmentsCheckStatus(beforeUpdateAttachmentsCheckStatus)
                    setAttachmentsData(existingAttachmentsRowData)
                }
            })
            .catch((err) => console.error(err))
    }, [])

    useEffect(() => {
        const attachmentsToSave: Array<Attachment> = attachmentsData.map((attachment) => ({
            attachmentContentId: attachment.attachmentContentId,
            filename: attachment.filename,
            attachmentType: attachment.attachmentType,
            createdBy: attachment.createdBy,
            createdTeam: attachment.createdTeam,
            createdComment: attachment.createdComment,
            createdOn: attachment.createdOn,
            checkedTeam: attachment.checkedTeam,
            checkedComment: attachment.checkedComment,
            checkedOn: attachment.checkedOn,
            checkStatus: attachment.checkStatus,
            checkedBy: attachment.checkedBy,
        }))
        setDocumentPayload({
            ...documentPayload,
            attachments: attachmentsToSave,
        })
    }, [
        attachmentsData,
    ])

    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
            const { name, value } = e.target
            const list: Array<AttachmentRowData> = [
                ...attachmentsData,
            ]
            // @ts-expect-error: value is a valid
            list[index][name as keyof Attachment] = value
            setAttachmentsData(list)
        },
        [
            attachmentsData,
        ],
    )

    const closeDeleteModal = useCallback(() => {
        setShowDeleteModal(false)
        setDeletingAttachment(undefined)
        setDeletingAttachmentIndex(undefined)
    }, [])

    const handleClickDelete = useCallback(() => {
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
    }, [
        attachmentsData,
        beforeUpdateAttachmentsCheckStatus,
        closeDeleteModal,
        deletingAttachmentIndex,
    ])

    const openDeleteModal = useCallback((attachment: AttachmentRowData, index: number) => {
        setShowDeleteModal(true)
        setDeletingAttachment(attachment)
        setDeletingAttachmentIndex(index)
    }, [])

    const closeCommentModal = useCallback(() => {
        setCommentModalData(null)
    }, [])

    const handleUpdateComment = useCallback(
        (value: string) => {
            if (commentModalData === null) {
                closeCommentModal()
                return
            }

            setAttachmentsData((prev) => {
                if (!prev[commentModalData.rowIndex]) return prev
                const next = [
                    ...prev,
                ]
                next[commentModalData.rowIndex] = {
                    ...next[commentModalData.rowIndex],
                    [commentModalData.field]: value,
                }
                return next
            })
            closeCommentModal()
        },
        [
            closeCommentModal,
            commentModalData,
        ],
    )

    const columns = useMemo<ColumnDef<AttachmentRowData>[]>(
        () => [
            {
                id: 'attachments',
                header: t('Attachments'),
                columns: [
                    {
                        id: 'filename',
                        header: t('File name'),
                        meta: {
                            cellClassName: 'align-middle',
                        },
                        cell: ({ row }) => row.original.filename,
                    },
                    {
                        id: 'attachmentType',
                        header: t('Type'),
                        cell: ({ row }) => (
                            <div className='form-group'>
                                <select
                                    name='attachmentType'
                                    className='form-control'
                                    value={row.original.attachmentType ?? ''}
                                    onChange={(e) => handleInputChange(e, row.index)}
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
                        ),
                    },
                    {
                        id: 'upload',
                        header: t('Upload'),
                        columns: [
                            {
                                id: 'createdComment',
                                header: t('Comment'),
                                cell: ({ row }) => (
                                    <div className='form-group'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            placeholder='Enter comments'
                                            name='createdComment'
                                            value={row.original.createdComment ?? ''}
                                            onClick={() =>
                                                setCommentModalData({
                                                    rowIndex: row.index,
                                                    field: 'createdComment',
                                                    value: row.original.createdComment ?? '',
                                                })
                                            }
                                            readOnly
                                        />
                                    </div>
                                ),
                            },
                            {
                                id: 'createdTeam',
                                header: t('Group'),
                                meta: {
                                    cellClassName: 'align-middle',
                                },
                                cell: ({ row }) => (
                                    <span className='text-truncate'>{row.original.createdTeam ?? ''}</span>
                                ),
                            },
                            {
                                id: 'createdBy',
                                header: t('Name'),
                                meta: {
                                    cellClassName: 'align-middle',
                                },
                                cell: ({ row }) => (
                                    <span className='text-truncate'>{row.original.createdBy ?? ''}</span>
                                ),
                            },
                            {
                                id: 'createdOn',
                                header: t('Date'),
                                meta: {
                                    cellClassName: 'align-middle',
                                },
                                cell: ({ row }) => row.original.createdOn ?? '',
                            },
                        ],
                    },
                    {
                        id: 'approval',
                        header: t('Approval'),
                        columns: [
                            {
                                id: 'checkStatus',
                                header: t('Status'),
                                meta: {
                                    cellClassName: 'checkStatus',
                                },
                                cell: ({ row }) => (
                                    <div className='form-group'>
                                        <select
                                            name='checkStatus'
                                            className='form-control'
                                            defaultValue={row.original.checkStatus}
                                            onChange={(e) => handleInputChange(e, row.index)}
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
                                ),
                            },
                            {
                                id: 'checkedComment',
                                header: t('Comment'),
                                meta: {
                                    cellClassName: 'checked-comment',
                                },
                                cell: ({ row }) => (
                                    <div className='form-group'>
                                        <input
                                            type='text'
                                            name='checkedComment'
                                            className='check-comment form-control'
                                            placeholder='Enter comments'
                                            value={row.original.checkedComment ?? ''}
                                            onClick={() =>
                                                setCommentModalData({
                                                    rowIndex: row.index,
                                                    field: 'checkedComment',
                                                    value: row.original.checkedComment ?? '',
                                                })
                                            }
                                            readOnly
                                        />
                                    </div>
                                ),
                            },
                            {
                                id: 'checkedTeam',
                                header: t('Group'),
                                meta: {
                                    cellClassName: 'align-middle checked-team',
                                },
                                cell: ({ row }) => (
                                    <span className='text-truncate'>{row.original.checkedTeam ?? ''}</span>
                                ),
                            },
                            {
                                id: 'checkedBy',
                                header: t('Name'),
                                meta: {
                                    cellClassName: 'align-middle checked-by',
                                },
                                cell: ({ row }) => (
                                    <span className='text-truncate'>{row.original.checkedBy ?? ''}</span>
                                ),
                            },
                            {
                                id: 'checkedOn',
                                header: t('Date'),
                                meta: {
                                    cellClassName: 'align-middle checked-on',
                                },
                                cell: ({ row }) => row.original.checkedOn ?? '',
                            },
                        ],
                    },
                    {
                        id: 'actions',
                        header: '',
                        meta: {
                            cellClassName: 'align-middle action delete cursor-pointer',
                        },
                        cell: ({ row }) => (
                            <span
                                role='button'
                                onClick={() => openDeleteModal(row.original, row.index)}
                            >
                                <BsFillTrashFill size={20} />
                            </span>
                        ),
                    },
                ],
            },
        ],
        [
            handleInputChange,
            openDeleteModal,
            t,
        ],
    )

    const table = useReactTable({
        data: attachmentsData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row, index) => `att-${row.attachmentContentId ?? `row-${index}`}`,
    })

    table.getRowModel().rows.forEach((row) => {
        row.meta = {
            ...row.meta,
            rowClassName: `attachment-row${row.original.isAddedNew === true ? ' new-added-attachment' : ''}`,
            rowId: row.id,
        }
    })

    return (
        <>
            <SelectAttachment
                attachmentsData={attachmentsData}
                setAttachmentsData={setAttachmentsData}
                show={dialogOpenSelectAttachment}
                setShow={setDialogOpenSelectAttachment}
            />
            <UpdateCommentModal
                show={commentModalData !== null}
                title={t('Enter comments')}
                initialValue={commentModalData?.value ?? ''}
                placeholder={t('Enter comments')}
                onClose={closeCommentModal}
                onUpdate={handleUpdateComment}
            />
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
            <div className='col mb-3'>
                <SW360Table
                    table={table}
                    showProcessing={false}
                    tableClassName='table col'
                    useDefaultTableClasses={false}
                    showNoRecordsFoundMessage={false}
                    useDefaultWrapperClass={false}
                />
            </div>
            <div className='mb-3'>
                <button
                    type='button'
                    onClick={handleClickSelectAttachment}
                    className={`fw-bold btn btn-secondary`}
                >
                    {t('Add Attachment')}
                </button>
            </div>
        </>
    )
}

export default EditAttachments
