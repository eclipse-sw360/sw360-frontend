// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { useEffect, useState, useCallback } from 'react'
import { HttpStatus, UserGroupType, UserPayload } from '@/object-types'
import { FaTrashAlt } from 'react-icons/fa'
import { ApiUtils } from '@/utils'
import MessageService from '@/services/message.service'
import { getSession } from 'next-auth/react'

interface SecondaryDepartmentAndRole {
    department: string,
    role: string
}

interface Props {
    userPayload: UserPayload
    setUserPayload: React.Dispatch<React.SetStateAction<UserPayload>>
}

const SecondaryDepartmentsAndRoles = ({ userPayload, setUserPayload }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [secondaryDepartmentsAndRoles, setSecondaryDepartmentsAndRoles] = useState<SecondaryDepartmentAndRole[]>([])
    const [availableDepartments, setAvailableDepartments] = useState<string[]>([])

    const onChangeDepartmentAndRole = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const newSecondaryDepartmentsAndRoles = [...secondaryDepartmentsAndRoles]
        newSecondaryDepartmentsAndRoles[index][e.target.name as keyof SecondaryDepartmentAndRole] = e.target.value
        setSecondaryDepartmentsAndRoles(newSecondaryDepartmentsAndRoles)
        updateUserPayload(newSecondaryDepartmentsAndRoles)
    }, [secondaryDepartmentsAndRoles])

    const onDeleteRow = useCallback((index: number) => {
        const newSecondaryDepartmentsAndRoles = [...secondaryDepartmentsAndRoles]
        newSecondaryDepartmentsAndRoles.splice(index, 1)
        setSecondaryDepartmentsAndRoles(newSecondaryDepartmentsAndRoles)
        updateUserPayload(newSecondaryDepartmentsAndRoles)
    }, [secondaryDepartmentsAndRoles])

    /* Convert the secondaryDepartmentsAndRoles from the userPayload into list
     *   E.g:
     *   - SecondaryDepartmentsAndRoles: { 'department1': [ADMIN,CLEARING_ADMIN] }
     *   =>  Converted list will be:
     *   [
     *      { department: 'department1', role: 'ADMIN' },
     *      { department: 'department1', role: 'CLEARING_ADMIN' }
     *   ]
    */
    const convertSecondaryDeptsAndRolesToList = () => {
        if (userPayload.secondaryDepartmentsAndRoles === undefined) return []

        return Object.entries(userPayload.secondaryDepartmentsAndRoles)
            .flatMap(([department, roles]) => Array.from(roles).map((role: string) => ({ department, role })))
    }

    const fetchAvailableDepartments = async () => {
        // Fetch available departments from the backend
        const session = await getSession()
        if (session === null) {
            MessageService.error(t('Session has expired'))
            return
        }

        const response = await ApiUtils.GET('users/departments', session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return
        }
        if (response.status !== HttpStatus.OK) {
            return
        }
        const departments = await response.json() as string[]
        setAvailableDepartments(departments)
    }

    useEffect(() => {
        const secondaryDeptsAndRolesListFromPayload = convertSecondaryDeptsAndRolesToList()
        setSecondaryDepartmentsAndRoles(secondaryDeptsAndRolesListFromPayload)
        void fetchAvailableDepartments()
    }, [])

    const updateUserPayload = (newSecondaryDepartmentsAndRoles: Array<SecondaryDepartmentAndRole>) => {
        const secondaryDepartmentsAndRolesMap = newSecondaryDepartmentsAndRoles.reduce((current, { department, role }) => {
            if (!(department in current)) {
                current[department] = []
            }
            if (!current[department].includes(role)) {
                current[department].push(role)
            }
            return current
        }, {} as { [key: string]: Array<string> })

        setUserPayload((prev) => ({ ...prev, secondaryDepartmentsAndRoles: secondaryDepartmentsAndRolesMap }))
    }

    return (
        <>
            {
                secondaryDepartmentsAndRoles.map((secondaryDepartmentAndRole, index) => (
                    <div className='row mb-3 px-0 pb-3 with-divider' key={index}>
                        <div className='col-lg-6'>
                            <input
                                type='text'
                                list='available-deparments'
                                name='department'
                                value={secondaryDepartmentAndRole.department}
                                onChange={(e) => onChangeDepartmentAndRole(e, index)}
                                className='form-control'
                                id={`secondaryDepartmentAndRole.department${index}`}
                                placeholder={t('Enter Secondary Department')}
                                required
                            />
                        </div>
                        <div className='col-lg-5'>
                            <select className='form-control' name='role'
                                defaultValue={secondaryDepartmentAndRole.role} required
                                onChange={(e) => onChangeDepartmentAndRole(e, index)}
                            >
                                <option value=''>{t('Select secondary department role')}</option>
                                {
                                    Object.entries(UserGroupType).map(([key, value]) =>
                                        <option key={key} value={key}>{t(value as never)}</option>
                                    )
                                }
                            </select>
                        </div>
                        <div className='col-sm-1 cursor-pointer pt-2 px-4'>
                            <FaTrashAlt size={21} className='icon action' onClick={() => onDeleteRow(index)} />
                        </div>
                    </div>

                ))
            }
            <datalist id='available-deparments'>
                {
                    Object.values(availableDepartments)
                        .map((department) => <option key={department} value={department} />)
                }
            </datalist>
            <button className='btn btn-secondary col-auto row mb-2 pb-2 px-2' type='button' onClick={() => setSecondaryDepartmentsAndRoles([...secondaryDepartmentsAndRoles, { department: '', role: '' }])}>
                {t('Click to add Secondary Department and Roles')}
            </button>
        </>
    )
}

export default SecondaryDepartmentsAndRoles