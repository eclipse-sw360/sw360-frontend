// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

"use client"

import { Modal, Form, Row, Col, Button } from "react-bootstrap"
import { _, Table } from "@/components/sw360"
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

interface DepartmentType {
    departmentId: string;
    departmentName: string;
    priority: string;
}

export default function DepartmentModal({ show, setShow }: {
    show: boolean,
    setShow: (show: boolean) => void
}) {

    const t = useTranslations(COMMON_NAMESPACE)

    const columns = [
        {
            id: 'selectDepartmentRadio',
            name: '',
            formatter: (departmentId: string) =>
            _(
                  <div className="form-check d-flex justify-content-center">
                      <input className="form-check-input" type="radio" name="department" id={departmentId}/>
                  </div>
            ),
            width: "10%"
        },
        {
            id: 'departmentName',
            name: t('Deparment Name'),
            width: "30%"
        },
        {
            id: 'priority',
            name: t('Priority')
        },
    ]

    const data: DepartmentType[] = []

    return (
        <>
            <Modal
                size="lg"
                centered
                show={show}
                onHide={() => setShow(false)}
                aria-labelledby={t('Search Department Modal')}
            >
                <Modal.Header closeButton>
                    <Modal.Title id="department-modal">
                        {t('Search Department')}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Table
                            columns={columns}
                            data={data.map((data) => [data.departmentId, data.departmentName, data.priority])}
                        />
                    </Row>
                    <Form>
                        <Col>
                            <Row className="mb-3 d-flex justify-content-end">
                                <Col xs={6}>
                                    <Form.Control type="text" name="department"/>
                                </Col>                    
                            </Row>
                        </Col>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={() => setShow(false)}>{t('Close')}</Button>
                    <Button variant="primary" onClick={() => { setShow(false) }}>{t('Select')}</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}