// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { type JSX, useState } from 'react'
import { Form, Modal, Spinner } from 'react-bootstrap'
import { useConfigKeyValue } from '@/contexts'
import { ConfigKeys, ExportReportFormat } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import ApiUtils from '@/utils/api/authenticatedApi.util'

interface ExportProjectListModalProps {
    onHide: () => void
}

export default function ExportProjectListModal({ onHide }: ExportProjectListModalProps): JSX.Element {
    const t = useTranslations('default')
    const params = useSearchParams()
    const mailRequestForProjectReport = useConfigKeyValue(ConfigKeys.MAIL_REQUEST_FOR_REPORT)
    const [exportFormat, setExportFormat] = useState<ExportReportFormat>(ExportReportFormat.XLSX)
    const [exportWithLinkedReleases, setExportWithLinkedReleases] = useState<boolean>(false)
    const [exporting, setExporting] = useState<boolean>(false)

    const exportProjectList = async (): Promise<void> => {
        if (exporting) return
        setExporting(true)
        try {
            const mailEnabled = mailRequestForProjectReport === 'true'
            const exportParams = new URLSearchParams(params.toString())
            exportParams.set('module', 'PROJECTS')
            exportParams.set('withlinkedreleases', String(exportWithLinkedReleases))
            exportParams.set('format', exportFormat)
            const url = `reports?${exportParams.toString()}`

            let statusCode: number | undefined
            if (mailEnabled) {
                const response = await ApiUtils.GET(url)
                statusCode = response.status
            } else {
                const currentDate = new Date().toISOString().split('T')[0]
                const fileName = `Projects-${currentDate}.${exportFormat}`
                statusCode = await DownloadService.download(url, fileName)
            }

            if (statusCode === StatusCodes.OK) {
                MessageService.success(
                    mailEnabled ? t('Report generation has started') : t('Report download is successful'),
                )
                onHide()
            } else if (statusCode === StatusCodes.FORBIDDEN) {
                MessageService.warn(t('Access Denied'))
            } else if (statusCode === StatusCodes.INTERNAL_SERVER_ERROR) {
                MessageService.error(t('Internal server error'))
            } else if (statusCode === StatusCodes.UNAUTHORIZED) {
                MessageService.error(t('Unauthorized request'))
            } else if (statusCode !== undefined) {
                MessageService.error(t('An error occurred while downloading the report'))
            }
        } catch (error) {
            ApiUtils.reportError(error)
        } finally {
            setExporting(false)
        }
    }

    return (
        <Modal
            show
            onHide={() => {
                if (!exporting) onHide()
            }}
            centered
            backdrop={exporting ? 'static' : true}
            keyboard={!exporting}
            aria-labelledby='export-project-list-title'
        >
            <Modal.Header closeButton={!exporting}>
                <Modal.Title id='export-project-list-title'>{t('Export List')}</Modal.Title>
            </Modal.Header>
            <Form
                onSubmit={(event) => {
                    event.preventDefault()
                    void exportProjectList()
                }}
            >
                <Modal.Body>
                    <fieldset
                        className='mb-3'
                        disabled={exporting}
                    >
                        <legend className='fs-6'>{t('Projects')}</legend>
                        <Form.Check
                            type='radio'
                            id='export-projects-only'
                            name='projectExportScope'
                            label={t('Projects only')}
                            checked={!exportWithLinkedReleases}
                            onChange={() => setExportWithLinkedReleases(false)}
                        />
                        <Form.Check
                            type='radio'
                            id='export-projects-with-releases'
                            name='projectExportScope'
                            label={t('Projects with linked releases')}
                            checked={exportWithLinkedReleases}
                            onChange={() => setExportWithLinkedReleases(true)}
                        />
                    </fieldset>
                    <Form.Group controlId='project-export-format'>
                        <Form.Label>{t('Export format')}</Form.Label>
                        <Form.Select
                            value={exportFormat}
                            onChange={(event) => {
                                const selectedFormat = Object.values(ExportReportFormat).find(
                                    (format) => format === event.target.value,
                                )
                                if (selectedFormat) setExportFormat(selectedFormat)
                            }}
                            disabled={exporting}
                        >
                            {Object.values(ExportReportFormat).map((format) => (
                                <option
                                    key={format}
                                    value={format}
                                >
                                    {format.toUpperCase()}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type='button'
                        className='btn btn-secondary'
                        onClick={onHide}
                        disabled={exporting}
                    >
                        {t('Cancel')}
                    </button>
                    <button
                        type='submit'
                        className='btn btn-primary'
                        disabled={exporting}
                    >
                        {t('Export')}
                        {exporting && (
                            <Spinner
                                size='sm'
                                className='ms-2'
                                aria-hidden='true'
                            />
                        )}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}
