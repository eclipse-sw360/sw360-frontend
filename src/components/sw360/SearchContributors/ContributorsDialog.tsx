// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { Session } from '@/object-types/Session'
import { notFound } from 'next/navigation'
import ApiUtils from '@/utils/api/api.util'
import HttpStatus from '@/object-types/enums/HttpStatus'
import { useCallback, useEffect, useState } from 'react'
import CommonUtils from '@/utils/common.utils'
import SelectTableModerators from './SelectTableContributors'
import Moderators from '@/object-types/Moderators'
import { ModeratorsType } from '@/object-types/ModeratorsType'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

interface Props {
    show?: boolean
    setShow?: React.Dispatch<React.SetStateAction<boolean>>
    session?: Session
    selectModerators?: ModeratorsType
}

const ContributorsDialog = ({ show, setShow, session, selectModerators }: Props) => {
    const t = useTranslations(COMMON_NAMESPACE)
    const [data, setData] = useState()
    const [moderators, setModerators] = useState([])
    const [moderatorsResponse, setModeratorsResponse] = useState<Moderators>()
    const [users, setUsers] = useState([])

    const handleCloseDialog = () => {
        setShow(!show)
    }

    const searchVendor = () => {
        setUsers(data)
    }

    const fetchData: any = useCallback(async (url: string) => {
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status == HttpStatus.OK) {
            const data = await response.json()
            return data
        } else {
            notFound()
        }
    }, [])

    useEffect(() => {
        fetchData(`users`).then((users: any) => {
            if (
                !CommonUtils.isNullOrUndefined(users['_embedded']) &&
                !CommonUtils.isNullOrUndefined(users['_embedded']['sw360:users'])
            ) {
                const data = users['_embedded']['sw360:users'].map((item: any) => [
                    item,
                    item.givenName,
                    item.lastName,
                    item.email,
                    item.department,
                ])
                setData(data)
            }
        })
    }, [])

    const handleClickSelectModerators = () => {
        selectModerators(moderatorsResponse)
        setShow(!show)
    }

    const getModerators: ModeratorsType = useCallback((moderators: Moderators) => setModeratorsResponse(moderators), [])

    return (
        <Modal show={show} onHide={handleCloseDialog} backdrop='static' centered size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>{t('Search User')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='modal-body'>
                    <div className='row'>
                        <div className='col-lg-8'>
                            <input
                                type='text'
                                className='form-control'
                                placeholder={t('Enter search text')}
                                aria-describedby='Search User'
                            />
                        </div>
                        <div className='col-lg-4'>
                            <button
                                type='button'
                                className={`fw-bold btn btn-light button-plain me-2`}
                                onClick={searchVendor}
                            >
                                {t('Search')}
                            </button>
                            <button type='button' className={`fw-bold btn btn-light button-plain me-2`}>
                                {t('Reset')}
                            </button>
                        </div>
                    </div>
                    <div className='row mt-3'>
                        <SelectTableModerators users={users} setModerator={getModerators} emails={moderators} />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    className={`fw-bold btn btn-light button-plain me-2`}
                    onClick={handleCloseDialog}
                >
                    {t('Close')}
                </Button>
                <Button
                    type='button'
                    className={`btn btn-primary`}
                    onClick={handleClickSelectModerators}
                >
                    {t('Select User')}
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ContributorsDialog
