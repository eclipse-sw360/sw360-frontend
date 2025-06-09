// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import UserEditForm from '@/components/UserEditForm/UserEditForm'
import UserOperationType from '@/components/UserEditForm/UserOperationType'
import { HttpStatus, UserPayload } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils } from '@/utils'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState, type JSX } from 'react'

export default function CreateUser(): JSX.Element {
    const t = useTranslations('default')
    const [user, setUser] = useState<UserPayload>({
        email: '',
        givenName: '',
        lastName: '',
        department: '',
        fullName: '',
        password: '',
        secondaryDepartmentsAndRoles: {},
    })
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => {
        setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            const session = await getSession()
            if (!session) {
                return signOut()
            }
            user.fullName = `${user.givenName} ${user.lastName}`
            const response = await ApiUtils.POST('users', user, session.user.access_token)
            if (response.status == HttpStatus.CREATED) {
                MessageService.success(t('User is created'))
                router.push('/admin/users')
            } else if (response.status === HttpStatus.UNAUTHORIZED) {
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

    const handleCancel = () => {
        router.push('/admin/users')
    }

    return (
        <form
            className='mx-5 mt-3'
            onSubmit={(event) => {
                handleCreateUser(event).catch((error) => console.error(error))
            }}
            autoCapitalize='nope'
        >
            <div className='row mb-4'>
                <button
                    className='btn btn-primary col-auto me-2'
                    type='submit'
                >
                    {t('Create User')}
                </button>
                <button
                    className='btn btn-light col-auto'
                    onClick={handleCancel}
                    type='button'
                >
                    {t('Cancel')}
                </button>
            </div>
            <UserEditForm
                userPayload={user}
                setUserPayload={setUser}
                handleChange={handleChange}
                userOperationType={UserOperationType.CREATE}
            />
        </form>
    )
}
