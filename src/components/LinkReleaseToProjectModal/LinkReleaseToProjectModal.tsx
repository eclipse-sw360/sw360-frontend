// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Col, Modal, Form, Button, Row, Alert } from 'react-bootstrap'

import { _ } from '@/components/sw360'
import { ApiUtils, CommonUtils } from '@/utils'
import { HttpStatus, Session } from '@/object-types'
import { PiCheckBold } from 'react-icons/pi'
import ProjectTable from './ProjectTable'

interface Props {
    releaseId?: string
    show?: boolean
    setShow?: React.Dispatch<React.SetStateAction<boolean>>
    session: Session
}

const LinkReleaseToProjectModal = ({ releaseId, show, setShow, session }: Props) => {
    const t = useTranslations('default')
    const searchText = useRef('')
    const linkedProjectIds = useRef([])

    const [tableData, setTableData] = useState([])
    const [linkingReleaseName, setLinkingReleaseName] = useState('')
    const [withLinkedProject, setWithLinkedProject] = useState(true)
    const [selectedProjectId, setSelectedProjectId] = useState<string>(undefined)
    const [selectedProjectName, setSelectedProjectName] = useState<string>('')
    const [showMessage, setShowMessage] = useState(false)

    const handleCloseDialog = () => {
        linkedProjectIds.current = []
        setShow(false)
        setTableData([])
        setWithLinkedProject(true)
        setSelectedProjectId(undefined)
        setShowMessage(false)
        setSelectedProjectName('')
    }

    const handleLinkToProject = () => {
        if (selectedProjectId !== undefined) {
            ApiUtils.PATCH(`projects/${selectedProjectId}/releases`, [releaseId], session.user.access_token).then(
                () => {
                    setShowMessage(true)
                }
            )
        }
    }

    const getLinkedProjects = async () => {
        const response = await ApiUtils.GET(`releases/usedBy/${releaseId}`, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = await response.json()
            if (!CommonUtils.isNullOrUndefined(data._embedded['sw360:projects'])) {
                data._embedded['sw360:projects'].forEach((project: any) => {
                    linkedProjectIds.current.push(project._links.self.href.split('/').at(-1))
                })
            }
        }
    }

    const changeSelection = (projectName: string, id: string) => {
        setSelectedProjectId(id)
        setSelectedProjectName(projectName)
    }

    const handleSearchProject = async () => {
        await getLinkedProjects()

        const url = searchText.current.trim().length === 0 ? 'projects' : `projects?name=${searchText.current.trim()}`
        const projectsData: any = []
        ApiUtils.GET(url, session.user.access_token)
            .then((response) => response.json())
            .then((projects) => {
                projects._embedded['sw360:projects'].forEach((project: any) => {
                    if (linkedProjectIds.current.includes(project._links.self.href.split('/').at(-1))) {
                        if (withLinkedProject === true) {
                            projectsData.push([
                                _(<PiCheckBold color='green' />),
                                project.name,
                                project.version,
                                project.state,
                                project.responsible,
                                project.description,
                            ])
                        }
                    } else {
                        projectsData.push([
                            _(
                                <Form.Check
                                    type='radio'
                                    name='project'
                                    onClick={() =>
                                        changeSelection(project.name, project._links.self.href.split('/').at(-1))
                                    }
                                />
                            ),
                            project.name,
                            project.version,
                            project.state,
                            project.responsible,
                            project.description,
                        ])
                    }
                })
                setTableData(projectsData)
            })
    }

    useEffect(() => {
        ApiUtils.GET(`releases/${releaseId}`, session.user.access_token)
            .then((response) => response.json())
            .then((release) => {
                setLinkingReleaseName(`${release.name}(${release.version})`)
            })
    }, [releaseId, session])

    const columns = [
        {
            id: 'select',
            name: '',
            sort: false,
        },
        {
            id: 'name',
            name: t('Project Name'),
        },
        {
            id: 'version',
            name: t('Version'),
        },
        {
            id: 'state',
            name: t('State'),
        },
        {
            id: 'responsible',
            name: t('Responsible'),
        },
        {
            id: 'description',
            name: t('Description'),
        },
    ]

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Link Release to Project')}</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ overflow: 'scroll' }}>
                <Alert variant='success' show={showMessage}>
                    {t.rich('The release has been successfully linked to project', {
                        releaseName: linkingReleaseName,
                        projectName: selectedProjectName,
                        strong: (chunks) => <b>{chunks}</b>,
                    })}
                    <br />
                    {t.rich(
                        'Click here to edit the release relation as well as the project mainline state in the project',
                        {
                            link: (chunks) => (
                                <a className='link' href={`/projects/detail/${selectedProjectId}`}>
                                    {chunks}
                                </a>
                            ),
                        }
                    )}
                </Alert>
                <Form>
                    <Row>
                        <Col lg='5'>
                            <Form.Control
                                type='text'
                                placeholder={`${t('Enter text search')}...`}
                                onChange={(e) => {
                                    searchText.current = e.target.value
                                }}
                            />
                        </Col>
                        <Col lg='3'>
                            <Button variant='secondary' onClick={() => handleSearchProject()}>
                                {t('Search')}
                            </Button>
                        </Col>
                        <Col lg='4'>
                            <Form.Check
                                type='checkbox'
                                id='show-linked-project'
                                label={t('Show already linked projects')}
                                style={{ fontWeight: 'bold' }}
                                defaultChecked={withLinkedProject}
                                onClick={() => setWithLinkedProject(!withLinkedProject)}
                            />
                        </Col>
                    </Row>
                </Form>
                <br />
                <ProjectTable data={tableData} columns={columns} />
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                {showMessage === true ? (
                    <Button className='delete-btn' variant='primary' onClick={handleCloseDialog}>
                        {' '}
                        {t('Close')}{' '}
                    </Button>
                ) : (
                    <>
                        <Button className='delete-btn' variant='light' onClick={handleCloseDialog}>
                            {' '}
                            {t('Close')}{' '}
                        </Button>
                        <Button
                            className='login-btn'
                            variant='primary'
                            onClick={handleLinkToProject}
                            disabled={!selectedProjectId}
                        >
                            {t('Link To Project')}
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    )
}

export default LinkReleaseToProjectModal
