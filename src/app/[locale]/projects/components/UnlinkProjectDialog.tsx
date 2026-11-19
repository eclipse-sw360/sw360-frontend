// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Modal } from 'react-bootstrap'
import { BsQuestionCircle } from 'react-icons/bs'
import { LinkedProjectData, ProjectPayload } from '@/object-types'

export default function DeleteProjectLinkConfirmationModal({
    project,
    setProject,
    setProjectPayload,
}: {
    project:
        | [
              string,
              LinkedProjectData,
          ]
        | undefined
    setProject: Dispatch<
        SetStateAction<
            | [
                  string,
                  LinkedProjectData,
              ]
            | undefined
        >
    >
    setProjectPayload: Dispatch<SetStateAction<ProjectPayload>>
}): ReactNode {
    const t = useTranslations('default')

    const handleDelete = () => {
        setProjectPayload((prev) => {
            if (!prev.linkedProjects) return prev

            const { [project?.[0] ?? '']: _, ...remainingProjects } = prev.linkedProjects

            return {
                ...prev,
                linkedProjects: remainingProjects,
            }
        })
        setProject(undefined)
    }

    return (
        <Modal
            size='lg'
            centered
            show={project !== undefined}
            onHide={() => setProject(undefined)}
            scrollable
        >
            <Modal.Header
                className='alert-danger'
                closeButton
            >
                <Modal.Title id='delete-project-link-modal'>
                    <BsQuestionCircle size={20} /> {t('Delete link to project')}?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    {t('Do you really want to remove the link to project')}{' '}
                    <b>{`${project?.[1].name ?? ''} (${project?.[1].version ?? ''})`}</b> ?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-dark'
                    onClick={() => setProject(undefined)}
                >
                    {t('Cancel')}
                </button>
                <button
                    type='button'
                    className='btn btn-danger'
                    onClick={handleDelete}
                >
                    {t('Delete Link')}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
