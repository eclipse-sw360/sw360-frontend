// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction, useState } from "react"
import { Button, Modal } from "react-bootstrap"
import { BsCheck2Square } from "react-icons/bs"
import { CreateClearingRequestPayload } from "@/object-types"

interface Props {
    show?: boolean
    setShow?: Dispatch<SetStateAction<boolean>>
}

export default function ReopenClosedClearingRequestModal({ show,
                                                           setShow
                                                         }: Props) {
    const t = useTranslations('default')
    const { status } = useSession()
    const [comment] = useState('')
    // const [message] = useState('')
    // const [variant] = useState('success')
    const [reloadPage] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [createClearingRequestPayload, setCreateClearingRequestPayload] = 
                                        useState<CreateClearingRequestPayload>({
            requestedClearingDate: '',
            clearingTeam: '',
            clearingType: '',
            priority: '',
            requestingUserComment: ''
    })

    console.log(createClearingRequestPayload)
    console.log(showMessage)

    // const handleError = useCallback(() => {
    //     displayMessage('danger', t('Error when processing'))
    //     setReloadPage(true)
    // }, [t])

    // const displayMessage = (variant: string, message: string) => {
    //     setVariant(variant)
    //     setMessage(message)
    //     setShowMessage(true)
    // }

    const reopenClearingRequest = () => {
        console.log('reopen closed CR')
    }

    const handleSubmit = () => {
        reopenClearingRequest()
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
                    aria-labelledby={t('Reopen Clearing Request')}
                    scrollable
                >
                    <Modal.Header closeButton style={{ color: '#2E5AAC' }}>
                        <Modal.Title id='reopen-clearing-request-modal'>
                            <BsCheck2Square style={{ marginBottom: '5px',
                                                     color: '#2E5AAC',
                                                     fontSize: '23px'}} />
                                {' '}
                                { t('reopen clearing request')}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Footer className='justify-content-end'>
                        <Button className='btn-secondary'
                                variant='light'
                                onClick={handleCloseDialog} >
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
                            {t('Reopen Clearing Request')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )}
}