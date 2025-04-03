// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Form, Modal } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

interface Props {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
    projectId: string
    projectName?: string
    projectVersion?: string
}

export default function ExportProjectSbomModal({ show,
                                                 setShow,
                                                 projectId,
                                                 projectName,
                                                 projectVersion }: Props) : ReactNode {
    const t = useTranslations('default')
    console.log(projectId)

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
                    style={{ backgroundColor: '#eef2fa', color: '#2e5aac' }}
                    closeButton
                >
                    <Modal.Title id='export-project-sbom-modal'>
                        <AiOutlineQuestionCircle />
                        {t('Export Project SBOM')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        {t.rich('Do you really want to export SBOM', {
                                projectName: projectName,
                                projectVersion: projectVersion,
                                strong: (chunks) => <b>{chunks}</b>
                            })}
                    </div>
                    <div className="mb-3">
                        {t('Currently only CycloneDX SBOM export is supported')}
                    </div>
                    <Form>
                        <Form.Group className='mb-2'>
                            <Form.Label style={{ fontWeight: 'bold' }}>
                                {t('Select SBOM format')} :
                                <span className='text-red'
                                        style={{ color: '#F7941E' }}>
                                    *
                                </span>
                            </Form.Label>
                            <Form.Select
                                className='w-auto'
                                id='exportProjectSbom.sbomFormat'
                                name='sbomFormat'
                                required
                            >
                                <option value='' hidden></option>
                                <option value='XML'>{t('XML Format')}</option>
                                <option value='JSON'>{t('JSON Format')}</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-primary'
                        onClick={() => {}
                        }
                    >
                        {t('Export SBOM')}
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
