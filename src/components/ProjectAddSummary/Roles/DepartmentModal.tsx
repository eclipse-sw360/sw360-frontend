// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { StatusCodes } from 'http-status-codes'
import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { SW360Table } from 'next-sw360'
import React, { type JSX, useEffect, useMemo, useState } from 'react'
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { ErrorDetails } from '@/object-types'
import MessageService from '@/services/message.service'
import CommonUtils from '@/utils/common.utils'
import { ApiUtils } from '@/utils/index'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    setDepartment: (department: string) => void
    department: string
    multiple: boolean
}

interface DepartmentGroups {
    primaryGrpList: string[]
    secondaryGrpList: string[]
}

interface Department {
    departmentName: string
    priority: string
}

export default function DepartmentModal({ show, setShow, department, setDepartment }: Props): JSX.Element {
    const t = useTranslations('default')
    const [selectingDepartment, setSelectingDepartment] = useState<string>(department || '')
    const session = useSession()

    useEffect(() => {
        if (session.status === 'unauthenticated') {
            void signOut()
        }
    }, [
        session,
    ])

    const columns = useMemo<ColumnDef<Department>[]>(
        () => [
            {
                id: 'selectDepartmentRadio',
                cell: ({ row }) => (
                    <div className='form-check d-flex justify-content-center'>
                        <input
                            className='form-check-input'
                            type='radio'
                            checked={row.original.departmentName == selectingDepartment}
                            onClick={() => handleDepartmentSelect(row.original.departmentName)}
                        />
                    </div>
                ),
                meta: {
                    width: '10%',
                },
            },
            {
                id: 'departmentName',
                header: t('Deparment Name'),
                cell: ({ row }) => <>{row.original.departmentName}</>,
                meta: {
                    width: '40%',
                },
            },
            {
                id: 'priority',
                header: t('Priority'),
                cell: ({ row }) => <>{row.original.priority}</>,
                meta: {
                    width: '40%',
                },
            },
        ],
        [
            selectingDepartment,
            t,
        ],
    )

    const [departments, setDepartments] = useState<Department[]>([])
    const memoizedData = useMemo(
        () => departments,
        [
            departments,
        ],
    )

    const [showProcessing, setShowProcessing] = useState(false)

    useEffect(() => {
        if (session.status === 'loading') return
        const controller = new AbortController()
        const signal = controller.signal

        const timeLimit = departments.length !== 0 ? 700 : 0
        const timeout = setTimeout(() => {
            setShowProcessing(true)
        }, timeLimit)

        void (async () => {
            try {
                if (CommonUtils.isNullOrUndefined(session.data)) return signOut()
                const response = await ApiUtils.GET('users/groupList', session.data.user.access_token, signal)
                if (response.status !== StatusCodes.OK) {
                    const err = (await response.json()) as ErrorDetails
                    throw new Error(err.message)
                }

                const departmentGroups = (await response.json()) as DepartmentGroups

                const transformedDepartments: Department[] = [
                    ...departmentGroups.primaryGrpList.map((dept) => ({
                        departmentName: dept,
                        priority: 'PRIMARY',
                    })),
                    ...departmentGroups.secondaryGrpList.map((dept) => ({
                        departmentName: dept,
                        priority: 'SECONDARY',
                    })),
                ]

                setDepartments(transformedDepartments)
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return
                }
                const message = error instanceof Error ? error.message : String(error)
                MessageService.error(message)
            } finally {
                clearTimeout(timeout)
                setShowProcessing(false)
            }
        })()

        return () => controller.abort()
    }, [
        session,
    ])

    const table = useReactTable({
        data: memoizedData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const handleDepartmentSelect = (departmentName: string) => {
        setSelectingDepartment(departmentName)
    }

    return (
        <>
            <Modal
                size='lg'
                centered
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby={t('Search Department Modal')}
            >
                <Modal.Header closeButton>
                    <Modal.Title id='department-modal'>{t('Search Department')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className='mb-3'>
                        {table ? (
                            <SW360Table
                                table={table}
                                showProcessing={showProcessing}
                            />
                        ) : (
                            <div className='col-12 mt-1 text-center'>
                                <Spinner className='spinner' />
                            </div>
                        )}
                    </div>
                    <Form>
                        <Col>
                            <Row className='mb-3 d-flex justify-content-end'>
                                <Col xs={6}>
                                    <Form.Control
                                        type='text'
                                        name='department'
                                        value={selectingDepartment}
                                        readOnly
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant='dark'
                        onClick={() => setShow(false)}
                    >
                        {t('Close')}
                    </Button>
                    <Button
                        variant='primary'
                        onClick={() => {
                            setDepartment(selectingDepartment)
                            setShow(false)
                        }}
                    >
                        {t('Select')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
