// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState, type JSX } from 'react'
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap'

import { _ } from '@/components/sw360'
import { Embedded, HttpStatus, Project, Release } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { PiCheckBold } from 'react-icons/pi'
import ProjectTable from './ProjectTable'

interface Props {
    releaseId?: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

type EmbeddedProjects = Embedded<Project, 'sw360:projects'>

const LinkReleaseToProjectModal = ({ releaseId, show, setShow }: Props): JSX.Element => {
    const t = useTranslations('default')
    const { status, data: session } = useSession()
    const searchText = useRef('')
    const linkedProjectIds = useRef<Array<string>>([])

    const [tableData, setTableData] = useState<Array<(string | JSX.Element)[]>>([])
    const [linkingReleaseName, setLinkingReleaseName] = useState('')
    const [withLinkedProject, setWithLinkedProject] = useState(true)
    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined)
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
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        if (selectedProjectId !== undefined) {
            ApiUtils.PATCH(`projects/${selectedProjectId}/releases`, [releaseId], session.user.access_token)
                .then(() => {
                    setShowMessage(true)
                })
                .catch((err) => console.error(err))
        }
    }

    const getLinkedProjects = async () => {
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const response = await ApiUtils.GET(`releases/usedBy/${releaseId}`, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = (await response.json()) as EmbeddedProjects
            if (!CommonUtils.isNullOrUndefined(data._embedded['sw360:projects'])) {
                data._embedded['sw360:projects'].forEach((project: Project) => {
                    linkedProjectIds.current.push(project._links.self.href.split('/').at(-1) ?? '')
                })
            }
        }
    }

    const changeSelection = (projectName: string, id: string) => {
        setSelectedProjectId(id)
        setSelectedProjectName(projectName)
    }

    const handleSearchProject = async () => {
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        await getLinkedProjects()

        const url = searchText.current.trim().length === 0 ? 'projects' : `projects?name=${searchText.current.trim()}`
        const projectsData: Array<(string | JSX.Element)[]> = []
        ApiUtils.GET(url, session.user.access_token)
            .then((response) => response.json())
            .then((projects: EmbeddedProjects) => {
                projects._embedded['sw360:projects'].forEach((project: Project) => {
                    if (linkedProjectIds.current.includes(project._links.self.href.split('/').at(-1) ?? '')) {
                        if (withLinkedProject === true) {
                            projectsData.push([
                                _(<PiCheckBold color='green' />) as JSX.Element,
                                project.name,
                                project.version ?? '',
                                project.state ?? '',
                                project.projectResponsible ?? '',
                                project.description ?? '',
                            ])
                        }
                    } else {
                        projectsData.push([
                            _(
                                <Form.Check
                                    type='radio'
                                    name='project'
                                    onClick={() =>
                                        changeSelection(project.name, project._links.self.href.split('/').at(-1) ?? '')
                                    }
                                />,
                            ),
                            project.name,
                            project.version ?? '',
                            project.state ?? '',
                            project.projectResponsible ?? '',
                            project.description ?? '',
                        ])
                    }
                })
                setTableData(projectsData)
            })
            .catch((err) => console.error(err))
    }

    useEffect(() => {
        if (session === null) return
        ApiUtils.GET(`releases/${releaseId}`, session.user.access_token)
            .then((response) => response.json())
            .then((release: Release) => {
                setLinkingReleaseName(`${release.name}(${release.version})`)
            })
            .catch((err) => console.error(err))
    }, [releaseId, session])

    const columns: {
        id: string
        name: string
        sort?: boolean
    }[] = [
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
        <>
            {status === 'authenticated' && (
                <Modal
                    show={show}
                    onHide={handleCloseDialog}
                    backdrop='static'
                    centered
                    size='lg'
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{t('Link Release to Project')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ overflow: 'scroll' }}>
                        <Alert
                            variant='success'
                            show={showMessage}
                        >
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
                                        <a
                                            className='link'
                                            href={`/projects/detail/${selectedProjectId}`}
                                        >
                                            {chunks}
                                        </a>
                                    ),
                                },
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
                                    <Button
                                        variant='secondary'
                                        onClick={() => void handleSearchProject()}
                                    >
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
                        <ProjectTable
                            data={tableData}
                            columns={columns}
                        />
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        {showMessage === true ? (
                            <Button
                                className='delete-btn'
                                variant='primary'
                                onClick={handleCloseDialog}
                            >
                                {' '}
                                {t('Close')}{' '}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    className='delete-btn'
                                    variant='light'
                                    onClick={handleCloseDialog}
                                >
                                    {' '}
                                    {t('Close')}{' '}
                                </Button>
                                <Button
                                    className='login-btn'
                                    variant='primary'
                                    onClick={handleLinkToProject}
                                    disabled={selectedProjectId === undefined}
                                >
                                    {t('Link To Project')}
                                </Button>
                            </>
                        )}
                    </Modal.Footer>
                </Modal>
            )}
        </>
    )
}

export default LinkReleaseToProjectModal
