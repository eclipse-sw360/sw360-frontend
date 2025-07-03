// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Embedded, HttpStatus, User } from '@/object-types'
import DownloadService from '@/services/download.service'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { SW360_API_URL } from '@/utils/env'
import { ApiUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { AdvancedSearch, Table, _ } from 'next-sw360'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState, type JSX } from 'react'
import { OverlayTrigger, Spinner, Tooltip } from 'react-bootstrap'
import { FaPencilAlt } from 'react-icons/fa'
import { TfiFiles } from 'react-icons/tfi'

const EditSecondaryDepartmentAndRolesModal = dynamic(() => import('./EditSecondaryDepartmentsAndRolesModal'), {
    ssr: false,
})

// Prevent re-rendering of the table when the open/close button of the modal is clicked
const MemoTable = React.memo(Table, () => true)

export default function UserAdminstration(): JSX.Element {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [num, setNum] = useState<number>(0)
    const router = useRouter()
    const [editingUserId, setEditingUserId] = useState<string | undefined>(undefined)
    const [departments, setDepartments] = useState<Array<string | undefined>>([])
    const [openEditSecondaryDepartmentAndRolesModal, setOpenEditSecondaryDepartmentAndRolesModal] =
        useState<boolean>(false)

    const handleAddUsers = () => {
        router.push('/admin/users/add')
    }

    const downloadUsers = () => {
        getSession()
            .then((session) => {
                DownloadService.download('importExport/downloadUsers', session, 'users.csv', { Accept: 'text/plain' })
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
    }

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) return signOut()
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === HttpStatus.OK) {
            const data = await response.json()
            return data
        } else if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Unauthorized request'))
            return
        } else {
            return undefined
        }
    }, [])

    useEffect(() => {
        void fetchData('users/departments')
            .then((departments: Array<string> | undefined) => {
                if (departments === undefined) {
                    return
                }
                if (!CommonUtils.isNullOrUndefined(departments)) {
                    setDepartments(departments)
                }
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            })
    }, [])

    const handleEditSecondaryDepartmentAndRoles = (id: string) => {
        setEditingUserId(id)
        setOpenEditSecondaryDepartmentAndRolesModal(true)
    }

    const columns = [
        {
            id: 'users.givenName',
            name: t('Given Name'),
            sort: true,
        },
        {
            id: 'users.lastName',
            name: t('Last Name'),
            sort: true,
        },
        {
            id: 'users.email',
            name: t('Email'),
            width: '20%',
            formatter: ({ email, id }: { email: string; id: string }) =>
                _(
                    <>
                        <Link
                            className={`text-link`}
                            href={`/admin/users/details/${id}`}
                        >
                            {email}
                        </Link>
                    </>,
                ),
            sort: true,
        },
        {
            id: 'users.activeStatus',
            name: t('Active status'),
            sort: true,
        },
        {
            id: 'users.primaryDepartment',
            name: t('Primary Department'),
            sort: true,
        },
        {
            id: 'users.primaryDepartmentRole',
            name: t('Primary Department Role'),
            sort: true,
        },
        {
            id: 'users.secondaryDepartmentsAndRoles',
            name: t('Secondary Departments and Roles'),
            sort: true,
            formatter: (secondaryDepartmentsAndRoles: { [key: string]: Array<string> }) =>
                _(
                    <ul className='text-break text-start'>
                        {Object.entries(secondaryDepartmentsAndRoles).map(([department, roles], index) => (
                            <li key={index}>
                                <b>{department}</b> {'->'} {roles.map((role) => t(role as never)).join(', ')}
                            </li>
                        ))}
                    </ul>,
                ),
        },
        {
            id: 'users.actions',
            name: t('Actions'),
            width: '9%',
            formatter: (id: string) =>
                _(
                    <>
                        <span className='d-flex justify-content-evenly'>
                            <OverlayTrigger overlay={<Tooltip>{t('Edit')}</Tooltip>}>
                                <Link
                                    href={`/admin/users/edit/${id}`}
                                    className='overlay-trigger'
                                >
                                    <FaPencilAlt className='btn-icon' />
                                </Link>
                            </OverlayTrigger>

                            <OverlayTrigger
                                rootClose={true}
                                overlay={<Tooltip>{t('Edit User Secondary Departments And Role')}</Tooltip>}
                            >
                                <span
                                    className='d-inline-block'
                                    onClick={() => handleEditSecondaryDepartmentAndRoles(id)}
                                >
                                    <TfiFiles className='btn-icon overlay-trigger cursor-pointer' />
                                </span>
                            </OverlayTrigger>
                        </span>
                    </>,
                ),
            sort: false,
        },
    ]

    const initServerPaginationConfig = () => {
        if (CommonUtils.isNullOrUndefined(session)) return
        return {
            url: `${SW360_API_URL}/resource/api/users`,
            then: (data: Embedded<User, 'sw360:users'>) => {
                setNum(data.page ? data.page.totalElements : 0)
                return data._embedded['sw360:users'].map((elem: User) => [
                    elem.givenName ?? '',
                    elem.lastName ?? '',
                    { email: elem.email, id: CommonUtils.getIdFromUrl(elem._links?.self.href) },
                    elem.deactivated === undefined || elem.deactivated === false ? t('Active') : t('Inactive'),
                    elem.department ?? '',
                    elem.userGroup === undefined ? t('USER') : t(elem.userGroup as never),
                    elem.secondaryDepartmentsAndRoles ?? {},
                    CommonUtils.getIdFromUrl(elem._links?.self.href),
                ])
            },
            total: (data: Embedded<User, 'sw360:users'>) => (data.page ? data.page.totalElements : 0),
            headers: { Authorization: `${session.user.access_token}` },
        }
    }

    const advancedSearch = [
        {
            fieldName: t('Given Name'),
            value: '',
            paramName: 'givenName',
        },
        {
            fieldName: t('Last Name'),
            value: '',
            paramName: 'lastName',
        },
        {
            fieldName: t('Email'),
            value: '',
            paramName: 'email',
        },
        {
            fieldName: t('Primary Department'),
            value: departments.map((department) => ({
                key: department ?? '',
                text: department ?? '',
            })),
            paramName: 'department',
        },
        {
            fieldName: t('Primary Department Role'),
            value: '',
            paramName: 'departmentRole',
        },
    ]

    return (
        <>
            <div className='container page-content'>
                <div className='row'>
                    <div className='col-lg-2'>
                        <AdvancedSearch
                            title='Advanced Search'
                            fields={advancedSearch}
                        />
                    </div>
                    <div className='col-lg-10'>
                        <div className='row d-flex justify-content-between ms-1'>
                            <div className='col-auto px-0'>
                                <button
                                    className='btn btn-primary me-2'
                                    onClick={handleAddUsers}
                                >
                                    {t('Add User')}
                                </button>
                                <button
                                    className='btn btn-primary'
                                    onClick={downloadUsers}
                                >
                                    {t('Download Users')}
                                </button>
                            </div>
                            <div className='col-auto buttonheader-title'>{`${t('Users')} (${num})`}</div>
                        </div>
                        <h5 className='mt-3 mb-1 ms-1 header-underlined'>{t('Users')}</h5>
                        {status === 'authenticated' ? (
                            <div className='ms-1'>
                                <MemoTable
                                    columns={columns}
                                    server={initServerPaginationConfig()}
                                    selector={true}
                                    sort={false}
                                />
                            </div>
                        ) : (
                            <div className='col-12 mt-1 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {editingUserId !== undefined && (
                <EditSecondaryDepartmentAndRolesModal
                    show={openEditSecondaryDepartmentAndRolesModal}
                    setShow={setOpenEditSecondaryDepartmentAndRolesModal}
                    editingUserId={editingUserId}
                />
            )}
        </>
    )
}
