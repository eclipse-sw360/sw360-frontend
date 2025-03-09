// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useState, type JSX } from 'react';
import { Button, Modal } from 'react-bootstrap'

import { LicensePayload, Obligation } from '@/object-types'
import { CommonUtils } from '@/utils'
import styles from './CssButton.module.css'
import SelectTableLinkedObligations from './SelectTableLinkedObligations'
import { BsCheck2Square } from 'react-icons/bs'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    onReRender: () => void
    data: Array<(string | Obligation)[]>
    setData: (data: Array<(string | Obligation)[]>) => void
    obligations: Array<(string | Obligation)[]>
    licensePayload: LicensePayload
    setLicensePayload: React.Dispatch<React.SetStateAction<LicensePayload>>
}

const LinkedObligationsDialog = ({
    show,
    setShow,
    onReRender,
    data,
    setData,
    obligations,
    licensePayload,
    setLicensePayload,
}: Props) : JSX.Element => {
    const t = useTranslations('default')
    const [linkedObligationsResponse, setLinkedObligationsResponse] = useState<Array<Obligation>>([])

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const handleClickSelectObligations = () => {
        const linkedObligationsResponseData = linkedObligationsResponse.map((item: Obligation) => [
            item,
            item.title ?? '',
            !CommonUtils.isNullEmptyOrUndefinedString(item.obligationType) ? item.obligationType.charAt(0) + item.obligationType.slice(1).toLowerCase() : '',
            item,
        ])
        linkedObligationsResponseData.forEach((linkedObligations: (string | Obligation)[]) => {
            data.push(linkedObligations)
        })
        data = data.filter((v, index, a) => a.findIndex((v2) => (v2[0] as Obligation).title === (v[0] as Obligation).title) === index)
        const obligationIds: string[] = []
        data.forEach((item: (string | Obligation)[]) => {
            if (!CommonUtils.isNullOrUndefined(item[0])) {
                obligationIds.push(CommonUtils.getIdFromUrl((item[0] as Obligation)._links?.self.href))
            }
        })
        setLicensePayload({
            ...licensePayload,
            obligationDatabaseIds: obligationIds,
        })
        setData(data)
        setShow(!show)
        onReRender()
    }

    const getLinkObligations: (obligationsLink: Array<Obligation>) => void = useCallback(
        (obligationsLink: Array<Obligation>) => setLinkedObligationsResponse(obligationsLink),
        []
    )

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header style={{ backgroundColor: '#eef2fa', color: '#2e5aac' }}>
                <h5>
                    <Modal.Title style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                        <BsCheck2Square />
                        &nbsp;
                        {t('Select License Obligations to be added')}
                    </Modal.Title>
                </h5>
                <button
                    type='button'
                    style={{
                        color: '#2e5aac',
                        backgroundColor: '#eef2fa',
                        alignItems: 'center',
                        borderColor: '#eef2fa',
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
                <div className='row'>
                    <SelectTableLinkedObligations obligations={obligations} setObligations={getLinkObligations} />
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button type='button' data-bs-dismiss='modal' className='btn btn-light' onClick={handleCloseDialog}>
                    {t('Cancel')}
                </Button>
                <Button className={`${styles['btn-info']}`} type='button' onClick={handleClickSelectObligations}>
                    {t('Add')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default LinkedObligationsDialog
