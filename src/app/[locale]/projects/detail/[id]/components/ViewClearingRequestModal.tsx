// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { signOut, useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react"
import { Button, Form, Modal } from "react-bootstrap"
import { BsCheck2Square } from "react-icons/bs"
import { ClearingRequestDetails, HttpStatus } from "@/object-types"
import { ApiUtils } from "@/utils/index"
import { notFound } from "next/navigation"
import Link from "next/link"

interface Props {
    show?: boolean
    setShow?: Dispatch<SetStateAction<boolean>>
    projectName?: string
    clearingRequestId?: string
}

export default function ViewClearingRequestModal({ show,
                                                   setShow,
                                                   projectName,
                                                   clearingRequestId }: Props) {
    const t = useTranslations('default')
    const { data: session, status } = useSession()
    const [clearingRequestData, setClearingRequestData] = useState<ClearingRequestDetails>({
        id: '',
        requestedClearingDate: '',
        projectId: '',
        projectName: '',
        requestingUser: '',
        projectBU: '',
        requestingUserComment: '',
        clearingTeam: '',
        agreedClearingDate: '',
        priority: '',
        clearingType: '',
        reOpenOn: null,
        createdOn: '',
        comments: [{}],
        _embedded: {
            "sw360:project": {
                name: '',
                version: ''
            }
        }
    })

    const fetchData = useCallback(
        async (url: string) => {
            const response = await ApiUtils.GET(url, session.user.access_token)
            if (response.status == HttpStatus.OK) {
                const data = await response.json() as ClearingRequestDetails
                return data
            } else if (response.status == HttpStatus.UNAUTHORIZED) {
                return signOut()
            } else {
                notFound()
            }
        },[session]
    )

    useEffect(() => {
        void fetchData(`clearingrequest/${clearingRequestId}`).then(
                      (clearingRequestDetails: ClearingRequestDetails) => {
                        setClearingRequestData(clearingRequestDetails)
        })}, [fetchData, session])

    const handleCloseDialog = () => {
        setShow(!show)
        setClearingRequestData({
            id: '',
            requestedClearingDate: '',
            projectId: '',
            projectName: '',
            requestingUser: '',
            projectBU: '',
            requestingUserComment: '',
            clearingTeam: '',
            agreedClearingDate: '',
            priority: '',
            clearingType: '',
            reOpenOn: null,
            createdOn: '',
            comments: [{}],
            _embedded: {
                "sw360:project": {
                    name: '',
                    version: ''
                }
            }
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
                                { t('View Clearing Request')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label className='mb-1'>
                                    {
                                        t.rich('View clearing request detail', {
                                            id: clearingRequestData.id,
                                            strong: (chunks) => 
                                            <b>
                                                <Link href={`/requests/clearingRequest/detail/${clearingRequestId}`}
                                                      className='text-link'>
                                                    {chunks}
                                                </Link>
                                            </b>
                                    })}
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
                    </Modal.Footer>
                </Modal>
            </>
        )}
}