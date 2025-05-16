// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { notFound, useParams, useRouter } from 'next/navigation'
import { useEffect, useState, type JSX } from 'react';
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ApiUtils, CommonUtils } from '@/utils'
import UserOperationType from '@/components/UserEditForm/UserOperationType'
import UserEditForm from '@/components/UserEditForm/UserEditForm'
import { HttpStatus, UserPayload, User } from '@/object-types'
import { PageSpinner } from 'next-sw360'
import MessageService from '@/services/message.service'
import ToggleUserActiveModal from './components/ToggleUserActiveModal'

const AdminEditUserPage = (): JSX.Element => {
    const router = useRouter()
    const params = useParams<{ id: string}>()
    const t = useTranslations('default')
    const [userPayload, setUserPayload] = useState<UserPayload>({
        email: '',
        givenName: '',
        lastName: '',
        department: '',
        fullName: '',
        userGroup: '',
        password: '',
        secondaryDepartmentsAndRoles: {},
    })

    const [isUserDeactived, setIsUserDeactived] = useState<boolean>(true)
    const [showToggleActiveModal, setShowToggleActiveModal] = useState(false)

    useEffect(() => {
        void (async () => {
            try {
                const session = await getSession()
                if (CommonUtils.isNullOrUndefined(session))
                    return signOut()

                const queryUrl = `users/byid/${params.id}`
                const response = await ApiUtils.GET(queryUrl, session.user.access_token)
                if (response.status === HttpStatus.UNAUTHORIZED) {
                    return signOut()
                } else if (response.status !== HttpStatus.OK) {
                    return notFound()
                }
                const user = await response.json() as User
                setUserPayload({
                    email: user.email,
                    givenName: user.givenName,
                    lastName: user.lastName,
                    department: user.department,
                    fullName: user.fullName,
                    userGroup: user.userGroup,
                    password: '',
                    secondaryDepartmentsAndRoles: user.secondaryDepartmentsAndRoles,
                })
                setIsUserDeactived(user.deactivated === true)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [])

    const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const session = await getSession()
            if (!session) {
                return signOut()
            }
            userPayload.fullName = `${userPayload.givenName} ${userPayload.lastName}`
            if (CommonUtils.isNullEmptyOrUndefinedString(userPayload.password)) {
                delete userPayload.password
            }
            const response = await ApiUtils.PATCH(`users/${params.id}`, userPayload, session.user.access_token)
            if (response.status === HttpStatus.OK) {
                MessageService.success(t('Your request completed successfully'))
                router.push(`/admin/users/details/${params.id}`)
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
                MessageService.success(t('Session has expired'))
                return signOut()
            } else if (response.status === HttpStatus.CONFLICT) {
                MessageService.error(t('User with the same email already exists'))
            } else {
                MessageService.error(t('Something went wrong'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setUserPayload((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCancel = () => {
        router.push(`/admin/users/details/${params.id}`)
    }

    return (
        (!CommonUtils.isNullEmptyOrUndefinedString(userPayload.email))
            ?
                <>
                    <form className='mx-5 mt-3'
                        onSubmit={(event) => {
                            handleUpdateUser(event).catch((error) => console.error(error))
                        }}
                        autoCapitalize='nope'
                    >
                        <div className='row mb-4'>
                            <button className='btn btn-primary col-auto me-2' type='submit'>
                                {t('Update User')}
                            </button>
                            <button className='btn btn-danger col-auto me-2' onClick={() => setShowToggleActiveModal(true)} type='button'>
                                {isUserDeactived ? t('Active User') : t('Deactive User')}
                            </button>
                            <button className='btn btn-light col-auto' onClick={handleCancel} type='button'>
                                {t('Cancel')}
                            </button>
                        </div>
                        <UserEditForm userPayload={userPayload} setUserPayload={setUserPayload} handleChange={handleChange} userOperationType={UserOperationType.EDIT} />
                    </form>
                    <ToggleUserActiveModal userId={params.id}
                        isUserDeactived={isUserDeactived}
                        showToggleActiveModal={showToggleActiveModal}
                        setShowToggleActiveModal={setShowToggleActiveModal}
                        userEmail={userPayload.email}
                        />
                </>
            : <PageSpinner />
    )
}

export default AdminEditUserPage