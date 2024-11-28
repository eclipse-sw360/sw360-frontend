// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, LinkedProjectData, Project, ProjectPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Table, _ } from 'next-sw360'
import { ChangeEvent, useRef, useState } from 'react'
import { Alert, Button, Col, Form, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa'

interface AlertData {
    variant: string
    message: JSX.Element
}

interface Props {
    setLinkedProjectData: React.Dispatch<React.SetStateAction<Map<string, LinkedProjectData>>>
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
    show: boolean
    setShow: (show: boolean) => void
}

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

type RowData = (
    | string
    | boolean
    | {
          state: string
          clearingState: string
      }
)[]

interface ProjectRelationship {
    enableSvm: boolean
    name: string
    projectRelationship: string
    version?: string
}

export default function LinkProjectsModal({
    setLinkedProjectData,
    projectPayload,
    setProjectPayload,
    show,
    setShow,
}: Props): JSX.Element {
    const t = useTranslations('default')
    const [projectData, setProjectData] = useState<RowData[]>([])
    const [linkProjects, setLinkProjects] = useState<Map<string, LinkedProjectData>>(new Map())
    const [alert, setAlert] = useState<AlertData | null>(null)
    const searchValueRef = useRef<HTMLInputElement>(null)
    const topRef = useRef(null)
    const isExactMatch = useRef<boolean>(false)

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
                            title=''
                            placeholder='Project Id'
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
                        <OverlayTrigger overlay={<Tooltip>{`${t('Project State')}: ${state}`}</Tooltip>}>
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
                            overlay={<Tooltip>{`${t('Project Clearing State')}: ${clearingState}`}</Tooltip>}
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

    const extractInterimProjectData = (projectId: string) => {
        for (let i = 0; i < projectData.length; i++) {
            if (projectData[i][0] === projectId) {
                return {
                    name: projectData[i][1] as string,
                    version: projectData[i][2] as string,
                    projectRelationship: 'CONTAINED',
                    enableSvm: projectData[i][6] as boolean,
                }
            }
        }
        return undefined
    }

    const handleExactMatchChange = (event: ChangeEvent<HTMLInputElement>) => {
        const isExactMatchSelected = event.target.checked
        isExactMatch.current = isExactMatchSelected
    }

    const handleSearch = async ({ searchValue }: { searchValue: string }) => {
        try {
            const queryUrl = CommonUtils.createUrlWithParams('projects', {
                name: `${searchValue}`,
                luceneSearch: `${isExactMatch.current}`,
            })
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                return
            }
            const response = await ApiUtils.GET(queryUrl, session.user.access_token)
            if (response.status !== HttpStatus.OK) {
                MessageService.error(t('Error while processing'))
                return
            }
            const data = (await response.json()) as EmbeddedProjects

            const dataTableFormat =
                CommonUtils.isNullOrUndefined(data['_embedded']) &&
                CommonUtils.isNullOrUndefined(data['_embedded']['sw360:projects'])
                    ? []
                    : data['_embedded']['sw360:projects'].map((project: Project) => [
                          CommonUtils.getIdFromUrl(project._links.self.href),
                          project.name,
                          project.version ?? '',
                          { state: project.state ?? 'ACTIVE', clearingState: project.clearingState ?? 'OPEN' },
                          project.projectResponsible ?? '',
                          project.description ?? '',
                          project.enableSvm === true,
                      ])
            setProjectData(dataTableFormat)
        } catch (e) {
            console.error(e)
        }
    }

    const projectPayloadSetter = (projectPayloadData: Map<string, ProjectRelationship>) => {
        try {
            if (projectPayloadData.size > 0) {
                const updatedProjectPayload = { ...projectPayload }
                if (updatedProjectPayload.linkedProjects === undefined) {
                    updatedProjectPayload.linkedProjects = {}
                }
                for (const [projectId, linkedProject] of projectPayloadData) {
                    updatedProjectPayload.linkedProjects[projectId] = {
                        projectRelationship: linkedProject.projectRelationship,
                        enableSvm: linkedProject.enableSvm,
                    }
                }
                setProjectPayload(updatedProjectPayload)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleCheckboxes = (projectId: string) => {
        const m = new Map(linkProjects)
        if (linkProjects.has(projectId)) {
            m.delete(projectId)
        } else {
            const interimData = extractInterimProjectData(projectId)
            if (interimData === undefined) return
            m.set(projectId, interimData)
        }
        setLinkProjects(m)
    }

    const closeModal = () => {
        setShow(false)
        setProjectData([])
        setAlert(null)
        setLinkProjects(new Map())
        isExactMatch.current = false
    }

    return (
        <Modal
            size='lg'
            centered
            show={show}
            onHide={() => {
                closeModal()
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
                                        onChange={handleExactMatchChange}
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
                            <Table
                                columns={columns}
                                data={projectData}
                                sort={false}
                            />
                        </Row>
                    </Col>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='dark'
                    onClick={() => {
                        closeModal()
                    }}
                >
                    {t('Close')}
                </Button>
                <Button
                    variant='primary'
                    onClick={() => {
                        setLinkedProjectData(linkProjects)
                        setShow(false)
                        projectPayloadSetter(linkProjects)
                    }}
                    disabled={linkProjects.size === 0}
                >
                    {t('Link Projects')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}
