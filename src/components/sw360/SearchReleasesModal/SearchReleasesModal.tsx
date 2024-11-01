// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { getSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import React, { useState, useRef } from 'react'
import { Button, Form, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'

import { HttpStatus, Embedded, ReleaseDetail } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils'
import ReleasesTable from './ReleasesTable'
import ShowInfoOnHover from '../ShowInfoOnHover/ShowInfoOnHover'
import MessageService from '@/services/message.service'

interface Props {
    projectId?: string | undefined
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    setSelectedReleases: React.Dispatch<React.SetStateAction<Array<ReleaseDetail>>>
}

type EmbeddedReleases = Embedded<ReleaseDetail, 'sw360:releases'>

const SearchReleasesModal = ({ projectId, show, setShow, setSelectedReleases }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [tableData, setTableData] = useState<(string | ReleaseDetail)[][]>([])
    const searchText = useRef<string>('')
    const isExactMatchSearch = useRef<boolean>(false)
    const [selectingReleaseOnTable, setSelectingReleaseOnTable] = useState<Array<ReleaseDetail>>([])

    const searchReleases = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const params: {[k: string]: string} = {
            allDetails: 'true',
            name: searchText.current,
            luceneSearch: (!isExactMatchSearch.current).toString()
        }

        const queryUrl = CommonUtils.createUrlWithParams(`releases`, params)
        const response = await ApiUtils.GET(queryUrl, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return
        }
        if (response.status === HttpStatus.NO_CONTENT) {
            setTableData([])
            return
        }

        const releases = await response.json() as EmbeddedReleases
        convertReleaseDetailToTableData(releases)
    }

    const getLinkedReleasesOfSubProjects = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return
        }
        const response = await ApiUtils.GET(`projects/${projectId}/subProjects/releases`, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return
        }
        if (response.status === HttpStatus.NO_CONTENT) {
            setTableData([])
            return
        }
        const releases = await response.json() as EmbeddedReleases
        convertReleaseDetailToTableData(releases)
    }

    const convertReleaseDetailToTableData = (releases: EmbeddedReleases) => {
        setSelectingReleaseOnTable([])
        if (
            !CommonUtils.isNullOrUndefined(releases['_embedded']) &&
            !CommonUtils.isNullOrUndefined(releases['_embedded']['sw360:releases'])
        ) {
            const data = releases['_embedded']['sw360:releases'].map((release: ReleaseDetail) => [
                release,
                (release.vendor) ? (release.vendor.fullName ?? '') : '',
                release,
                release,
                t(release.clearingState as never),
                (release.mainlineState !== undefined) ? t(release.mainlineState as never) : '',
            ])
            setTableData(data)
        } else {
            setTableData([])
        }
    }


    const handleClickSelectReleases = () => {
        setSelectedReleases(selectingReleaseOnTable)
        resetStatesAndClose()
    }

    const resetStatesAndClose = () => {
        searchText.current = ''
        setTableData([])
        setSelectingReleaseOnTable([])
        setShow(!show)
    }

    return (
        <Modal show={show} onHide={resetStatesAndClose} backdrop='static' centered size='xl' scrollable={true}>
            <Modal.Header closeButton>
                <Modal.Title>{t('Link Releases')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className='row'>
                    <div className='col-lg-6'>
                        <input
                            type='text'
                            className='form-control'
                            placeholder={t('Enter search text')}
                            aria-describedby='Search Users'
                            onChange={(event) => {searchText.current = event.target.value }}
                        />
                    </div>
                    <div className='col-lg-6'>
                        <button type='button' className='btn btn-secondary me-2' onClick={() => void searchReleases()}>
                            {t('Search')}
                        </button>
                        <button type='button' className='btn btn-secondary me-2' onClick={() => void getLinkedReleasesOfSubProjects()}>
                            {t('Releases of linked projects')}
                        </button>
                    </div>
                </div>
                <div className='mt-3'>
                    <Form.Check
                        id='exact-match'
                        name='exact-match'
                        className='exact-match'
                        type='checkbox'
                        label={<>{t('Exact Match')} <ShowInfoOnHover text='The search result will display elements exactly matching the input. Equivalent to using (&quot;) around
                        the search keyword.'/></>}
                        defaultChecked={false}
                        onChange={(e) => {
                            isExactMatchSearch.current = e.target.checked
                        }}
                    />
                    <ReleasesTable tableData={tableData} selectingReleaseOnTable={selectingReleaseOnTable} setSelectingReleaseOnTable={setSelectingReleaseOnTable}/>
                </div>
            </Modal.Body>
            <Modal.Footer className='justify-content-end'>
                <Button
                    type='button'
                    data-bs-dismiss='modal'
                    variant='secondary'
                    className='me-2'
                    onClick={resetStatesAndClose}
                >
                    {t('Close')}
                </Button>
                <OverlayTrigger overlay={<Tooltip>{t('Link Releases')}</Tooltip>} placement='bottom'>
                    <span className='d-inline-block'>
                        <Button type='button' variant='primary' onClick={handleClickSelectReleases} disabled={selectingReleaseOnTable.length === 0}>
                            {t('Link Releases')}
                        </Button>
                    </span>
                </OverlayTrigger>
            </Modal.Footer>
        </Modal>
    )
}

export default SearchReleasesModal
