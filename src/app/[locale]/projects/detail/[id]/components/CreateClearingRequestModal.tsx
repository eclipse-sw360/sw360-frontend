// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { SelectUsersDialog, ShowInfoOnHover } from "next-sw360"
import { Dispatch, SetStateAction, useCallback, useState } from "react"
import { Alert, Button, Col, Form, Modal, Row } from "react-bootstrap"
import { BsCheck2Square } from "react-icons/bs"
import { ClearingRequestDetails,
         CreateClearingRequestPayload,
         HttpStatus } from "@/object-types"
import { ApiUtils } from "@/utils/index"

interface Props {
    show?: boolean
    setShow?: Dispatch<SetStateAction<boolean>>
    projectId: string
    projectName?: string
}

interface ClearingRequestDataMap {
    [key: string]: string;
}

export default function CreateClearingRequestModal({ show,
                                                     setShow,
                                                     projectId,
                                                     projectName }: Props) {
    const t = useTranslations('default')
    const [message, setMessage] = useState('')
    const { data: session, status } = useSession()
    const [variant, setVariant] = useState('success')
    const [reloadPage, setReloadPage] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [dialogOpenClearingTeam, setDialogOpenClearingTeam] = useState(false)
    const [clearingTeamData, setClearingTeamData] = useState<ClearingRequestDataMap>({})
    const [createClearingRequestPayload, setCreateClearingRequestPayload] = 
                                        useState<CreateClearingRequestPayload>({
        requestedClearingDate: '',
        clearingTeam: '',
        clearingType: '',
        priority: 'LOW',
        requestingUserComment: ''
    })

    const updateClearingTeamData = (user: ClearingRequestDataMap) => {
        const userEmails = Object.keys(user)
        setClearingTeamData(user)
        setCreateClearingRequestPayload({
            ...createClearingRequestPayload,
            clearingTeam: userEmails[0],
        })
    }

    const handleError = useCallback(() => {
        displayMessage('danger', t('Error when processing'))
        setReloadPage(true)
    }, [t])

    const displayMessage = (variant: string, message: any) => {
        setVariant(variant)
        setMessage(message)
        setShowMessage(true)
    }

    const createClearingRequest = async () => {
        console.log('payload', createClearingRequestPayload)
        const response = await ApiUtils.POST(`projects/${projectId}/clearingRequest`,
                                              createClearingRequestPayload,
                                              session.user.access_token)
        const responseData: ClearingRequestDetails = await response.json()
        try {
            if (response.status == HttpStatus.CREATED) {
                displayMessage('success',  
                    (
                        <>
                            {t.rich('Clearing Request created successfully', {
                                id: responseData.id,
                                strong: (chunks) => <b>{chunks}</b>
                            })}
                            <br />
                            {t.rich('Clearing team will confirm on the agreed clearing date', {
                                strong: (chunks) => <b>{chunks}</b>
                            })}
                        </>
                    )
                )
                setReloadPage(true)
            } else if (response.status == HttpStatus.CONFLICT) {
                displayMessage('danger', t('Clearing request already present for project'))
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                await signOut()
            } else {
                displayMessage('danger', t('Error when processing'))
            }
        } catch (err) {
            handleError()
        }
    }

    const handleSubmit = () => {
        createClearingRequest().catch((err) => {
            console.log(err)
        })
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

    const updateInputField = (event: React.ChangeEvent<HTMLSelectElement |
                                     HTMLInputElement |
                                     HTMLTextAreaElement>) => {
        setCreateClearingRequestPayload({
            ...createClearingRequestPayload,
            [event.target.name]: event.target.value,
        })
    }
    
    const setClearingPriority = (priorityStatus: string) => {
        setCreateClearingRequestPayload({
                ...createClearingRequestPayload,
                priority: priorityStatus
            })
    }


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
                            <BsCheck2Square style={{ marginBottom: '5px',
                                                     color: '#2E5AAC',
                                                     fontSize: '23px'}} />
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
                            <Form.Group className='mb-3'>
                                <Form.Label style={{ fontWeight: 'bold' }}>
                                    {t('Please enter the clearing team email id')} :
                                    <span className='text-red'
                                          style={{ color: '#F7941E' }}>
                                        *
                                    </span>
                                </Form.Label>
                                <Form.Control
                                    type='text'
                                    id='createClearingRequest.clearingTeam'
                                    readOnly={true}
                                    name='clearingTeam'
                                    placeholder={createClearingRequestPayload.clearingTeam ? '' 
                                                 : 'Click to edit'}
                                    onClick={() => setDialogOpenClearingTeam(true)}
                                    value={ createClearingRequestPayload.clearingTeam}
                                    required
                                />
                                    <SelectUsersDialog
                                        show={dialogOpenClearingTeam}
                                        setShow={setDialogOpenClearingTeam}
                                        setSelectedUsers={updateClearingTeamData}
                                        selectedUsers={clearingTeamData}
                                        multiple={false}
                                    />
                            </Form.Group>
                            <Row className='mb-3'>                                
                                <Col md={6}>
                                    <Form.Group className='mb-2'>
                                        <Form.Label style={{ fontWeight: 'bold' }}>
                                            {t('Clearing Type')} :
                                            <span className='text-red'
                                                  style={{ color: '#F7941E' }}>
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Select
                                            id='createClearingRequest.clearingType'
                                            name='clearingType'
                                            value={createClearingRequestPayload.clearingType}
                                            onChange={updateInputField}
                                            required
                                        >
                                            <option value='' hidden></option>
                                            <option value='DEEP'>{t('Deep Level CLX')}</option>
                                            <option value='HIGH'>{t('High Level ISR')}</option>
                                        </Form.Select>
                                        <div className='form-text'
                                             id='createClearingRequest.clearingType.HelpBlock'>
                                            <ShowInfoOnHover text={t('Clearing Type Info')}/>
                                                {' '}{t('Learn more about clearing request type')}.
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className='mb-2'>
                                        <Form.Label style={{ fontWeight: 'bold' }}>
                                            {t('Preferred Clearing Date')} :
                                            <span className='text-red'
                                                  style={{ color: '#F7941E' }}>
                                                *
                                            </span>
                                        </Form.Label>
                                        <Form.Control
                                            type='date'
                                            id='createClearingRequest.requestedClearingDate'
                                            name='requestedClearingDate'
                                            value={createClearingRequestPayload?.requestedClearingDate ?? ''}
                                            onChange={updateInputField}
                                            required
                                        />
                                        <div className='form-text'
                                             id='createClearingRequest.requestedClearingDate.HelpBlock'>
                                            <ShowInfoOnHover text={t('Requested Clearing Date Info')}/>
                                                {' '}{t('Learn more about preferred clearing date')}.
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Form.Group className='mb-1' style={{ display: 'flex',
                                                                  alignItems: 'left' }}>
                                <Form.Check
                                    type='checkbox'
                                    id='createClearingRequest.priority'
                                    readOnly={true}
                                    name='priority'
                                    style={{marginTop: '1px'}}
                                    onChange={() => setClearingPriority('CRITICAL')}
                                    value={ createClearingRequestPayload.priority}
                                />
                                <Form.Label style={{ fontWeight: 'bold', marginLeft: '10px'}}>
                                    {t('Critical')}
                                </Form.Label>
                            </Form.Group>
                            <div className='subscriptionBox'
                                 style={{ textAlign: 'left',
                                          marginBottom: '20px' }}>
                                {t('Criticality selection info')}
                            </div>
                            <Form.Group className='mb-2'>
                                <Form.Label style={{ fontWeight: 'bold' }}>
                                    {t('Comments')} :
                                </Form.Label>
                                <Form.Control
                                    id='createClearingRequest.requestingUserComment'
                                    type='text'
                                    placeholder='Enter Comments'
                                    name='requestingUserComment'
                                    value={createClearingRequestPayload.requestingUserComment}
                                    onChange={updateInputField}
                                    style={{height: 'auto', textAlign: 'left'}}
                                />
                            </Form.Group>
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
                            disabled={!createClearingRequestPayload.clearingTeam ||
                                      !createClearingRequestPayload.clearingType ||
                                      !createClearingRequestPayload.requestedClearingDate}
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