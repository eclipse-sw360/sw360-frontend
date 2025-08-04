// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, User } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { PageSpinner } from 'next-sw360'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState, type JSX } from 'react'
import { Button } from 'react-bootstrap'
import { FaTrashAlt } from 'react-icons/fa'
import SecondaryDepartments from '../components/SecondaryDepartments'

type EmbeddedUsers = Embedded<User, 'sw360:users'>

const EditDepartmentPage = (): JSX.Element => {
    const t = useTranslations('default')
    const router = useRouter()
    const searchParams = useSearchParams()
    const secondaryDepartmentName = searchParams.get('name')

    const [memberEmails, setMemberEmails] = useState<string[] | undefined>(undefined)
    const [emailSuggestions, setEmailSuggestions] = useState<string[]>([])
    const allEmails = useRef<string[]>([])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const handleUpdateDepartmentMembers = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        if (memberEmails === undefined || secondaryDepartmentName === null) {
            return
        }

        if (checkNotExistingUserEmails().length > 0) {
            MessageService.error(`${t('Some emails are not existed')}: ${checkNotExistingUserEmails().join(', ')}`)
            return
        }
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const response = await ApiUtils.PATCH(
            `departments/members?departmentName=${secondaryDepartmentName}`,
            memberEmails,
            session.user.access_token,
        )
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        if (response.status !== HttpStatus.OK) {
            MessageService.error('Failed to update department members')
            return
        }
        MessageService.success('Department members updated successfully')
        router.push('/admin/departments')
    }

    const fetchDepartmentMembersEmails = useCallback(async () => {
        if (secondaryDepartmentName === null) {
            MessageService.error(t('Failed to fetch member of departments'))
            setMemberEmails([])
            return
        }
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            return signOut()
        }
        const response = await ApiUtils.GET(`departments/members`, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        }
        if (response.status !== HttpStatus.OK) {
            MessageService.error(t('Failed to fetch member of departments'))
            setMemberEmails([])
            return
        }
        const departmentsWithEmails: SecondaryDepartments = await response.json()
        const currentMemberEmails = departmentsWithEmails[secondaryDepartmentName]
        setMemberEmails(currentMemberEmails)
    }, [secondaryDepartmentName])

    const fetchSuggestionUserEmails = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            return signOut()
        }
        const response = await ApiUtils.GET(`users`, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            return signOut()
        }
        if (response.status !== HttpStatus.OK) {
            MessageService.error(t('Failed to fetch member of departments'))
            return
        }
        const users = (await response.json()) as EmbeddedUsers
        const emailSuggestionsFromRequest: string[] = users._embedded['sw360:users'].map((user) => user.email)
        setEmailSuggestions(emailSuggestionsFromRequest)
        allEmails.current = emailSuggestionsFromRequest
    }, [])

    useEffect(() => {
        fetchDepartmentMembersEmails().catch((error) => console.error(error))
        fetchSuggestionUserEmails().catch((error) => console.error(error))
    }, [])

    const addNewUser = () => {
        if (memberEmails === undefined) {
            setMemberEmails([''])
            return
        }
        setMemberEmails([...memberEmails, ''])
    }

    const changeEmail = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const changedEmail = event.target.value
        if (memberEmails === undefined) {
            return
        }
        const newMemberEmails = [...memberEmails]
        newMemberEmails[index] = changedEmail
        setMemberEmails(newMemberEmails)
    }

    const deleteEmail = (index: number) => {
        if (memberEmails === undefined) {
            return
        }
        const newMemberEmails = [...memberEmails]
        newMemberEmails.splice(index, 1)
        setMemberEmails(newMemberEmails)
    }

    const checkNotExistingUserEmails = () => {
        if (memberEmails === undefined) {
            return []
        }
        return memberEmails.filter((email) => !allEmails.current.includes(email))
    }

    return (
        <div className='container page-content'>
            {memberEmails === undefined ? (
                <PageSpinner />
            ) : (
                <form
                    onSubmit={(event) => {
                        handleUpdateDepartmentMembers(event).catch((error) => console.error(error))
                    }}
                    autoCapitalize='nope'
                >
                    <div>
                        <Button
                            variant='primary'
                            type='submit'
                        >
                            {t('Update Department')}
                        </Button>
                        <Button
                            variant='light'
                            className='mx-2'
                            onClick={() => router.push('/admin/departments')}
                        >
                            {t('Cancel')}
                        </Button>
                    </div>
                    <table className='table row'>
                        <thead className='col-12'>
                            <tr className='row'>
                                <th colSpan={2}>{`${t('Edit Department')} ${secondaryDepartmentName}`}</th>
                            </tr>
                        </thead>
                        <tbody className='col-12'>
                            {Object.entries(memberEmails).map(([index, email]) => (
                                <tr
                                    key={index}
                                    className='row'
                                >
                                    <td className='col-6'>
                                        <input
                                            list='available-email'
                                            type='email'
                                            required={true}
                                            defaultValue={email}
                                            className='form-control'
                                            onChange={(event) => changeEmail(event, parseInt(index))}
                                        />
                                    </td>
                                    <td className='col-6'>
                                        <FaTrashAlt
                                            size={20}
                                            className='btn-icon mt-2 cursor-pointer'
                                            onClick={() => deleteEmail(parseInt(index))}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <Button
                            variant='secondary'
                            onClick={addNewUser}
                        >
                            {t('Add User')}
                        </Button>
                    </div>
                    <datalist id='available-email'>
                        {Object.values(emailSuggestions)
                            .filter((email) => !memberEmails.includes(email))
                            .map((email) => (
                                <option
                                    key={email}
                                    value={email}
                                />
                            ))}
                    </datalist>
                </form>
            )}
        </div>
    )
}

export default EditDepartmentPage
