// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { ReactNode, useEffect, useState } from 'react'
import { Button, Form, Modal, Table } from 'react-bootstrap'
import { ObligationElement } from '../../../../../object-types/Obligation'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onImport: (element: ObligationElement) => void
}

function ImportElementDialog({ show, setShow, onImport }: Props): ReactNode {
    const t = useTranslations('default')
    const [selectedElementIndex, setSelectedElementIndex] = useState<number>(-1)
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const obligationElements: ObligationElement[] = [
        { languageElement: 'YOU MUST NOT', action: 'Modify', object: 'License text', selected: false },
        { languageElement: 'YOU MUST', action: 'Provide', object: 'License text', selected: false },
    ]

    const handleClose = () => {
        setSelectedElementIndex(-1)
        setShow(false)
    }

    const handleImport = () => {
        if (selectedElementIndex >= 0) {
            const selectedElement = obligationElements[selectedElementIndex]
            onImport({
                languageElement: selectedElement.languageElement,
                action: selectedElement.action,
                object: selectedElement.object,
                selected: true,
            })
        }
        handleClose()
    }

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop='static'
            centered
            size='lg'
        >
            <Modal.Header closeButton>
                <Modal.Title>{t('Import Obligation Element')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table
                    bordered
                    hover
                >
                    <thead>
                        <tr style={{ backgroundColor: '#6c757d', color: 'white' }}>
                            <th style={{ width: '10%' }}>Select</th>
                            <th style={{ width: '30%' }}>Language Element</th>
                            <th style={{ width: '30%' }}>Action</th>
                            <th style={{ width: '30%' }}>Object</th>
                        </tr>
                    </thead>
                    <tbody>
                        {obligationElements.map((element, index) => (
                            <tr key={index}>
                                <td style={{ textAlign: 'center' }}>
                                    <Form.Check
                                        type='radio'
                                        name='obligationElement'
                                        checked={index === selectedElementIndex}
                                        onChange={() => setSelectedElementIndex(index)}
                                    />
                                </td>
                                <td>{element.languageElement}</td>
                                <td>{element.action}</td>
                                <td>{element.object}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant='secondary'
                    onClick={handleClose}
                >
                    Close
                </Button>
                <Button
                    variant='warning'
                    onClick={handleImport}
                    disabled={selectedElementIndex === -1}
                >
                    Import Obligation Element
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ImportElementDialog
