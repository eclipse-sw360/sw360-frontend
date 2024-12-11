// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus, Project } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import { signOut, getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { AiOutlineQuestionCircle } from 'react-icons/ai'

interface Data {
    attachment?: number
    project?: number
    release?: number
    package?: number
}

interface Props {
    projectId: string
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

function DeleteProjectDialog ({ projectId, show, setShow }: Props): JSX.Element {
    const t = useTranslations('default')
    const router = useRouter()
    const [project, setProject] = useState<Project>()
    const [internalData, setInternalData] = useState<Data>({ attachment: 0, project: 0, release: 0, package: 0 })
    const [variant, setVariant] = useState('success')
    const [message, setMessage] = useState('')
    const [showMessage, setShowMessage] = useState(false)
    const [reloadPage, setReloadPage] = useState(false)
    const [visuallyHideLinkedData, setVisuallyHideLinkedData] = useState(true)
    // Comment functionality is not implemented yet. This feature should be added in the future.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [comment, setComment] = useState('')

    const displayMessage = (variant: string, message: string) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const handleError = useCallback(() => {
        displayMessage('danger', t('Error when processing'))
        setReloadPage(true)
    }, [t])

    const deleteProject = async () => {
        try {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return
            const response = await ApiUtils.DELETE(`projects/${projectId}`, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                displayMessage('success', t('Delete project successful!'))
                router.push('/projects')
                setReloadPage(true)
            } else if (response.status == HttpStatus.ACCEPTED) {
                displayMessage('info', t('Moderation request is created!'))
            } else if (response.status == HttpStatus.CONFLICT) {
                displayMessage('danger', t('The project cannot be deleted, since it is used by another project!'))
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                displayMessage('danger', t('Error when processing'))
            }
        } catch (err) {
            handleError()
        }
    }

    useEffect(() => {
        const fetchData = async (projectId: string) => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session))
                return
            const projectsResponse = await ApiUtils.GET(`projects/${projectId}`, session.user.access_token)
            if (projectsResponse.status == HttpStatus.OK) {
                const projectData = (await projectsResponse.json()) as Project
                setProject(projectData)
                handleInternalDataCount(projectData)
            } else if (projectsResponse.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                handleError()
            }
        }

        fetchData(projectId).catch((err) => {
            console.error(err)
        })
    }, [show, projectId, handleError])

    const handleSubmit = () => {
        deleteProject().catch((err) => {
            console.log(err)
        })
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setShowMessage(false)
        setComment('')
        setVisuallyHideLinkedData(!visuallyHideLinkedData)
        if (reloadPage === true) {
            window.location.reload()
        }
    }

    const handleInternalDataCount = (projectData: Project) => {
        const dataCount: Data = {}
        if (projectData._embedded?.['sw360:attachments']) {
            dataCount.attachment = projectData._embedded['sw360:attachments'].length
            setVisuallyHideLinkedData(false)
        }
        if (projectData._embedded?.['sw360:projects']) {
            dataCount.project = projectData._embedded['sw360:projects'].length
            setVisuallyHideLinkedData(false)
        }
        if (projectData._embedded?.['sw360:releases']) {
            dataCount.release = projectData._embedded['sw360:releases'].length
            setVisuallyHideLinkedData(false)
        }
        if (projectData._embedded?.['sw360:packages']) {
            dataCount.package = projectData._embedded['sw360:packages'].length
            setVisuallyHideLinkedData(false)
        }
        setInternalData(dataCount)
    }

    const handleUserComment = (e: ChangeEvent<HTMLInputElement>) => {
        setComment(e.target.value)
    }

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton style={{ color: 'red' }}>
                <Modal.Title>
                    <AiOutlineQuestionCircle style={{ marginBottom: '5px' }} />
                    {t('Delete Project')} ?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <>
                    {
                        project === undefined ?
                        <div className='col-12 mt-1 text-center'>
                            <Spinner className='spinner' />
                        </div>:
                        <>
                            <Alert variant={variant} onClose={() => setShowMessage(false)} dismissible show={showMessage}>
                                {message}
                            </Alert>
                            <Form>
                                <Form.Group>
                                    <Form.Label className='mb-3'>
                                        {t.rich('Do you really want to delete the project?', {
                                            name: project.name,
                                            strong: (data) => <b>{data}</b>,
                                        })}
                                    </Form.Label>
                                    <br />
                                    <Form.Label className='mb-1' visuallyHidden={visuallyHideLinkedData}>
                                        {t.rich('This project contains', {
                                            name: project.name,
                                            strong: (data) => <b>{data}</b>,
                                            visuallyHideLinkedData,
                                        })}
                                        <ul>
                                            {Object.entries(internalData).map(([key, value]) => (
                                                <li key={key}>{`${value} linked ${key}`}</li>
                                            ))}
                                        </ul>
                                    </Form.Label>
                                </Form.Group>
                                <hr />
                                <Form.Group className='mb-3'>
                                    <Form.Label style={{ fontWeight: 'bold' }}>{t('Please comment your changes')}</Form.Label>
                                    <Form.Control
                                        as='textarea'
                                        aria-label='With textarea'
                                        placeholder='Comment your message...'
                                        onChange={handleUserComment}
                                    />
                                </Form.Group>
                            </Form>
                        </>
                    }
                </>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button className='delete-btn' variant='light' onClick={handleCloseDialog}>
                    {' '}
                    {t('Close')}{' '}
                </Button>
                <Button
                    className='login-btn'
                    variant='danger'
                    onClick={() => handleSubmit()}
                    hidden={reloadPage}
                >
                    {t('Delete Project')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteProjectDialog
