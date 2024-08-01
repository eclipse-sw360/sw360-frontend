// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
// import { SelectUsersDialog } from "next-sw360"
import { Dispatch, SetStateAction, useState } from "react"
import { Alert, Button, Form, Modal } from "react-bootstrap"
import { BsCheck2Square } from "react-icons/bs"
import { CreateClearingRequestPayload } from "@/object-types"

interface Props {
    show?: boolean
    setShow?: Dispatch<SetStateAction<boolean>>
    projectId: string
    projectName?: string
}

// interface ClearingRequestDataMap {
//     [key: string]: string;
// }

export default function CreateClearingRequestModal({ show,
                                                     setShow,
                                                     projectId,
                                                     projectName }: Props) {
    const t = useTranslations('default')
    const { status } = useSession()
    const [comment] = useState('')
    const [message] = useState('')
    const [variant] = useState('success')
    const [reloadPage] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    // const [dialogOpenClearingTeam, setDialogOpenClearingTeam] = useState(false)
    // const [clearingTeamData, setClearingTeamData] = useState<ClearingRequestDataMap>({})
    const [createClearingRequestPayload, setCreateClearingRequestPayload] = 
                                        useState<CreateClearingRequestPayload>({
            requestedClearingDate: '',
            clearingTeam: '',
            clearingType: '',
            priority: '',
            requestingUserComment: ''
    })

    console.log(createClearingRequestPayload)

    // const updateClearingTeamData = (user: ClearingRequestDataMap) => {
    //     const userEmails = Object.keys(user)
    //     setClearingTeamData(user)
    //     setCreateClearingRequestPayload({
    //         ...createClearingRequestPayload,
    //         clearingTeam: userEmails[0],
    //     })
    // }

    // const handleError = useCallback(() => {
    //     displayMessage('danger', t('Error when processing'))
    //     setReloadPage(true)
    // }, [t])

    // const displayMessage = (variant: string, message: string) => {
    //     setVariant(variant)
    //     setMessage(message)
    //     setShowMessage(true)
    // }

    const createClearingRequest = () => {
        console.log(projectId)
    }

    const handleSubmit = () => {
        createClearingRequest()
    }

    const handleCloseDialog = () => {
        setShow(!show)
        setShowMessage(false)
        setCreateClearingRequestPayload({
            requestedClearingDate: '',
            clearingTeam: '',
            clearingType: '',
            priority: '',
            requestingUserComment: ''
        })
        if (reloadPage === true) {
            window.location.reload()
        }
    }

    // const updateInputField = (event: React.ChangeEvent<HTMLSelectElement |
    //                                  HTMLInputElement |
    //                                  HTMLTextAreaElement>) => {
    //     setCreateClearingRequestPayload({
    //         ...createClearingRequestPayload,
    //         [event.target.name]: event.target.value,
    //     })
    // }

    if (status === 'unauthenticated') {
        signOut()
    } else {
        return (
            <>
                <Modal
                    size='lg'
                    centered
                    show={show}
                    onHide={() => {
                        setShow(false)
                    }}
                    aria-labelledby={t('Create Clearing Request')}
                    scrollable
                >
                    <Modal.Header closeButton style={{ color: '#2E5AAC' }}>
                        <Modal.Title id='create-clearing-request-modal'>
                            <BsCheck2Square style={{ marginBottom: '5px', color: '#2E5AAC', fontSize: '23px'}} />
                                {' '}
                                { t('create clearing request')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Alert variant={variant}
                            onClose={() => setShowMessage(false)}
                            show={showMessage}
                            dismissible>
                            {message}
                        </Alert>
                        <Form>
                            <Form.Group>
                                <Form.Label className='mb-1'>
                                    {t('Fill the form to create clearing request for project')}
                                    <b>{' '}{projectName}</b>
                                </Form.Label>
                                <br />
                            </Form.Group>
                            <hr />  
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button className='btn-secondary' variant='light' onClick={handleCloseDialog}>
                            {' '}
                            {t('Close')}{' '}
                        </Button>
                        <Button
                            className='login-btn'
                            variant='primary'
                            disabled={!comment}
                            onClick={() => handleSubmit()}
                            hidden={reloadPage}
                        >
                            {t('Create Request')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )}
}