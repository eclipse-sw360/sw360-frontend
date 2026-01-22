// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { useSearchParams } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ChangeEvent, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { BsQuestionCircle } from 'react-icons/bs'
import { ErrorDetails, FilterOption, SaveUsagesPayload } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

const relationFilterOptions: FilterOption[] = [
    {
        tag: 'Contained',
        value: 'CONTAINED',
    },
    {
        tag: 'Related',
        value: 'REFERRED',
    },
    {
        tag: 'Unknown',
        value: 'UNKNOWN',
    },
    {
        tag: 'Dynamically Linked',
        value: 'DYNAMICALLY_LINKED',
    },
    {
        tag: 'Statically Linked',
        value: 'STATICALLY_LINKED',
    },
    {
        tag: 'Side By Side',
        value: 'SIDE_BY_SIDE',
    },
    {
        tag: 'Standalone',
        value: 'STANDALONE',
    },
    {
        tag: 'Internal Use',
        value: 'INTERNAL_USE',
    },
    {
        tag: 'Optional',
        value: 'OPTIONAL',
    },
    {
        tag: 'To Be Replaced',
        value: 'TO_BE_REPLACED',
    },
    {
        tag: 'Code Snippet',
        value: 'CODE_SNIPPET',
    },
]

export default function DownloadLicenseInfoModal({
    show,
    setShow,
    saveUsagesPayload,
    setShowConfirmation,
    projectId,
    isCalledFromProjectLicenseTab,
    projectRelationships,
}: {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    setShowConfirmation: Dispatch<SetStateAction<boolean>>
    saveUsagesPayload: SaveUsagesPayload
    projectId: string
    isCalledFromProjectLicenseTab: boolean
    projectRelationships: string[]
}): ReactNode {
    const t = useTranslations('default')
    const params = useSearchParams()
    const [generatorClassName, setGeneratorClassName] = useState('DocxGenerator')
    const [withSubProject, setWithSubProject] = useState(true)
    const [selectedRelRelationship, setSelectedRelRelationship] = useState<string[]>([])
    const session = useSession()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            signOut()
        }
    }, [
        session,
    ])

    useEffect(() => {
        if (Object.hasOwn(Object.fromEntries(params), 'withSubProjects') === false) {
            setWithSubProject(false)
        }
    }, [
        params,
    ])

    useEffect(() => {
        setSelectedRelRelationship(projectRelationships)
    }, [
        projectRelationships,
    ])

    const handleLicenseInfoDownload = async (projectId: string) => {
        try {
            if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
            setLoading(true)
            const response = await ApiUtils.POST(
                `projects/${projectId}/saveAttachmentUsages`,
                saveUsagesPayload,
                session.data.user.access_token,
            )
            if (response.status !== StatusCodes.CREATED) {
                const err = (await response.json()) as ErrorDetails
                throw new Error(err.message)
            }
            const currentDate = new Date().toISOString().split('T')[0]
            const downloadUrl = CommonUtils.createUrlWithParams(`reports`, {
                withlinkedreleases: 'false',
                projectId,
                module: 'licenseInfo',
                withSubProject: withSubProject ? 'true' : 'false',
                generatorClassName,
                variant: 'DISCLOSURE',
                selectedRelRelationship,
            })
            const downloadStatus = await DownloadService.download(
                downloadUrl,
                session.data,
                `LicenseInfo-${currentDate}.zip`,
            )
            if (downloadStatus === StatusCodes.OK) {
                setShowConfirmation(true)
                setShow(false)
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                return
            }
            const message = error instanceof Error ? error.message : String(error)
            MessageService.error(message)
        } finally {
            setLoading(false)
        }
    }

    const onOptionChange = (e: ChangeEvent<HTMLInputElement>) => setGeneratorClassName(e.target.value)

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => setShow(false)}
                scrollable
            >
                <Modal.Header
                    style={{
                        backgroundColor: '#eef2fa',
                        color: '#2e5aac',
                    }}
                    closeButton
                >
                    <Modal.Title id='generate-license-info-modal'>
                        <BsQuestionCircle size={20} /> {t('Select Other Options')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5 className='fw-bold'>{t('Uncheck project release relationships to be excluded')}:</h5>
                    {relationFilterOptions
                        .filter((fil) => projectRelationships.indexOf(fil.value) !== -1)
                        .map((fil) => (
                            <div
                                className='form-check'
                                key={fil.value}
                            >
                                <input
                                    type='checkbox'
                                    className='form-check-input'
                                    onChange={() => {
                                        const ind = selectedRelRelationship.indexOf(fil.value)
                                        if (ind !== -1) {
                                            const newSelectedRelRelationship = selectedRelRelationship.toSpliced(ind, 1)
                                            setSelectedRelRelationship(newSelectedRelRelationship)
                                        } else {
                                            const newSelectedRelRelationship = [
                                                ...selectedRelRelationship,
                                                fil.value,
                                            ]
                                            setSelectedRelRelationship(newSelectedRelRelationship)
                                        }
                                    }}
                                    checked={selectedRelRelationship.indexOf(fil.value) !== -1}
                                />
                                <label
                                    className='form-label fw-bold'
                                    htmlFor='project_clearing_report_unknown'
                                >
                                    {fil.tag}
                                </label>
                            </div>
                        ))}
                    {Object.hasOwn(Object.fromEntries(params), 'withSubProjects') === true && (
                        <>
                            <h5 className='fw-bold'>{t('Uncheck Linked Project Relationships to be excluded')}:</h5>
                            <div className='form-check'>
                                <input
                                    id='project_clearing_report_linked_project_relation'
                                    type='checkbox'
                                    className='form-check-input'
                                    checked={withSubProject}
                                    onChange={() => setWithSubProject(!withSubProject)}
                                />
                                <label
                                    className='form-label fw-bold'
                                    htmlFor='project_clearing_report_linked_project_relation'
                                >
                                    {t('Is a subproject')}
                                </label>
                            </div>
                        </>
                    )}
                    <h5 className='fw-bold'>{t('Select output format')}:</h5>
                    <div className='form-check'>
                        <input
                            type='radio'
                            name='generatorClassName'
                            value='DocxGenerator'
                            id='DocxGenerator'
                            checked={generatorClassName === 'DocxGenerator'}
                            onChange={onOptionChange}
                            className='form-check-input'
                        />
                        <label
                            className='form-check-label'
                            htmlFor='DocxGenerator'
                        >
                            {t('License Disclosure as DOCX')}
                        </label>
                    </div>
                    <div
                        className='form-check'
                        hidden={!isCalledFromProjectLicenseTab}
                    >
                        <input
                            type='radio'
                            name='generatorClassName'
                            value='XhtmlGenerator'
                            id='XhtmlGenerator'
                            checked={generatorClassName === 'XhtmlGenerator'}
                            onChange={onOptionChange}
                            className='form-check-input'
                        />
                        <label
                            className='form-check-label'
                            htmlFor='XhtmlGenerator'
                        >
                            {t('License Disclosure as XHTML')}
                        </label>
                    </div>
                    {isCalledFromProjectLicenseTab && (
                        <div className='form-check'>
                            <input
                                type='radio'
                                name='generatorClassName'
                                value='TextGenerator'
                                id='TextGenerator'
                                checked={generatorClassName === 'TextGenerator'}
                                onChange={onOptionChange}
                                className='form-check-input'
                            />
                            <label
                                className='form-check-label'
                                htmlFor='TextGenerator'
                            >
                                {t('License Disclosure as TEXT')}
                            </label>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-primary'
                        onClick={() => {
                            handleLicenseInfoDownload(projectId)
                        }}
                        disabled={loading}
                    >
                        {t('Download')}
                    </button>
                    <button
                        className='btn btn-dark'
                        onClick={() => setShow(false)}
                        disabled={loading}
                    >
                        {t('Close')}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
