// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { notFound, useRouter, useSearchParams } from 'next/navigation'

import { useTranslations } from 'next-intl'
import { PageSpinner } from 'next-sw360'
import { type JSX, useEffect, useState } from 'react'
import UserEditForm from '@/components/UserEditForm/UserEditForm'
import UserOperationType from '@/components/UserEditForm/UserOperationType'
import { User, UserPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { CommonUtils } from '@/utils'
import ApiUtils from '@/utils/api/authenticatedApi.util'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'
import ToggleUserActiveModal from './components/ToggleUserActiveModal'

const AdminEditUserPage = (): JSX.Element => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams.get('id')
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
        if (CommonUtils.isNullEmptyOrUndefinedString(userId)) {
            notFound()
            return
        }

        void (async () => {
            try {
                const queryUrl = `users/byid/${userId}`
                const response = await ApiUtils.GET(queryUrl)
                if (response.status === StatusCodes.UNAUTHORIZED) {
                    return dispatchSessionExpiredEvent()
                } else if (response.status !== StatusCodes.OK) {
                    return notFound()
                }
                const user = (await response.json()) as User
                setUserPayload({
                    email: user.email,
                    givenName: user.givenName,
                    lastName: user.lastName,
                    department: user.department,
                    fullName: user.fullName,
                    userGroup: user.userGroup,
                    password: '',
                    externalid: user.externalid,
                    secondaryDepartmentsAndRoles: user.secondaryDepartmentsAndRoles,
                })
                setIsUserDeactived(user.deactivated === true)
            } catch (e) {
                console.error(e)
            }
        })()
    }, [
        userId,
    ])

    if (CommonUtils.isNullEmptyOrUndefinedString(userId)) {
        return notFound()
    }

    const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            userPayload.fullName = `${userPayload.givenName} ${userPayload.lastName}`
            if (CommonUtils.isNullEmptyOrUndefinedString(userPayload.password)) {
                delete userPayload.password
            }
            const response = await ApiUtils.PATCH(`users/${userId}`, userPayload)
            if (response.status === StatusCodes.OK) {
                MessageService.success(t('Your request completed successfully'))
                router.push(`/admin/users/details?id=${encodeURIComponent(userId)}`)
            } else if (response.status === StatusCodes.UNAUTHORIZED) {
                MessageService.success(t('Session has expired'))
                return dispatchSessionExpiredEvent()
            } else if (response.status === StatusCodes.CONFLICT) {
                MessageService.error(t('User with the same email already exists'))
            } else {
                MessageService.error(t('Something went wrong'))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setUserPayload((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    const handleCancel = () => {
        router.push(`/admin/users/details?id=${encodeURIComponent(userId)}`)
    }

    return !CommonUtils.isNullEmptyOrUndefinedString(userPayload.email) ? (
        <>
            <form
                className='mx-5 mt-3'
                onSubmit={(event) => {
                    handleUpdateUser(event).catch((error) => console.error(error))
                }}
                autoCapitalize='nope'
            >
                <div className='row mb-4'>
                    <button
                        className='btn btn-primary col-auto me-2'
                        type='submit'
                    >
                        {t('Update User')}
                    </button>
                    <button
                        className='btn btn-danger col-auto me-2'
                        onClick={() => setShowToggleActiveModal(true)}
                        type='button'
                    >
                        {isUserDeactived ? t('Active User') : t('Deactive User')}
                    </button>
                    <button
                        className='btn btn-light col-auto'
                        onClick={handleCancel}
                        type='button'
                    >
                        {t('Cancel')}
                    </button>
                    <div className='col col-auto text-truncate buttonheader-title me-3'>{userPayload.email}</div>
                </div>
                <UserEditForm
                    userPayload={userPayload}
                    setUserPayload={setUserPayload}
                    handleChange={handleChange}
                    userOperationType={UserOperationType.EDIT}
                />
            </form>
            <ToggleUserActiveModal
                userId={userId}
                isUserDeactived={isUserDeactived}
                showToggleActiveModal={showToggleActiveModal}
                setShowToggleActiveModal={setShowToggleActiveModal}
                userEmail={userPayload.email}
            />
        </>
    ) : (
        <PageSpinner />
    )
}

export default AdminEditUserPage
