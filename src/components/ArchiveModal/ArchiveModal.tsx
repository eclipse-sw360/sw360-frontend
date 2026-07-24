// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0

'use client'

import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useState } from 'react'
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap'
import { BsExclamationTriangle } from 'react-icons/bs'

import { ArchivalEntityType, ArchivePreview, ArchivePreviewAction } from '@/object-types'
import ArchivalService from '@/services/archival.service'
import { CommonUtils } from '@/utils'

interface Props {
    entityType: ArchivalEntityType
    entityIds: string[]
    entityLabel?: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onArchived?: () => void
}

const ACTION_VARIANT: Record<ArchivePreviewAction, string> = {
    ARCHIVE: 'danger',
    KEEP_ALIVE: 'warning',
    BLOCKED: 'secondary',
}

function ArchiveModal({ entityType, entityIds, entityLabel, show, setShow, onArchived }: Props): JSX.Element {
    const t = useTranslations('default')
    const { status } = useSession()

    const [comment, setComment] = useState('')
    const [includeAttachments, setIncludeAttachments] = useState(true)
    const [includeChangelogs, setIncludeChangelogs] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [preview, setPreview] = useState<ArchivePreview | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState<string | null>(null)

    const heading =
        entityIds.length === 1
            ? t('Archive {entity}', {
                  entity: entityLabel ?? entityType.toLowerCase(),
              })
            : t('Archive {count} {entity}', {
                  count: entityIds.length,
                  entity: entityType.toLowerCase() + 's',
              })

    // Fetch the pre-archival plan whenever the modal opens.
    useEffect(() => {
        if (!show) return
        let cancelled = false
        setPreview(null)
        setPreviewError(null)
        setPreviewLoading(true)
        ;(async () => {
            try {
                const session = await getSession()
                if (!session) return
                const result = await ArchivalService.preview(
                    {
                        entityType,
                        entityIds,
                        comment: '',
                        includeAttachments,
                        includeChangelogs,
                    },
                    session.user.access_token,
                )
                if (!cancelled) setPreview(result)
            } catch (e) {
                if (!cancelled) setPreviewError(e instanceof Error ? e.message : String(e))
            } finally {
                if (!cancelled) setPreviewLoading(false)
            }
        })()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        show,
    ])

    const close = () => {
        if (busy) return
        setError(null)
        setShow(false)
    }

    const hasBlocked = (preview?.blockedCount ?? 0) > 0

    const handleArchive = async () => {
        if (CommonUtils.isNullEmptyOrUndefinedString(comment.trim())) {
            setError(t('Please add a comment describing why this is being archived'))
            return
        }

        setBusy(true)
        setError(null)
        try {
            if (status === 'unauthenticated') {
                signOut()
                return
            }
            const session = await getSession()
            if (!session) {
                signOut()
                return
            }

            await ArchivalService.archive(
                {
                    entityType,
                    entityIds,
                    comment: comment.trim(),
                    includeAttachments,
                    includeChangelogs,
                },
                session.user.access_token,
            )

            setShow(false)
            setComment('')
            // The archived entity is gone from the live DB; refresh the list so it
            // disappears without a manual reload. Mirrors the delete dialogs.
            if (onArchived) {
                onArchived()
            } else {
                window.location.reload()
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e)
            setError(message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <Modal
            show={show}
            onHide={close}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    <BsExclamationTriangle className='me-2 text-warning' />
                    {heading}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant='warning'>{t('Archive Warning')}</Alert>

                {/* Pre-archival plan */}
                <h6 className='mt-3'>{t('What will happen')}</h6>
                {previewLoading && (
                    <div className='text-muted d-flex align-items-center'>
                        <Spinner
                            size='sm'
                            className='me-2'
                        />
                        {t('Checking dependencies')}
                    </div>
                )}
                {previewError !== null && <Alert variant='danger'>{previewError}</Alert>}
                {preview && !previewLoading && (
                    <>
                        <div className='mb-2'>
                            <Badge
                                bg='danger'
                                className='me-2'
                            >
                                {preview.archiveCount} {t('to archive')}
                            </Badge>
                            {preview.keepAliveCount > 0 && (
                                <Badge
                                    bg='warning'
                                    text='dark'
                                    className='me-2'
                                >
                                    {preview.keepAliveCount} {t('kept alive')}
                                </Badge>
                            )}
                            {preview.blockedCount > 0 && (
                                <Badge bg='secondary'>
                                    {preview.blockedCount} {t('blocked')}
                                </Badge>
                            )}
                        </div>
                        <Table
                            size='sm'
                            bordered
                            responsive
                        >
                            <thead>
                                <tr>
                                    <th>{t('Type')}</th>
                                    <th>{t('Name')}</th>
                                    <th>{t('Action')}</th>
                                    <th>{t('Reason')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.entries.map((e) => (
                                    <tr key={`${e.entityType}-${e.entityId}`}>
                                        <td>{e.entityType}</td>
                                        <td>{e.entityName}</td>
                                        <td>
                                            <Badge
                                                bg={ACTION_VARIANT[e.action]}
                                                text={e.action === 'KEEP_ALIVE' ? 'dark' : undefined}
                                            >
                                                {e.action}
                                            </Badge>
                                        </td>
                                        <td className='text-muted small'>{e.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {hasBlocked && <Alert variant='secondary'>{t('Blocked items will be skipped')}</Alert>}
                    </>
                )}

                <Form.Group className='mb-3 mt-3'>
                    <Form.Label>
                        {t('Comment')} <span className='text-danger'>*</span>
                    </Form.Label>
                    <Form.Control
                        as='textarea'
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('Why is this being archived?')}
                        disabled={busy}
                    />
                </Form.Group>

                <Form.Check
                    id='archive-include-attachments'
                    label={t('Include attachments')}
                    checked={includeAttachments}
                    onChange={(e) => setIncludeAttachments(e.target.checked)}
                    disabled={busy}
                    className='mb-2'
                />
                <Form.Check
                    id='archive-include-changelogs'
                    label={t('Include changelogs')}
                    checked={includeChangelogs}
                    onChange={(e) => setIncludeChangelogs(e.target.checked)}
                    disabled={busy}
                />

                {error !== null && (
                    <Alert
                        variant='danger'
                        className='mt-3'
                    >
                        {error}
                    </Alert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='secondary'
                    onClick={close}
                    disabled={busy}
                >
                    {t('Cancel')}
                </Button>
                <Button
                    variant='danger'
                    onClick={handleArchive}
                    disabled={busy || comment.trim().length === 0}
                >
                    {busy ? (
                        <>
                            <Spinner
                                size='sm'
                                className='me-2'
                            />
                            {t('Archiving')}
                        </>
                    ) : (
                        t('Archive and Download')
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ArchiveModal
