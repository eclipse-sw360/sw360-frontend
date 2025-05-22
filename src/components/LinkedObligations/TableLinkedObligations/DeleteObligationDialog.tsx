// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client';
import { useTranslations } from 'next-intl'

import { Button, Form, Modal } from 'react-bootstrap'

import { Obligation } from '@/object-types'
import { CommonUtils } from '@/utils'
import { BsQuestionCircle } from 'react-icons/bs'

import type { JSX } from "react";

interface Props {
    data: Array<(string | Obligation)[]>
    setData: React.Dispatch<React.SetStateAction<Array<(string | Obligation)[]>>>
    setObligationIdToLicensePayLoad: (releaseIdToRelationships: Array<string>) => void
    obligation: Obligation | undefined
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}

const DeleteObligationDialog = ({
    obligation,
    data,
    setData,
    setObligationIdToLicensePayLoad,
    show,
    setShow,
}: Props) : JSX.Element => {
    const t = useTranslations('default')

    const handleSubmit = () => {
        let obligations: Array<(string | Obligation)[]> = []
        data.forEach((element) => {
            obligations.push(element)
        })
        obligations = obligations.filter((element) => element[1] !== obligation?.title)
        setData(obligations)
        const obligationIds: string[] = []
        obligations.forEach((item) => {
            obligationIds.push(CommonUtils.getIdFromUrl((item[0] as Obligation)._links?.self.href))
        })
        setObligationIdToLicensePayLoad(obligationIds)
        setShow(!show)
    }

    const handleCloseDialog = () => {
        setShow(!show)
    }

    return (
        <>
        {
            (obligation !== undefined) && (
                <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
                    <Modal.Header style={{ backgroundColor: '#FEEFEF', color: '#da1414', fontWeight: '700' }}>
                        <h5>
                            <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                                <BsQuestionCircle />
                                &nbsp;
                                {t('Delete Obligation')}?
                            </Modal.Title>
                        </h5>
                        <button
                            type='button'
                            style={{
                                color: 'red',
                                backgroundColor: '#FEEFEF',
                                alignItems: 'center',
                                borderColor: '#FEEFEF',
                                borderWidth: '0px',
                                fontSize: '1.1rem',
                                margin: '-1rem -1rem auto',
                            }}
                            onClick={handleCloseDialog}
                        >
                            <span aria-hidden='true'>&times;</span>
                        </button>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            {t.rich('Do you really want to delete the Obligation', {
                                name: obligation.title ?? '',
                                strong: (chunks) => <b>{chunks}</b>,
                            })}
                        </Form>
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        <Button className='delete-btn' variant='light' onClick={handleCloseDialog}>
                            {t('Cancel')}
                        </Button>
                        <Button className='login-btn' variant='danger' onClick={() => handleSubmit()}>
                            {t('Delete Obligation')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            )
        }
        </>
    )
}

export default DeleteObligationDialog
