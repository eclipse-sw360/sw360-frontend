// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useSearchParams } from 'next/navigation'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ChangeEvent, Dispatch, ReactNode, SetStateAction, useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { BsQuestionCircle } from 'react-icons/bs'
import { SaveUsagesPayload } from '@/object-types'
import DownloadService from '@/services/download.service'
import { ApiUtils, CommonUtils } from '@/utils'

export default function DownloadLicenseInfoModal({
    show,
    setShow,
    saveUsagesPayload,
    setShowConfirmation,
    projectId,
    isCalledFromProjectLicenseTab,
}: {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    setShowConfirmation: Dispatch<SetStateAction<boolean>>
    saveUsagesPayload: SaveUsagesPayload
    projectId: string
    isCalledFromProjectLicenseTab: boolean
}): ReactNode {
    const t = useTranslations('default')
    const params = useSearchParams()
    const [generatorClassName, setGeneratorClassName] = useState('DocxGenerator')
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const handleLicenseInfoDownload = async (projectId: string) => {
        try {
            const searchParams = Object.fromEntries(params)
            if (Object.hasOwn(searchParams, 'withSubProjects') === false) {
                return
            }
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                return signOut()
            }
            const response = await ApiUtils.POST(
                `projects/${projectId}/saveAttachmentUsages`,
                saveUsagesPayload,
                session.user.access_token,
            )
            if (response.status !== StatusCodes.CREATED) {
                return notFound()
            }
            const currentDate = new Date().toISOString().split('T')[0]
            DownloadService.download(
                `reports?withlinkedreleases=false&projectId=${projectId}&module=licenseInfo&withSubProject=${
                    searchParams.withSubProjects
                }&generatorClassName=${generatorClassName}&variant=DISCLOSURE`,
                session,
                `LicenseInfo-${currentDate}.zip`,
            )
        } catch (e) {
            console.error(e)
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
                    <div className='form-check'>
                        <input
                            id='project_clearing_report_unknown'
                            type='checkbox'
                            className='form-check-input'
                            name='unknown'
                            checked
                        />
                        <label
                            className='form-label fw-bold'
                            htmlFor='project_clearing_report_unknown'
                        >
                            {t('Unknown')}
                        </label>
                    </div>
                    <div
                        className='form-check'
                        hidden={Object.hasOwn(Object.fromEntries(params), 'withSubProjects') === false}
                    >
                        <input
                            id='project_clearing_report_contained'
                            type='checkbox'
                            className='form-check-input'
                            name='contained'
                        />
                        <label
                            className='form-label fw-bold'
                            htmlFor='project_clearing_report_contained'
                        >
                            {t('Contained')}
                        </label>
                    </div>
                    <h5 className='fw-bold'>{t('Uncheck Linked Project Relationships to be excluded')}:</h5>
                    <div
                        className='form-check'
                        hidden={Object.hasOwn(Object.fromEntries(params), 'withSubProjects') === false}
                    >
                        <input
                            id='project_clearing_report_linked_project_relation'
                            type='checkbox'
                            className='form-check-input'
                            name='is_a_subproject'
                            checked={true}
                        />
                        <label
                            className='form-label fw-bold'
                            htmlFor='project_clearing_report_linked_project_relation'
                        >
                            {t('Is a subproject')}
                        </label>
                    </div>
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
                    <div
                        className='form-check'
                        hidden={!isCalledFromProjectLicenseTab}
                    >
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
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-primary'
                        onClick={() => {
                            handleLicenseInfoDownload(projectId)
                            setShowConfirmation(true)
                            setShow(false)
                        }}
                    >
                        {t('Download')}
                    </button>
                    <button
                        className='btn btn-dark'
                        onClick={() => setShow(false)}
                    >
                        {t('Close')}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
