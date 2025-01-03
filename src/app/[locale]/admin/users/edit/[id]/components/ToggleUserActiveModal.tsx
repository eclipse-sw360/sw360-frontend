// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ApiUtils } from '@/utils'
import { HttpStatus } from '@/object-types'

import { useTranslations } from 'next-intl'
import React from 'react'
import MessageService from '@/services/message.service'
import { Modal } from 'react-bootstrap'
import { FaRegQuestionCircle } from 'react-icons/fa'


interface Props {
    userId: string
    isUserDeactived: boolean
    showToggleActiveModal: boolean
    setShowToggleActiveModal: React.Dispatch<React.SetStateAction<boolean>>
    userEmail: string
}

const ToggleUserActiveModal = ({ userId, isUserDeactived, showToggleActiveModal, setShowToggleActiveModal, userEmail }: Props) : JSX.Element => {
    const t = useTranslations('default')
    const router = useRouter()

    const toggleUserAccount = async () => {
        try {
            const session = await getSession()
            if (!session) {
                return signOut()
            }
            const response = await ApiUtils.PATCH(`users/${userId}`, { deactivated: !isUserDeactived }, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                MessageService.success(t('Your request completed successfully'))
                router.push('/admin/users')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                MessageService.success(t('Session has expired'))
                return signOut()
            } else {
                MessageService.error(t('Something went wrong'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Modal show={showToggleActiveModal} onHide={() => setShowToggleActiveModal(false)} backdrop='static' centered size='lg'>
            <Modal.Header closeButton style={{ color: 'red' }}>
                <Modal.Title><FaRegQuestionCircle /> {isUserDeactived === true ? t('Activate User') : t('Deactivate User')} ?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    {t(`Do you really want to ${isUserDeactived ? 'activate' : 'deactivate'} the user`)} <b>{userEmail}</b>?
                </p>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <button className='btn close-btn btn-light' onClick={() => setShowToggleActiveModal(false)}>
                    {t('Close')}
                </button>
                <button className='btn btn-danger' id='submit' onClick={() => toggleUserAccount()}>
                    {isUserDeactived === true ? t('Activate User') : t('Deactivate User')}
                </button>
            </Modal.Footer>
        </Modal>
    )

}

export default ToggleUserActiveModal