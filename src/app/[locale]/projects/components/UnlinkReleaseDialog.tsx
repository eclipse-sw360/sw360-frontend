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
import { LinkedReleaseData, ProjectPayload } from '@/object-types'

export default function DeleteReleseLinkConfirmationModal({
    release,
    setRelease,
    setProjectPayload,
}: {
    release:
        | [
              string,
              LinkedReleaseData,
          ]
        | undefined
    setRelease: Dispatch<
        SetStateAction<
            | [
                  string,
                  LinkedReleaseData,
              ]
            | undefined
        >
    >
    setProjectPayload: Dispatch<SetStateAction<ProjectPayload>>
}): ReactNode {
    const t = useTranslations('default')

    const handleDelete = () => {
        setProjectPayload((prev) => {
            if (!prev.linkedReleases) return prev

            const { [release?.[0] ?? '']: _, ...remainingReleases } = prev.linkedReleases

            return {
                ...prev,
                linkedReleases: remainingReleases,
            }
        })
        setRelease(undefined)
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={release !== undefined}
                onHide={() => setRelease(undefined)}
                scrollable
            >
                <Modal.Header
                    className='alert-danger'
                    closeButton
                >
                    <Modal.Title id='delete-all-license-info-modal'>
                        <BsQuestionCircle size={20} /> {t('Delete link to release')}?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {t('Do you really want to remove the link to release')}{' '}
                        <b>{`${release?.[1].name ?? ''} (${release?.[1].version ?? ''})`}</b> ?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        className='btn btn-dark'
                        onClick={() => setRelease(undefined)}
                    >
                        {t('Cancel')}
                    </button>
                    <button
                        className='btn btn-danger'
                        onClick={() => handleDelete()}
                    >
                        {t('Delete Link')}
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
