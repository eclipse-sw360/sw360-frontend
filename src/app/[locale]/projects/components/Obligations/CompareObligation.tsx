// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { notFound } from 'next/navigation'
import { useRef, useState, type JSX } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

import { Table, _ } from '@/components/sw360'
import { HttpStatus, Project } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface AlertData {
    variant: string
    message: JSX.Element
}

export default function CompareObligation({
    show,
    setShow,
    setSelectedProjectId,
}: {
    show: boolean
    setShow: (show: boolean) => void
    setSelectedProjectId: (id: string | null) => void
}): JSX.Element {
    const t = useTranslations('default')
    const [projectData, setProjectData] = useState<(object | string)[][] | null>(null)
    const [compareProject, setCompareProject] = useState<Map<string, object>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const searchValueRef = useRef<HTMLInputElement>(null)
    const topRef = useRef(null)
    const [pid, setPid] = useState('')

    const scrollToTop = () => {
        ;(topRef.current as HTMLDivElement | null)?.scrollTo({ top: 0, left: 0 })
    }

    const columns = [
        {
            id: 'compareProject.selectProjectCheckbox',
            name: '',
            width: '8%',
            formatter: (projectId: string) =>
                _(
                    <div className='form-check'>
                        <input
                            className='form-check-input'
                            type='checkbox'
                            name='projectId'
                            value={projectId}
                            id={projectId}
                            checked={compareProject.has(projectId)}
                            onChange={() => handleCheckboxes(projectId)}
                            disabled={compareProject.size > 0 && !compareProject.has(projectId)}
                        />
                    </div>,
                ),
        },
        {
            id: 'compareProject.name',
            name: t('Name'),
            sort: true,
        },
        {
            id: 'compareProject.version',
            name: t('Version'),
            sort: true,
        },
        {
            id: 'compareProject.state',
            name: t('State'),
            width: '15%',
            formatter: ({ state, clearingState }: { state: string; clearingState: string }) =>
                _(
                    <>
                        <OverlayTrigger overlay={<Tooltip>{`${t('Project State')}: ${Capitalize(state)}`}</Tooltip>}>
                            {state === 'ACTIVE' ? (
                                <span
                                    className='badge bg-success capsule-left'
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {'PS'}
                                </span>
                            ) : (
                                <span
                                    className='badge bg-secondary capsule-left'
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {'PS'}
                                </span>
                            )}
                        </OverlayTrigger>

                        <OverlayTrigger
                            overlay={
                                <Tooltip>{`${t('Project Clearing State')}: ${Capitalize(clearingState)}`}</Tooltip>
                            }
                        >
                            {clearingState === 'OPEN' ? (
                                <span
                                    className='badge bg-danger capsule-right'
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {'CS'}
                                </span>
                            ) : clearingState === 'IN_PROGRESS' ? (
                                <span
                                    className='badge bg-warning capsule-right'
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {'CS'}
                                </span>
                            ) : (
                                <span
                                    className='badge bg-success capsule-right'
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {'CS'}
                                </span>
                            )}
                        </OverlayTrigger>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'compareProject.projectResponsible',
            name: t('Project Responsible'),
            sort: true,
        },
        {
            id: 'compareProject.description',
            name: t('Description'),
            sort: true,
        },
    ]

    const handleSearch = async ({ searchValue }: { searchValue: string }) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return
            const response = await ApiUtils.GET(
                `projects?name=${searchValue}&luceneSearch=false`,
                session.user.access_token,
            )
            if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status !== HttpStatus.OK) {
                return notFound()
            }
            const data = (await response.json()) as Project
            const dataTableFormat: (object | string)[][] = CommonUtils.isNullOrUndefined(
                data['_embedded']?.['sw360:projects'],
            )
                ? []
                : data['_embedded']['sw360:projects'].map((elem: Project) => {
                      return [
                          elem['_links']['self']['href'].substring(elem['_links']['self']['href'].lastIndexOf('/') + 1),
                          elem.name,
                          elem.version ?? '',
                          { state: elem.state ?? '', clearingState: elem.clearingState ?? '' },
                          elem.projectResponsible ?? '',
                          elem.description ?? '',
                      ]
                  })
            setProjectData(dataTableFormat)
        } catch (e) {
            console.error(e)
        }
    }

    const handleCheckboxes = (projectId: string) => {
        const m = new Map(compareProject)
        setPid(projectId)
        if (compareProject.has(projectId)) {
            m.delete(projectId)
        } else {
            m.clear()
            m.set(projectId, { enableSvm: true, projectRelationship: 'CONTAINED' })
        }
        setCompareProject(m)
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => {
                    setShow(false)
                    setProjectData(null)
                    setAlert(null)
                    setCompareProject(new Map())
                }}
                aria-labelledby={t('Link Projects')}
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id='projects-list-modal'>{t('List of Projects')}</Modal.Title>
                </Modal.Header>
                <Modal.Body ref={topRef}>
                    {alert && (
                        <Alert
                            variant={alert.variant}
                            id='compareProject.alert'
                        >
                            {alert.message}
                        </Alert>
                    )}
                    <Form>
                        <Col>
                            <Row className='mb-3'>
                                <Col xs={6}>
                                    <Form.Control
                                        type='text'
                                        placeholder={`${t('Enter Search Text')}...`}
                                        name='searchValue'
                                        ref={searchValueRef}
                                    />
                                </Col>
                                <Col xs='auto'>
                                    <Form.Group controlId='exact-match-group'>
                                        <Form.Check
                                            inline
                                            name='exact-match'
                                            type='checkbox'
                                            id='exact-match'
                                        />
                                        <Form.Label className='pt-2'>
                                            {t('Exact Match')}{' '}
                                            <sup>
                                                <FaInfoCircle />
                                            </sup>
                                        </Form.Label>
                                    </Form.Group>
                                </Col>
                                <Col xs='auto'>
                                    <Button
                                        variant='secondary'
                                        onClick={() => {
                                            void handleSearch({ searchValue: searchValueRef.current?.value ?? '' })
                                        }}
                                    >
                                        {t('Search')}
                                    </Button>
                                </Col>
                            </Row>
                            <Row>
                                {projectData && (
                                    <Table
                                        columns={columns}
                                        data={projectData}
                                        sort={false}
                                    />
                                )}
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='dark'
                        onClick={() => {
                            setShow(false)
                            setProjectData(null)
                            setAlert(null)
                            setCompareProject(new Map())
                        }}
                    >
                        {t('Close')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={() => {
                            scrollToTop()
                            setAlert({ variant: 'success', message: <>{t('Comparing')}</> })
                            setSelectedProjectId(pid)
                        }}
                        disabled={compareProject.size === 0}
                    >
                        {t('Compare')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
