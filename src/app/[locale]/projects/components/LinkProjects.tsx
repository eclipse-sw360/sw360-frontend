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
import { notFound } from 'next/navigation'
import { useRef, useState, type JSX } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

import { Table, _ } from '@/components/sw360'
import { Embedded, HttpStatus, Project } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'

type EmbeddedProject = Embedded<Project, 'sw360:projects'>

const Capitalize = (text: string) =>
    text.split('_').reduce((s, c) => s + ' ' + (c.charAt(0) + c.substring(1).toLocaleLowerCase()), '')

interface AlertData {
    variant: string
    message: JSX.Element
}

export default function LinkProjects({
    projectId,
    show,
    setShow,
}: {
    projectId: string
    show: boolean
    setShow: (show: boolean) => void
}): JSX.Element {
    const t = useTranslations('default')
    const [projectData, setProjectData] = useState<(object | string)[][] | null>(null)
    const [linkProjects, setLinkProjects] = useState<Map<string, object>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const searchValueRef = useRef<HTMLInputElement>(null)
    const topRef = useRef<HTMLDivElement | null>(null)

    const scrollToTop = () => {
        topRef.current?.scrollTo({ top: 0, left: 0 })
    }

    const columns = [
        {
            id: 'linkProjects.selectProjectCheckbox',
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
                            checked={linkProjects.has(projectId)}
                            onChange={() => handleCheckboxes(projectId)}
                        />
                    </div>,
                ),
        },
        {
            id: 'linkProjects.name',
            name: t('Name'),
            sort: true,
        },
        {
            id: 'linkProjects.version',
            name: t('Version'),
            sort: true,
        },
        {
            id: 'linkProjects.state',
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
            id: 'linkProjects.projectResponsible',
            name: t('Project Responsible'),
            sort: true,
        },
        {
            id: 'linkProjects.description',
            name: t('Description'),
            sort: true,
        },
    ]

    const handleSearch = async ({ searchValue }: { searchValue: string }) => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const url = CommonUtils.isNullEmptyOrUndefinedString(searchValue)
                ? `projects`
                : `projects?name=${searchValue}&luceneSearch=true`
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status !== HttpStatus.OK) {
                return notFound()
            }
            const data = (await response.json()) as EmbeddedProject
            const dataTableFormat =
                CommonUtils.isNullOrUndefined(data['_embedded']) &&
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                    ? []
                    : data['_embedded']['sw360:projects'].map((elem: Project) => [
                          elem['_links']['self']['href'].substring(elem['_links']['self']['href'].lastIndexOf('/') + 1),
                          elem.name,
                          elem.version ?? '',
                          { state: elem.state, clearingState: elem.clearingState },
                          elem.projectResponsible ?? '',
                          elem.description ?? '',
                      ])
            setProjectData(dataTableFormat)
        } catch (e) {
            console.error(e)
        }
    }

    const handleCheckboxes = (projectId: string) => {
        const m = new Map(linkProjects)
        if (linkProjects.has(projectId)) {
            m.delete(projectId)
        } else {
            m.set(projectId, { enableSvm: true, projectRelationship: 'CONTAINED' })
        }
        setLinkProjects(m)
    }

    const handleLinkProjects = async ({ projectId }: { projectId: string }) => {
        try {
            const data = { linkedProjects: Object.fromEntries(linkProjects) }
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) return signOut()
            const response = await ApiUtils.PATCH(`projects/${projectId}`, data, session.user.access_token)
            const res = (await response.json()) as Project
            if (response.status === HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else if (response.status === HttpStatus.FORBIDDEN || response.status === HttpStatus.BAD_REQUEST) {
                return setAlert({
                    variant: 'danger',
                    message: (
                        <>
                            <p>{t('project_cannot_be_created')}.</p>
                        </>
                    ),
                })
            } else if (response.status !== HttpStatus.OK) {
                return notFound()
            }
            setAlert({
                variant: 'success',
                message: (
                    <>
                        <p>
                            {`${t('The projects have been successfully linked to project')} `}
                            <span className='fw-bold'>{res.name}</span>.{' '}
                        </p>
                        <p>
                            {t('Click')}{' '}
                            <Link
                                href={'#'}
                                className='text-link'
                            >
                                {t('here')}
                            </Link>{' '}
                            {t('to edit the project relation')}.
                        </p>
                    </>
                ),
            })
        } catch (e) {
            console.error(e)
        }
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
                    setLinkProjects(new Map())
                }}
                aria-labelledby={t('Link Projects')}
                scrollable
            >
                <Modal.Header closeButton>
                    <Modal.Title id='linked-projects-modal'>{t('Link Projects')}</Modal.Title>
                </Modal.Header>
                <Modal.Body ref={topRef}>
                    {alert && (
                        <Alert
                            variant={alert.variant}
                            id='linkProjects.alert'
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
                                        onClick={() =>
                                            void handleSearch({ searchValue: searchValueRef.current?.value ?? '' })
                                        }
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
                            setLinkProjects(new Map())
                        }}
                    >
                        {t('Close')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={() => {
                            void handleLinkProjects({ projectId })
                            scrollToTop()
                        }}
                        disabled={linkProjects.size === 0}
                    >
                        {t('Link Projects')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
