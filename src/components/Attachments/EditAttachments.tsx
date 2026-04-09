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
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, type JSX, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { BsExclamationTriangle, BsFillTrashFill, BsQuestionCircle } from 'react-icons/bs'
import { SW360Table, UpdateCommentModal } from '@/components/sw360'
import { Attachment, AttachmentTypes, Embedded, ErrorDetails, UpdateCommentModalMetadata } from '@/object-types'
import { ApiError, ApiUtils, CommonUtils } from '@/utils'
import SelectAttachment from './SelectAttachment/SelectAttachment'

interface Props<T> {
    documentId: string
    documentType: string
    documentPayload: T
    setDocumentPayload: React.Dispatch<React.SetStateAction<T>>
}

type EmbeddedAttachments = Embedded<Attachment, 'sw360:attachments'>

const DeleteAttachmentModal = ({
    deletingAttachment,
    attachmentsData,
    setAttachmentsData,
    setDeletingAttachment,
    beforeUpdateAttachmentsCheckStatus,
    setBeforeUpdateAttachmentsCheckStatus,
}: {
    deletingAttachment: Attachment | undefined
    attachmentsData: Attachment[]
    setAttachmentsData: Dispatch<SetStateAction<Attachment[]>>
    setDeletingAttachment: Dispatch<SetStateAction<Attachment | undefined>>
    beforeUpdateAttachmentsCheckStatus: {
        [k: string]: string
    }
    setBeforeUpdateAttachmentsCheckStatus: Dispatch<
        SetStateAction<{
            [k: string]: string
        }>
    >
}) => {
    const t = useTranslations('default')

    const handleClickDelete = () => {
        if (CommonUtils.isNullOrUndefined(deletingAttachment)) return
        const atts = attachmentsData.filter(
            (att) => att.attachmentContentId !== (deletingAttachment.attachmentContentId ?? ''),
        )
        setAttachmentsData(atts)

        const statuses = {
            ...beforeUpdateAttachmentsCheckStatus,
        }
        delete statuses[deletingAttachment.attachmentContentId ?? '']
        setBeforeUpdateAttachmentsCheckStatus(statuses)
        setDeletingAttachment(undefined)
    }

    return (
        <Modal
            show={deletingAttachment !== undefined}
            onHide={() => setDeletingAttachment(undefined)}
            backdrop='static'
            centered
            size='lg'
            dialogClassName={
                beforeUpdateAttachmentsCheckStatus[deletingAttachment?.attachmentContentId ?? ''] === 'ACCEPTED'
                    ? 'modal-warning'
                    : 'modal-danger'
            }
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {beforeUpdateAttachmentsCheckStatus[deletingAttachment?.attachmentContentId ?? ''] ===
                    'ACCEPTED' ? (
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
                {beforeUpdateAttachmentsCheckStatus[deletingAttachment?.attachmentContentId ?? ''] === 'ACCEPTED' ? (
                    <p>{t('An attachment cannot be deleted while it is approved')}.</p>
                ) : (
                    <p className='confirm-delete-message'>
                        {t('Do you really want to delete attachment')}{' '}
                        <b>{`${deletingAttachment?.filename} (${deletingAttachment?.attachmentContentId})`}</b>?
                    </p>
                )}
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                {beforeUpdateAttachmentsCheckStatus[deletingAttachment?.attachmentContentId ?? ''] === 'ACCEPTED' ? (
                    <>
                        <button
                            type='button'
                            data-bs-dismiss='modal'
                            className='me-2 btn btn-light'
                            onClick={() => setDeletingAttachment(undefined)}
                        >
                            {t('OK')}
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type='button'
                            data-bs-dismiss='modal'
                            className='me-2 btn btn-light'
                            onClick={() => setDeletingAttachment(undefined)}
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
    )
}

function EditAttachments<T>({ documentId, documentType, documentPayload, setDocumentPayload }: Props<T>): JSX.Element {
    const t = useTranslations('default')
    const [beforeUpdateAttachmentsCheckStatus, setBeforeUpdateAttachmentsCheckStatus] = useState<{
        [k: string]: string
    }>({})
    const [dialogOpenSelectAttachment, setDialogOpenSelectAttachment] = useState(false)
    const handleClickSelectAttachment = useCallback(() => setDialogOpenSelectAttachment(true), [])
    const session = useSession()
    const [updateCommentModalData, setUpdateCommentModalData] = useState<UpdateCommentModalMetadata | null>(null)

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    const [attachmentsData, setAttachmentsData] = useState<Attachment[]>(() => [])
    const memoizedData = useMemo(
        () => attachmentsData,
        [
            attachmentsData,
        ],
    )
    const [showProcessing, setShowProcessing] = useState(false)
    const [deletingAttachment, setDeletingAttachment] = useState<Attachment | undefined>(undefined)

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, id: string) => {
            setAttachmentsData((prev) => {
                const { name, value } = e.target
                const newList: Attachment[] = []
                for (const att of prev) {
                    if (att.attachmentContentId === id) {
                        const _att = {
                            ...att,
                        }
                        // @ts-expect-error: value is a valid
                        _att[name as keyof Attachment] = value
                        newList.push(_att)
                    } else {
                        newList.push(att)
                    }
                }
                return newList
            })
        },
        [
            setAttachmentsData,
        ],
    )

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = attachmentsData.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return
                const response = await ApiUtils.GET(
                    `${documentType}/${documentId}/attachments`,
                    session.data.user.access_token,
                    signal,
                )
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new ApiError(err.message, {
                        status: response.status,
                    })
                }

                const data = (await response.json()) as EmbeddedAttachments
                setAttachmentsData(
                    CommonUtils.isNullOrUndefined(data['_embedded']?.['sw360:attachments'])
                        ? []
                        : data['_embedded']['sw360:attachments'],
                )

                const status: {
                    [k: string]: string
                } = {}
                for (const att of data['_embedded']?.['sw360:attachments'] ?? []) {
                    if (!CommonUtils.isNullEmptyOrUndefinedString(att.attachmentContentId)) {
                        status[att.attachmentContentId] = att.checkStatus ?? 'NOT_CHECKED'
                    }
                }
                setBeforeUpdateAttachmentsCheckStatus(status)
            } catch (error) {
                ApiUtils.reportError(error)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
    ])

    useEffect(() => {
        setDocumentPayload({
            ...documentPayload,
            attachments: attachmentsData,
        })
    }, [
        attachmentsData,
    ])

    const columns = useMemo<ColumnDef<Attachment>[]>(
        () => [
            {
                id: 'attachments',
                header: t('Attachments'),
                columns: [
                    {
                        id: 'filename',
                        header: t('File name'),
                        cell: ({ row }) => row.original.filename,
                        meta: {
                            width: '20%',
                        },
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
                                    onChange={(e) => handleInputChange(e, row.original.attachmentContentId ?? '')}
                                >
                                    {Object.keys(AttachmentTypes).map((type: string) => (
                                        <option
                                            key={type}
                                            value={type}
                                        >
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ),
                        meta: {
                            width: '10%',
                        },
                    },
                    {
                        id: 'upload',
                        header: t('Upload'),
                        columns: [
                            {
                                id: 'createdComment',
                                header: t('Comment'),
                                cell: ({ row }) => (
                                    <input
                                        type='text'
                                        className='form-control'
                                        placeholder='Enter comments'
                                        name='createdComment'
                                        value={row.original.createdComment ?? ''}
                                        onClick={() =>
                                            setUpdateCommentModalData({
                                                id: `createdComment:${row.original.attachmentContentId ?? ''}`,
                                                initialCommentValue: row.original.createdComment ?? '',
                                            })
                                        }
                                        readOnly
                                    />
                                ),
                                meta: {
                                    width: '12.5%',
                                },
                            },
                            {
                                id: 'createdTeam',
                                header: t('Group'),
                                cell: ({ row }) => <>{row.original.createdTeam ?? ''}</>,
                                meta: {
                                    width: '5%',
                                },
                            },
                            {
                                id: 'createdBy',
                                header: t('Name'),
                                cell: ({ row }) => <>{row.original.createdBy ?? ''}</>,
                                meta: {
                                    width: '5%',
                                },
                            },
                            {
                                id: 'createdOn',
                                header: t('Date'),
                                cell: ({ row }) => <>{row.original.createdOn ?? ''}</>,
                                meta: {
                                    width: '5%',
                                },
                            },
                        ],
                        meta: {
                            width: '27.5%',
                        },
                    },
                    {
                        id: 'approval',
                        header: t('Approval'),
                        columns: [
                            {
                                id: 'checkStatus',
                                header: t('Status'),
                                cell: ({ row }) => (
                                    <div className='form-group'>
                                        <select
                                            name='checkStatus'
                                            className='form-control'
                                            value={row.original.checkStatus}
                                            onChange={(e) =>
                                                handleInputChange(e, row.original.attachmentContentId ?? '')
                                            }
                                        >
                                            <option
                                                className='textlabel'
                                                value='NOT_CHECKED'
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
                                meta: {
                                    width: '10%',
                                },
                            },
                            {
                                id: 'checkedComment',
                                header: t('Comment'),
                                cell: ({ row }) => (
                                    <div className='form-group'>
                                        <input
                                            type='text'
                                            name='checkedComment'
                                            className='form-control'
                                            placeholder='Enter comments'
                                            value={row.original.checkedComment ?? ''}
                                            onClick={() =>
                                                setUpdateCommentModalData({
                                                    id: `checkedComment:${row.original.attachmentContentId ?? ''}`,
                                                    initialCommentValue: row.original.checkedComment ?? '',
                                                })
                                            }
                                            readOnly
                                        />
                                    </div>
                                ),
                                meta: {
                                    width: '12.5%',
                                },
                            },
                            {
                                id: 'checkedTeam',
                                header: t('Group'),
                                cell: ({ row }) => <>{row.original.checkedTeam ?? ''}</>,
                                meta: {
                                    width: '5%',
                                },
                            },
                            {
                                id: 'checkedBy',
                                header: t('Name'),
                                cell: ({ row }) => <>{row.original.checkedBy ?? ''}</>,
                                meta: {
                                    width: '5%',
                                },
                            },
                            {
                                id: 'checkedOn',
                                header: t('Date'),
                                cell: ({ row }) => <>{row.original.checkedOn ?? ''}</>,
                                meta: {
                                    width: '5%',
                                },
                            },
                        ],
                        meta: {
                            width: '37.5%',
                        },
                    },
                    {
                        id: 'actions',
                        header: '',
                        cell: ({ row }) => (
                            <span
                                role='button'
                                onClick={() => setDeletingAttachment(row.original)}
                            >
                                <BsFillTrashFill size={20} />
                            </span>
                        ),
                    },
                ],
            },
        ],
        [
            t,
            handleInputChange,
        ],
    )

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <UpdateCommentModal
                modalMetaData={updateCommentModalData}
                setModalMetaData={setUpdateCommentModalData}
                setCommentInPayload={(comment: string) => {
                    if (updateCommentModalData) {
                        setAttachmentsData((prev) => {
                            const [field, id] = updateCommentModalData.id.split(':')
                            const newList: Attachment[] = []
                            for (const att of prev) {
                                if (att.attachmentContentId === id) {
                                    const _att = {
                                        ...att,
                                    }
                                    // @ts-expect-error: value is a valid
                                    _att[field as keyof Attachment] = comment
                                    newList.push(_att)
                                } else {
                                    newList.push(att)
                                }
                            }
                            return newList
                        })
                    }
                }}
            />
            <DeleteAttachmentModal
                deletingAttachment={deletingAttachment}
                attachmentsData={attachmentsData}
                setAttachmentsData={setAttachmentsData}
                setDeletingAttachment={setDeletingAttachment}
                beforeUpdateAttachmentsCheckStatus={beforeUpdateAttachmentsCheckStatus}
                setBeforeUpdateAttachmentsCheckStatus={setBeforeUpdateAttachmentsCheckStatus}
            />
            <SelectAttachment
                attachmentsData={attachmentsData}
                setAttachmentsData={setAttachmentsData}
                show={dialogOpenSelectAttachment}
                setShow={setDialogOpenSelectAttachment}
            />
            <div className='col mb-3'>
                <SW360Table
                    table={table}
                    showProcessing={showProcessing}
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
