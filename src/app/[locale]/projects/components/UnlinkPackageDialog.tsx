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
import { LinkedPackageData } from '@/object-types'

interface HasLinkedPackages {
    packageIds?: Record<string, LinkedPackageData>
}

export default function DeletePackageLinkConfirmationModal<T extends HasLinkedPackages>({
    pkg,
    setPackage,
    setPayload,
}: {
    pkg:
        | [
              string,
              LinkedPackageData,
          ]
        | undefined
    setPackage: Dispatch<
        SetStateAction<
            | [
                  string,
                  LinkedPackageData,
              ]
            | undefined
        >
    >
    setPayload: Dispatch<SetStateAction<T>>
}): ReactNode {
    const t = useTranslations('default')

    const handleDelete = () => {
        const packageId = pkg?.[0]
        if (packageId === undefined) return

        setPayload((prev) => {
            const { [packageId]: _, ...remainingPackages } = prev.packageIds ?? {}

            return {
                ...prev,
                packageIds: remainingPackages,
            }
        })
        setPackage(undefined)
    }

    return (
        <Modal
            size='lg'
            centered
            show={pkg !== undefined}
            onHide={() => setPackage(undefined)}
            scrollable
        >
            <Modal.Header
                className='alert-danger'
                closeButton
            >
                <Modal.Title id='delete-package-link-modal'>
                    <BsQuestionCircle size={20} /> {t('Delete link to package')}?
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    {t('Do you really want to remove the link to package')}{' '}
                    <b>{`${pkg?.[1].name ?? ''} (${pkg?.[1].version ?? ''})`}</b> ?
                </p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-dark'
                    onClick={() => setPackage(undefined)}
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
