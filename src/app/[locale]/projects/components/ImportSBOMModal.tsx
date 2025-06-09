// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import Link from 'next/link'
import React, { JSX, useRef, useState } from 'react'
import { Alert, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BiClipboard } from 'react-icons/bi'

import { Attachment, AttachmentTypes, HttpStatus, ImportSummary } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import styles from '../projects.module.css'

interface Props {
    importSBOMMetadata: ImportSBOMMetadata
    setImportSBOMMetadata: React.Dispatch<React.SetStateAction<ImportSBOMMetadata>>
}

enum ImportSBOMState {
    INIT_STATE,
    CONFIRM_IMPORT,
    IMPORTING,
    IMPORTED,
}

interface AlertData {
    message: JSX.Element
    variant: string
}

interface ImportSBOMMetadata {
    importType: 'SPDX' | 'CycloneDx'
    show: boolean
}

const ImportSBOMModal = ({ importSBOMMetadata, setImportSBOMMetadata }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [importState, setImportState] = useState(ImportSBOMState.INIT_STATE)
    const [fileFormatError, setFileFormatError] = useState<AlertData | null>(null)
    const [importError, setImportError] = useState<AlertData | null>(null)
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)
    const [, setStartTime] = useState<number | null>(null)
    const [importTime, setImportTime] = useState<number | null>(null)
    const selectedFile = useRef<File | null>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const Clipboard = ({ text }: { text: string }) => {
        return (
            <>
                <OverlayTrigger overlay={<Tooltip>{t('Copy to Clipboard')}</Tooltip>}>
                    <span className='d-inline-block'>
                        <BiClipboard
                            onClick={() => {
                                void navigator.clipboard.writeText(text)
                            }}
                        />
                    </span>
                </OverlayTrigger>
            </>
        )
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        selectedFile.current = e.currentTarget.files?.[0] ?? null
        if (!selectedFile.current) {
            return
        }
        if (importSBOMMetadata.importType === 'SPDX') {
            if (!selectedFile.current.name.endsWith('.rdf') && !selectedFile.current.name.endsWith('.xml')) {
                setFileFormatError({
                    variant: 'danger',
                    message: (
                        <p>
                            {t.rich('SBOM_IMPORT_FILE_FORMAT_ERROR', {
                                fileName: selectedFile.current.name,
                                files: '.rdf, .xml',
                            })}
                        </p>
                    ),
                })
                return
            }
        } else {
            if (!selectedFile.current.name.endsWith('.json') && !selectedFile.current.name.endsWith('.xml')) {
                setFileFormatError({
                    variant: 'danger',
                    message: (
                        <p>
                            {t.rich('SBOM_IMPORT_FILE_FORMAT_ERROR', {
                                fileName: selectedFile.current.name,
                                files: '.json, .xml',
                            })}
                        </p>
                    ),
                })
                return
            }
        }
        setImportState(ImportSBOMState.CONFIRM_IMPORT)
    }

    const fetchImportStatus = async (projectId: string, attachmentId: string, accessToken: string) => {
        try {
            const response = await ApiUtils.GET(`projects/${projectId}/attachments/${attachmentId}`, accessToken)

            const importStatusResponse = await response.json()
            setImportSummary(importStatusResponse)
            setImportState(ImportSBOMState.IMPORTED)
        } catch (err) {
            console.error('Error fetching import status:', err)
        }
    }

    const importFile = async () => {
        try {
            setImportState(ImportSBOMState.IMPORTING)
            const start = Date.now() // Capture start time
            setStartTime(start)
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            if (!selectedFile.current) {
                setImportError({ variant: 'danger', message: <p>{t('SBOM import failed')}</p> })
                return
            }
            const formData = new FormData()
            formData.append('file', selectedFile.current, selectedFile.current.name)
            const response = await ApiUtils.POST(
                `projects/import/SBOM?type=${importSBOMMetadata.importType}`,
                formData,
                session.user.access_token,
            )
            const responseText = await response.text()
            const responseJson = await JSON.parse(responseText)
            if (response.status === HttpStatus.OK) {
                setImportError({ variant: 'success', message: <p>{t('SBOM imported successfully')}</p> })

                const projectId = responseJson?.id
                if (projectId == null) {
                    console.error('Project ID not found in response')
                    return
                }
                // Get attachmentId directly from response
                const attachments: Attachment[] = responseJson?._embedded['sw360:attachments'] ?? []

                const importStatusAttachment = attachments.find((att) => att.attachmentType === AttachmentTypes.OTHER)

                if (importStatusAttachment?.['_links']?.self.href != null) {
                    const attachmentUrl = new URL(importStatusAttachment._links.self.href)
                    const attachmentId = attachmentUrl.pathname.split('/').pop()

                    if (attachmentId != null) {
                        await fetchImportStatus(projectId, attachmentId, session.user.access_token)
                    }
                }
                const endTime = Date.now()
                setImportTime(parseFloat(((endTime - start) / 1000).toFixed(2)))
            } else if (response.status === HttpStatus.CONFLICT) {
                const match = responseText.match(/The projectId is:\s*(\S+)/)
                const projectId = match ? match[1].replace(/"/g, '') : 'Unknown'
                setImportError({
                    variant: 'danger',
                    message: (
                        <div>
                            <strong>{t('Duplicate SBOM')}:</strong>
                            <p>
                                {t('A project with the same name and version already exists')}.{' '}
                                {t('Please import this SBOM from project details page')}
                            </p>
                            <p>
                                <a href={`/projects/detail/${projectId}`}>
                                    {t('Click here to open project details page')}
                                </a>
                            </p>
                        </div>
                    ),
                })
            } else {
                setImportError({
                    variant: 'danger',
                    message: (
                        <>
                            <span>
                                <strong>{t('SBOM import failed')}</strong>
                                <br></br>
                                {responseText.replaceAll('"', '')}
                            </span>
                        </>
                    ),
                })
            }
            setImportState(ImportSBOMState.IMPORTED)
        } catch (err) {
            console.error(err)
        }
    }

    const handleBrowseFile = () => {
        inputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (e.dataTransfer.items.length !== 0) {
            if (e.dataTransfer.items[0].kind === 'file') {
                selectedFile.current = e.dataTransfer.items[0].getAsFile()
            } else {
                return
            }
        } else if (e.dataTransfer.files.length !== 0) {
            selectedFile.current = e.dataTransfer.files[0]
        } else {
            return
        }
        if (importSBOMMetadata.importType === 'SPDX') {
            if (
                selectedFile.current &&
                !selectedFile.current.name.endsWith('.rdf') &&
                !selectedFile.current.name.endsWith('.xml')
            ) {
                setFileFormatError({
                    variant: 'danger',
                    message: (
                        <p>
                            {t.rich('SBOM_IMPORT_FILE_FORMAT_ERROR', {
                                fileName: selectedFile.current.name,
                                files: '.rdf, .xml',
                            })}
                        </p>
                    ),
                })
                return
            }
        } else {
            if (
                selectedFile.current &&
                !selectedFile.current.name.endsWith('.json') &&
                !selectedFile.current.name.endsWith('.xml')
            ) {
                setFileFormatError({
                    variant: 'danger',
                    message: (
                        <p>
                            {t.rich('SBOM_IMPORT_FILE_FORMAT_ERROR', {
                                fileName: selectedFile.current.name,
                                files: '.json, .xml',
                            })}
                        </p>
                    ),
                })
                return
            }
        }
        setImportState(ImportSBOMState.CONFIRM_IMPORT)
    }

    const closeModal = () => {
        setImportSBOMMetadata({ show: false, importType: 'SPDX' })
        setFileFormatError(null)
        setImportError(null)
        setImportSummary(null)
        setImportState(ImportSBOMState.INIT_STATE)
    }

    return (
        <Modal
            show={importSBOMMetadata.show}
            onHide={() => closeModal()}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    {t.rich('Upload Project SBOM', {
                        importType: importSBOMMetadata.importType,
                        strong: (chunks) => <span className='text-primary fw-bold'>{chunks}</span>,
                    })}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {fileFormatError && (
                    <Alert
                        variant={fileFormatError.variant}
                        onClose={() => setFileFormatError(null)}
                        dismissible
                    >
                        {fileFormatError.message}
                    </Alert>
                )}
                {importState === ImportSBOMState.INIT_STATE && (
                    <>
                        <div>
                            {importSBOMMetadata.importType === 'CycloneDx' ? (
                                <>
                                    <h5 className='fw-bold'>
                                        {t.rich('UPLOAD SBOM HEADER', {
                                            fileFormats: `CycloneDx -> JSON/XML`,
                                            strong: (chunks) => <span className='text-primary'>{chunks}</span>,
                                        })}
                                    </h5>
                                    <ul>
                                        <li>
                                            {t.rich('CycloneDx import condition 1', {
                                                red: (chunks) => <span className='text-danger fw-bold'>{chunks}</span>,
                                            })}
                                        </li>
                                        <li>
                                            {t.rich('CycloneDx import condition 2', {
                                                red: (chunks) => <span className='text-danger fw-bold'>{chunks}</span>,
                                                blue: (chunks) => <span className='text-primary'>{chunks}</span>,
                                                bold: (chunks) => <span className='fw-bold'>{chunks}</span>,
                                            })}
                                        </li>
                                        <li>
                                            {t.rich('CycloneDx import condition 3', {
                                                red: (chunks) => <span className='text-danger fw-bold'>{chunks}</span>,
                                                blue: (chunks) => <span className='text-primary'>{chunks}</span>,
                                            })}
                                        </li>
                                    </ul>
                                </>
                            ) : (
                                <>
                                    <h5 className='fw-bold'>
                                        {t.rich('UPLOAD SBOM HEADER', {
                                            fileFormats: `SPDX -> RDF/XML`,
                                            strong: (chunks) => <span className='text-primary'>{chunks}</span>,
                                        })}
                                    </h5>
                                    <p>{t('current_spdx_only_supports')}.</p>
                                </>
                            )}
                        </div>
                        <div className={`${styles['modal-body-first']}`}>
                            <div
                                className={`${styles['modal-body-second']}`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <span>{t('Drop a File Here')}</span>
                                <br />
                                {t('Or')}
                                <br />
                                <input
                                    className={`${styles['input']}`}
                                    ref={inputRef}
                                    type='file'
                                    onChange={handleFileChange}
                                    placeholder={t('Drop a File Here')}
                                />
                                <button
                                    type='button'
                                    className='btn btn-secondary'
                                    onClick={handleBrowseFile}
                                >
                                    {t('Browse')}
                                </button>
                            </div>
                        </div>
                    </>
                )}
                {importState === ImportSBOMState.IMPORTING && (
                    <h5 className='fw-bold'>{t('Importing SBOM file')}...</h5>
                )}
                {importState === ImportSBOMState.CONFIRM_IMPORT && (
                    <p className='fw-bold'>
                        {t.rich('click to import', {
                            fileName: selectedFile.current?.name ?? '',
                            blue: (chunks) => <span className='text-primary'>{chunks}</span>,
                        })}
                    </p>
                )}
                {importState === ImportSBOMState.IMPORTED &&
                    (importSummary != null ? (
                        <div style={{ maxHeight: '80vh', overflowY: 'auto', paddingRight: '10px' }}>
                            <h5>
                                <strong>{t('SBOM imported successfully')}...</strong>
                            </h5>
                            <Alert
                                variant='primary'
                                className='border-primary-subtle p-3'
                            >
                                <p className='mb-1'>
                                    {t('Created project with name')}:
                                    <Link
                                        href={`/projects/detail/${importSummary.projectId}`}
                                        passHref
                                    >
                                        <span className='fw-bold text-primary'> {importSummary.projectName}</span>
                                    </Link>
                                </p>
                                <p className='mb-0'>
                                    {t('Time taken for import')}: <strong>{importTime} seconds</strong>
                                </p>
                            </Alert>
                            <Alert
                                variant='success'
                                className='p-3'
                            >
                                <ul className='list-unstyled'>
                                    <li>
                                        {t('Total Releases')}:{' '}
                                        <strong>
                                            {' '}
                                            <span className='text-success'>
                                                {+importSummary.relCreationCount + +importSummary.relReuseCount}
                                            </span>
                                        </strong>
                                        <ul>
                                            <li>
                                                {t('Releases created')}:{' '}
                                                <span className='text-success'>{importSummary.relCreationCount}</span>
                                            </li>
                                            <li>
                                                {t('Releases reused')}:{' '}
                                                <span className='text-success'>{importSummary.relReuseCount}</span>
                                            </li>
                                        </ul>
                                    </li>
                                    <li>
                                        {t('Total Packages')}:{' '}
                                        <strong>
                                            {' '}
                                            <span className='text-success'>
                                                {+importSummary.pkgCreationCount + +importSummary.pkgReuseCount}
                                            </span>
                                        </strong>
                                        <ul>
                                            <li>
                                                {t('Packages created')}:{' '}
                                                <span className='text-success'>{importSummary.pkgCreationCount}</span>
                                            </li>
                                            <li>
                                                {t('Packages reused')}:{' '}
                                                <span className='text-success'>{importSummary.pkgReuseCount}</span>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </Alert>
                            {importSummary.invalidPkg && importSummary.invalidPkg.length > 0 && (
                                <Alert
                                    variant='danger'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${t('List of invalid Packages without purl or name or version')}: ${importSummary.invalidPkg.split('||').length}\n${importSummary.invalidPkg.split('||').join('\n')}`}
                                        />
                                    </button>
                                    {t('List of invalid Packages without purl or name or version')}:{' '}
                                    <strong>{importSummary.invalidPkg.split('||').length}</strong> ({t('Not Imported')})
                                    <ul className='mb-0'>
                                        {importSummary.invalidPkg.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {importSummary.invalidComp && importSummary.invalidComp.length > 0 && (
                                <Alert
                                    variant='warning'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${t('List of Packages with invalid or missing VCS information')}: ${importSummary.invalidComp.split('||').length}\n${importSummary.invalidComp.split('||').join('\n')}`}
                                        />
                                    </button>
                                    {t('List of Packages with invalid or missing VCS information')}:{' '}
                                    <strong>{importSummary.invalidComp.split('||').length}</strong> (
                                    {t('Orphan Packages')})
                                    <ul className='mb-0'>
                                        {importSummary.invalidComp.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {importSummary.redirectedVCS && importSummary.redirectedVCS.length > 0 && (
                                <Alert
                                    variant='primary'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${importSummary.redirectedVCS.split('||').length} ${t('VCS URLs were redirected')}:\n${importSummary.redirectedVCS.split('||').join('\n')}`}
                                        />
                                    </button>
                                    <strong>{importSummary.redirectedVCS.split('||').length} </strong>
                                    {t('VCS URLs were redirected')}:
                                    <ul className='mb-0'>
                                        {importSummary.redirectedVCS.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {importSummary.dupPkg && importSummary.dupPkg.length > 0 && (
                                <Alert
                                    variant='danger'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${importSummary.dupPkg.split('||').length} ${t('Packages were not imported')}:\n${importSummary.dupPkg.split('||').join('\n')}`}
                                        />
                                    </button>
                                    <strong>{importSummary.dupPkg.split('||').length} </strong>{' '}
                                    {t('Packages were not imported')}:
                                    <ul className='mb-0'>
                                        {importSummary.dupPkg.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {importSummary.dupComp && importSummary.dupComp.length > 0 && (
                                <Alert
                                    variant='danger'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${importSummary.dupComp.split('||').length} ${t('Components were not imported because multiple duplicate components are found with the exact same name or vcs')}:\n${importSummary.dupComp.split('||').join('\n')}`}
                                        />
                                    </button>
                                    <strong>{importSummary.dupComp.split('||').length} </strong>{' '}
                                    {t(
                                        'Components were not imported because multiple duplicate components are found with the exact same name or vcs',
                                    )}
                                    :
                                    <ul className='mb-0'>
                                        {importSummary.dupComp.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {importSummary.dupRel && importSummary.dupRel.length > 0 && (
                                <Alert
                                    variant='danger'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${importSummary.dupRel.split('||').length} ${t('Releases were not imported')}:\n${importSummary.dupRel.split('||').join('\n')}`}
                                        />
                                    </button>
                                    <strong>{importSummary.dupRel.split('||').length} </strong>{' '}
                                    {t('Releases were not imported')}:
                                    <ul className='mb-0'>
                                        {importSummary.dupRel.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                            {importSummary.invalidRel && importSummary.invalidRel.length > 0 && (
                                <Alert
                                    variant='danger'
                                    className='border-warning-subtle p-3 position-relative'
                                >
                                    <button
                                        className='btn btn-light btn-sm position-absolute top-0 end-0 m-2'
                                        title='Copy to clipboard'
                                    >
                                        <Clipboard
                                            text={`${importSummary.invalidRel.split('||').length} ${t('Invalid releases with missing name or version')}: (${t('Not Imported')})\n${importSummary.invalidRel.split('||').join('\n')}`}
                                        />
                                    </button>
                                    <strong>{importSummary.invalidRel.split('||').length} </strong>{' '}
                                    {t('Invalid releases with missing name or version')}: ({t('Not Imported')})
                                    <ul className='mb-0'>
                                        {importSummary.invalidRel.split('||').map((comp, index) => (
                                            <li key={index}>{comp}</li>
                                        ))}
                                    </ul>
                                </Alert>
                            )}
                        </div>
                    ) : importError ? (
                        <>
                            <div className='fw-bold mb-2'>
                                {t.rich('Import Error', {
                                    fileName: selectedFile.current?.name ?? '',
                                    blue: (chunks) => <span className='text-primary'>{chunks}</span>,
                                })}
                            </div>
                            <Alert variant={importError.variant}>{importError.message}</Alert>
                        </>
                    ) : (
                        ''
                    ))}
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button
                    type='button'
                    className='btn btn-dark me-2'
                    onClick={() => closeModal()}
                >
                    {t('Close')}
                </button>
                {importState === ImportSBOMState.CONFIRM_IMPORT && (
                    <button
                        type='button'
                        className='fw-bold btn btn-primary'
                        onClick={() => void importFile()}
                    >
                        {t('Upload and Import')}
                    </button>
                )}
                {importState === ImportSBOMState.IMPORTING && (
                    <button
                        type='button'
                        className='fw-bold btn btn-primary'
                        disabled={true}
                    >
                        <span className='spinner-border spinner-border-sm me-2'></span>
                    </button>
                )}
            </Modal.Footer>
        </Modal>
    )
}

export default ImportSBOMModal
