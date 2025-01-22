// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Modal, Form, Row, Col, Button } from 'react-bootstrap'
import { _ } from 'next-sw360'
import { useTranslations } from 'next-intl'
import { getSession } from 'next-auth/react'
import CommonUtils from '@/utils/common.utils'
import MessageService from '@/services/message.service'
import { ApiUtils } from '@/utils/index'
import { useState, useEffect, useMemo } from 'react'
import React from 'react'
import Table, { TableProps } from '@/components/sw360/Table/Table'

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

const compare = (preState: TableProps, nextState: TableProps) => {
    return Object.entries(preState.data ?? {}).sort().toString() === Object.entries(nextState.data ?? {}).sort().toString()
}

const MemoTable = React.memo(Table, compare)

export default function DepartmentModal({ show, setShow, department, setDepartment  }: Props) : JSX.Element {
    const t = useTranslations('default')
    const [departments, setDepartments] = useState<Department[]>([])
    const [selectingDepartment, setSelectingDepartment] = useState<string>(department || '')

    const tableData = useMemo(() => 
        departments.map((dept) => [
            dept.departmentName,
            dept.departmentName,
            dept.priority
        ])
    , [departments])

    const columns = useMemo(() => {
        return [
            {
                id: 'selectDepartmentRadio',
                name: '',
                formatter: (departmentName: string) => {
                    return _(
                        <div className='form-check d-flex justify-content-center'>
                            <input 
                                className='form-check-input' 
                                type='radio' 
                                name='departmentRadioGroup'
                                defaultChecked={departmentName == selectingDepartment}
                                onClick={() => handleDepartmentSelect(departmentName)}
                            />
                        </div>
                    )
                },
                width: '10%',
                sort: false,
            },
            {
                id: 'departmentName',
                name: t('Deparment Name'),
                width: '30%',
            },
            {
                id: 'priority',
                name: t('Priority'),
            },
        ]
    }, [show, selectingDepartment, t])

    const handleDepartmentSelect = (departmentName: string) => {
        setSelectingDepartment(departmentName)
    }

    const fetchDepartments = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const response = await ApiUtils.GET(`users/groupList`, session.user.access_token)
        const departmentGroups = await response.json() as DepartmentGroups
        
        const transformedDepartments: Department[] = [
            ...departmentGroups.primaryGrpList.map(dept => ({
                departmentName: dept,
                priority: 'PRIMARY'
            })),
            ...departmentGroups.secondaryGrpList.map(dept => ({
                departmentName: dept,
                priority: 'SECONDARY'
            }))
        ]
        
        setDepartments(transformedDepartments)
    }

    useEffect(() => {
        if (show) {
            fetchDepartments()
            setSelectingDepartment(department)
        } else {
            setSelectingDepartment('')
        }
    }, [show, department])

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
                    <Row>
                        <MemoTable
                            columns={columns}
                            data={tableData}
                            sort={false}
                        />
                    </Row>
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
                    <Button variant='dark' onClick={() => setShow(false)}>
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
