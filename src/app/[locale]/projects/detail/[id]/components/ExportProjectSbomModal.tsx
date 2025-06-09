// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction, useState } from 'react'
import { Alert, Form, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

interface Props {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    projectId: string
    projectName?: string
    projectVersion?: string
}

enum DownloadState {
    INIT,
    SUCCESS,
    FAILED,
}

export default function ExportProjectSbomModal({
    show,
    setShow,
    projectId,
    projectName,
    projectVersion,
}: Props): ReactNode {
    const t = useTranslations('default')
    const [sbomFormat, setSbomFormat] = useState<string>('')
    const [includeSubProjectReleases, setIncludeSubProjectReleases] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const [disableExportSbom, setDisableExportSbom] = useState<boolean>(true)
    const [exportTime, setExportTime] = useState<number | null>(null)
    const [downloadState, setDownloadState] = useState<DownloadState>(DownloadState.INIT)

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value, type } = event.target
        if (name === 'sbomFormat') {
            setSbomFormat(value)
            setDisableExportSbom(false)
        } else if (name === 'includeSubProjectReleases' && type === 'checkbox') {
            setIncludeSubProjectReleases(event.target.checked)
            setDisableExportSbom(false)
        }
    }

    const handleExportSbom = async (projectId: string) => {
        try {
            const start = Date.now()
            setLoading(true)
            setDisableExportSbom(true)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                return signOut()
            }
            const currentDate = new Date().toISOString().split('T')[0]
            const downloadStatusCode = await DownloadService.download(
                `reports?module=sbom&projectId=${projectId}&withSubProject=${includeSubProjectReleases}
                 &bomType=${sbomFormat}`,
                session,
                `Project-${currentDate}_SBOM.${sbomFormat.toLowerCase()}`,
            )
            if (downloadStatusCode !== undefined && downloadStatusCode === 200) {
                setDownloadState(DownloadState.SUCCESS)
            } else setDownloadState(DownloadState.FAILED)
            const endTime = Date.now()
            setExportTime(parseFloat(((endTime - start) / 1000).toFixed(2)))
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setShow(false)
        setExportTime(null)
        setIncludeSubProjectReleases(false)
        setSbomFormat('')
        setDownloadState(DownloadState.INIT)
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => handleCancel()}
                scrollable
            >
                <Modal.Header
                    style={{ backgroundColor: '#eef2fa', color: '#2e5aac' }}
                    closeButton
                >
                    <Modal.Title id='export-project-sbom-modal'>
                        <AiOutlineQuestionCircle />
                        {t('Export Project SBOM')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {downloadState === DownloadState.SUCCESS && (
                        <Alert
                            variant='success'
                            className='border-success-subtle p-3'
                        >
                            <p className='mb-1'>{t('SBOM exported successfully')}</p>
                            <p className='mb-0'>
                                {t.rich('Time taken for export', {
                                    exportTime: exportTime ?? '',
                                    strong: (chunks) => <b>{chunks}</b>,
                                })}
                            </p>
                        </Alert>
                    )}
                    {downloadState === DownloadState.FAILED && (
                        <Alert
                            variant='danger'
                            className='border-danger-subtle p-3'
                        >
                            <p className='mb-1'>{t('There are some error while exporting SBOM')}</p>
                        </Alert>
                    )}
                    <div className='mb-3'>
                        {t.rich('Do you really want to export SBOM', {
                            projectName: projectName ?? '',
                            projectVersion: projectVersion ?? '',
                            strong: (chunks) => <b>{chunks}</b>,
                        })}
                    </div>
                    <div className='mb-3'>{t('Currently only CycloneDX SBOM export is supported')}</div>
                    <Form>
                        <Form.Group className='mb-4'>
                            <Form.Label style={{ fontWeight: 'bold' }}>
                                {t('Select SBOM format')} :
                                <span
                                    className='text-red'
                                    style={{ color: '#F7941E' }}
                                >
                                    *
                                </span>
                            </Form.Label>
                            <Form.Select
                                className='w-auto'
                                id='exportProjectSbom.sbomFormat'
                                name='sbomFormat'
                                value={sbomFormat}
                                onChange={updateInputField}
                                required
                            >
                                <option
                                    value=''
                                    hidden
                                ></option>
                                <option value='XML'>{t('XML Format')}</option>
                                <option value='JSON'>{t('JSON Format')}</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group
                            className='mb-2'
                            style={{ display: 'flex', alignItems: 'left' }}
                        >
                            <Form.Check
                                type='checkbox'
                                id='exportProjectSbom.includeSubProjectReleases'
                                name='includeSubProjectReleases'
                                checked={includeSubProjectReleases}
                                onChange={updateInputField}
                            />
                            <Form.Label style={{ marginLeft: '10px' }}>
                                {t('Include releases from sub projects')}
                            </Form.Label>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-primary'
                        onClick={() => {
                            handleExportSbom(projectId)
                        }}
                        disabled={disableExportSbom}
                    >
                        {t('Export SBOM')}
                        {loading && (
                            <Spinner
                                size='sm'
                                className='ms-1 spinner'
                            />
                        )}
                    </button>
                    <button
                        className='btn btn-dark'
                        onClick={() => handleCancel()}
                    >
                        {t('Close')}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
