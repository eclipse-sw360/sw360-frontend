// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useState } from 'react'
import { Alert, Badge, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap'
import { BsExclamationTriangle, BsFillTrashFill, BsQuestionCircle, BsUpload } from 'react-icons/bs'
import { ArchivalRecord, ArchivalStatus, RestoreOutcome, RestorePreview, RestoreResult } from '@/object-types'
import ArchivalService from '@/services/archival.service'
import { CommonUtils } from '@/utils'
import { getAuthenticatedAccessToken } from '@/utils/api/authenticatedApi.util'

const STATUS_VARIANT: Record<ArchivalStatus, string> = {
    ARCHIVED: 'secondary',
    PARTIALLY_ARCHIVED: 'warning',
    RESTORED: 'success',
    FAILED: 'danger',
}

const OUTCOME_VARIANT: Record<RestoreOutcome, string> = {
    RESTORED: 'success',
    SKIPPED: 'secondary',
    FAILED: 'danger',
}

function formatDateTime(value?: string): string {
    if (value === undefined || value === '') return '—'
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

export default function ArchivalRestore(): JSX.Element {
    const t = useTranslations('default')

    const [records, setRecords] = useState<ArchivalRecord[] | null>(null)
    const [recordsError, setRecordsError] = useState<string | null>(null)
    const [delRecord, setDelRecord] = useState<ArchivalRecord | null>(null)

    const [bundle, setBundle] = useState<File | null>(null)
    const [preview, setPreview] = useState<RestorePreview | null>(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [result, setResult] = useState<RestoreResult | null>(null)
    const [restoring, setRestoring] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadRecords = useCallback(async () => {
        setRecordsError(null)
        try {
            const token = await getAuthenticatedAccessToken()
            setRecords(await ArchivalService.listRecords(token))
        } catch (e) {
            setRecords([])
            setRecordsError(e instanceof Error ? e.message : String(e))
        }
    }, [])

    useEffect(() => {
        void loadRecords()
    }, [
        loadRecords,
    ])

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBundle(e.target.files?.[0] ?? null)
        setPreview(null)
        setResult(null)
        setError(null)
    }

    const handlePreview = async () => {
        if (bundle === null) {
            setError(t('Please select a bundle first'))
            return
        }
        setPreviewLoading(true)
        setError(null)
        setResult(null)
        try {
            const token = await getAuthenticatedAccessToken()
            setPreview(await ArchivalService.restorePreview(bundle, token))
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setPreviewLoading(false)
        }
    }

    const handleRestore = async () => {
        if (bundle === null) {
            setError(t('Please select a bundle first'))
            return
        }
        setRestoring(true)
        setError(null)
        try {
            const token = await getAuthenticatedAccessToken()
            setResult(await ArchivalService.restore(bundle, token))
            setPreview(null)
            await loadRecords()
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e))
        } finally {
            setRestoring(false)
        }
    }

    const handleDeleteRecord = async (record: ArchivalRecord) => {
        try {
            const token = await getAuthenticatedAccessToken()
            await ArchivalService.deleteRecord(record.id, token)
            setDelRecord(null)
            await loadRecords()
        } catch (e) {
            setDelRecord(null)
            setRecordsError(e instanceof Error ? e.message : String(e))
        }
    }

    const failedEntries = result?.entries.filter((e) => e.outcome === 'FAILED') ?? []

    return (
        <>
            <Modal
                show={delRecord !== null}
                onHide={() => setDelRecord(null)}
                size='lg'
            >
                <Modal.Header
                    closeButton
                    style={{
                        backgroundColor: '#feefef',
                        color: '#da1414',
                    }}
                >
                    <Modal.Title className='fw-bold'>
                        <BsQuestionCircle size={20} /> {t('Delete archival record')} ?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='fs-6'>{t('Delete archival record warning')}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='secondary'
                        onClick={() => setDelRecord(null)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant='danger'
                        onClick={() => {
                            if (delRecord) void handleDeleteRecord(delRecord)
                        }}
                    >
                        {t('Delete archival record')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <div className='mx-5 mt-3'>
                <div className='row d-flex justify-content-end buttonheader-title'>{t('ARCHIVE AND RESTORE')}</div>

                {/* Restore from an uploaded bundle */}
                <Card className='mt-4'>
                    <Card.Header>{t('Restore from bundle')}</Card.Header>
                    <Card.Body>
                        <p className='text-muted'>{t('Restore from bundle help')}</p>

                        <Form.Group
                            controlId='restore-bundle'
                            className='mb-3'
                        >
                            <Form.Label>{t('Archive bundle')}</Form.Label>
                            <Form.Control
                                type='file'
                                accept='.tar.gz,.gz,application/gzip'
                                onChange={onFileChange}
                                disabled={previewLoading || restoring}
                            />
                        </Form.Group>

                        <Button
                            variant='secondary'
                            className='me-2'
                            onClick={() => void handlePreview()}
                            disabled={bundle === null || previewLoading || restoring}
                        >
                            {previewLoading ? (
                                <>
                                    <Spinner
                                        size='sm'
                                        className='me-2'
                                    />
                                    {t('Checking bundle')}
                                </>
                            ) : (
                                <>
                                    <BsUpload className='me-2' />
                                    {t('Preview restore')}
                                </>
                            )}
                        </Button>
                        <Button
                            variant='primary'
                            onClick={() => void handleRestore()}
                            disabled={preview === null || restoring || previewLoading}
                        >
                            {restoring ? (
                                <>
                                    <Spinner
                                        size='sm'
                                        className='me-2'
                                    />
                                    {t('Restoring')}
                                </>
                            ) : (
                                t('Restore')
                            )}
                        </Button>

                        {error !== null && (
                            <Alert
                                variant='danger'
                                className='mt-3 mb-0'
                            >
                                {error}
                            </Alert>
                        )}

                        {/* Preview: what the restore would do */}
                        {preview && (
                            <div className='mt-4'>
                                <h6>{t('This bundle contains')}</h6>
                                <Table
                                    size='sm'
                                    bordered
                                    responsive
                                >
                                    <thead>
                                        <tr>
                                            <th>{t('Type')}</th>
                                            <th>{t('Name')}</th>
                                            <th>{t('Attachments')}</th>
                                            <th>{t('Status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.entries.map((e, i) => (
                                            <tr key={`${e.entityType}-${e.entityId}-${i}`}>
                                                <td>{e.entityType}</td>
                                                <td>{e.entityName}</td>
                                                <td>{e.attachmentCount ?? 0}</td>
                                                <td>
                                                    {e.conflict ? (
                                                        <Badge bg='secondary'>{t('Already present')}</Badge>
                                                    ) : (
                                                        <Badge bg='success'>{t('Will be restored')}</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}

                        {/* Result: what the restore actually did */}
                        {result && (
                            <div className='mt-4'>
                                <h6>{t('Restore complete')}</h6>
                                <div className='mb-2'>
                                    <Badge
                                        bg='success'
                                        className='me-2'
                                    >
                                        {result.restoredCount} {t('restored')}
                                    </Badge>
                                    <Badge
                                        bg='secondary'
                                        className='me-2'
                                    >
                                        {result.skippedCount} {t('skipped')}
                                    </Badge>
                                    {result.failedCount > 0 && (
                                        <Badge bg='danger'>
                                            {result.failedCount} {t('failed')}
                                        </Badge>
                                    )}
                                </div>

                                {failedEntries.length > 0 && (
                                    <Alert variant='danger'>
                                        <Alert.Heading className='fs-6'>
                                            <BsExclamationTriangle className='me-2' />
                                            {t('Some entities could not be restored')}
                                        </Alert.Heading>
                                        <ul className='mb-0'>
                                            {failedEntries.map((e, i) => (
                                                <li key={`${e.entityType}-${e.entityId}-${i}`}>
                                                    <b>
                                                        {e.entityType} {e.entityId}
                                                    </b>
                                                    {CommonUtils.isNullEmptyOrUndefinedString(e.reason)
                                                        ? ''
                                                        : ` — ${e.reason}`}
                                                </li>
                                            ))}
                                        </ul>
                                    </Alert>
                                )}

                                <Table
                                    size='sm'
                                    bordered
                                    responsive
                                >
                                    <thead>
                                        <tr>
                                            <th>{t('Type')}</th>
                                            <th>{t('Entity Id')}</th>
                                            <th>{t('Outcome')}</th>
                                            <th>{t('Reason')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.entries.map((e, i) => (
                                            <tr key={`${e.entityType}-${e.entityId}-${i}`}>
                                                <td>{e.entityType}</td>
                                                <td>{e.entityId}</td>
                                                <td>
                                                    <Badge bg={OUTCOME_VARIANT[e.outcome]}>{e.outcome}</Badge>
                                                </td>
                                                <td className='text-muted small'>{e.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </Card.Body>
                </Card>

                {/* Registry of archived entities */}
                <Card className='mt-4 mb-5'>
                    <Card.Header>{t('Archived entities')}</Card.Header>
                    <Card.Body>
                        {recordsError !== null && <Alert variant='danger'>{recordsError}</Alert>}
                        {records === null ? (
                            <div className='text-center'>
                                <Spinner className='spinner' />
                            </div>
                        ) : records.length === 0 ? (
                            <p className='text-muted mb-0'>{t('No archived entities yet')}</p>
                        ) : (
                            <Table
                                bordered
                                responsive
                            >
                                <thead>
                                    <tr>
                                        <th>{t('Type')}</th>
                                        <th>{t('Name')}</th>
                                        <th>{t('Status')}</th>
                                        <th>{t('Archived by')}</th>
                                        <th>{t('Archived at')}</th>
                                        <th>{t('Restored by')}</th>
                                        <th>{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r) => (
                                        <tr key={r.id}>
                                            <td>{r.entityType}</td>
                                            <td>{r.entityName ?? r.entityId}</td>
                                            <td>
                                                <Badge bg={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                                            </td>
                                            <td>{r.archivedBy ?? '—'}</td>
                                            <td>{formatDateTime(r.archivedAt)}</td>
                                            <td>{r.restoredBy ?? '—'}</td>
                                            <td>
                                                <span
                                                    className='d-inline-block'
                                                    role='button'
                                                    onClick={() => setDelRecord(r)}
                                                >
                                                    <BsFillTrashFill
                                                        className='btn-icon'
                                                        size={18}
                                                    />
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </div>
        </>
    )
}
