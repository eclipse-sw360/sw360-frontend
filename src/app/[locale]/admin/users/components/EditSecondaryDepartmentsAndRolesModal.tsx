// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useEffect, useState } from 'react'
import { Alert, Modal } from 'react-bootstrap'
import { BsPeopleFill } from 'react-icons/bs'
import SecondaryDepartmentsAndRoles from '@/components/UserEditForm/SecondaryDepartmentsAndRoles'
import { User, UserPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    editingUserId: string
}

function EditSecondaryDepartmentAndRolesModal({ show, setShow, editingUserId }: Props): JSX.Element {
    const t = useTranslations('default')
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
    const [updateUserPayload, setUpdateUserPayload] = useState<UserPayload>({
        secondaryDepartmentsAndRoles: undefined,
    })
    const [showSuccess, setShowSuccess] = useState<boolean>(false)
    const [isUpdateSuccess, setIsUpdateSuccess] = useState<boolean>(false)

    useEffect(() => {
        if (show === false) return
        void (async () => {
            const session = await getSession()
            if (CommonUtils.isNullOrUndefined(session)) {
                MessageService.error(t('Session has expired'))
                return signOut()
            }
            const response = await ApiUtils.GET(`users/byid/${editingUserId}`, session.user.access_token)
            if (response.status === StatusCodes.UNAUTHORIZED) {
                MessageService.error(t('Session has expired'))
                return
            }

            if (response.status !== StatusCodes.OK) {
                MessageService.error(t('Failed to fetch user data'))
                return
            }
            const user = (await response.json()) as User
            setEditingUser(user)
            setUpdateUserPayload({
                secondaryDepartmentsAndRoles: user.secondaryDepartmentsAndRoles ?? {},
            })
        })()
    }, [
        editingUserId,
        show,
    ])

    const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const session = await getSession()
            if (!session) {
                MessageService.success(t('Session has expired'))
                return
            }

            const response = await ApiUtils.PATCH(
                `users/${editingUserId}`,
                updateUserPayload,
                session.user.access_token,
            )

            if (response.status === StatusCodes.OK) {
                setShowSuccess(true)
                setIsUpdateSuccess(true)
                return
            }

            if (response.status === StatusCodes.UNAUTHORIZED) {
                MessageService.success(t('Session has expired'))
                return signOut()
            }

            MessageService.error(t('Something went wrong'))
        } catch (e) {
            console.error(e)
        }
    }

    const closeModal = (withReload = false) => {
        setShow(false)
        setEditingUser(undefined)
        setShowSuccess(false)
        setIsUpdateSuccess(false)
        setUpdateUserPayload({
            secondaryDepartmentsAndRoles: undefined,
        })
        if (withReload) {
            location.reload()
        }
    }

    return (
        <>
            {editingUser !== undefined && (
                <Modal
                    show={show}
                    onHide={() => closeModal(isUpdateSuccess)}
                    backdrop='static'
                    centered
                    size='xl'
                    dialogClassName='modal-info'
                >
                    <form
                        onSubmit={(event) => {
                            handleUpdateUser(event).catch((error) => console.error(error))
                        }}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <BsPeopleFill size={20} /> {t('Edit User Secondary Departments And Role')}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Alert
                                variant='success'
                                show={showSuccess}
                                onClose={() => setShowSuccess(false)}
                                dismissible
                            >
                                <b>SUCCESS</b>! Secondary Departments and Roles edited successfully for user :{' '}
                                <span>{editingUser.email}</span>
                            </Alert>
                            <table className='table mb-3'>
                                <thead>
                                    <tr className='row'>
                                        <th className='col-lg-6'>{t('Secondary Department')}</th>
                                        <th className='col-lg-5'>{t('Secondary Department Role')}</th>
                                        <th className='col-sm-1'>{t('Action')}</th>
                                    </tr>
                                </thead>
                            </table>
                            <SecondaryDepartmentsAndRoles
                                userPayload={updateUserPayload}
                                setUserPayload={setUpdateUserPayload}
                            />
                        </Modal.Body>
                        <Modal.Footer className='justify-content-end'>
                            {!isUpdateSuccess ? (
                                <>
                                    <button
                                        type='button'
                                        data-bs-dismiss='modal'
                                        className='me-2 btn btn-light'
                                        onClick={() => closeModal()}
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type='submit'
                                        className='btn btn-info'
                                    >
                                        {t('Save')}
                                    </button>
                                </>
                            ) : (
                                <button
                                    type='button'
                                    data-bs-dismiss='modal'
                                    className='me-2 btn btn-info'
                                    onClick={() => closeModal(true)}
                                >
                                    OK
                                </button>
                            )}
                        </Modal.Footer>
                    </form>
                </Modal>
            )}
        </>
    )
}

export default EditSecondaryDepartmentAndRolesModal
