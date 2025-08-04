// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { HttpStatus } from '@/object-types'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Dispatch, SetStateAction, useCallback, useEffect, useState, type JSX } from 'react'
import { Modal } from 'react-bootstrap'

interface Props {
    show: boolean
    setShow: Dispatch<SetStateAction<boolean>>
}

const ViewLogsModal = ({ show, setShow }: Props): JSX.Element => {
    const t = useTranslations('default')
    const [logFilesDate, setLogFilesDate] = useState<string[]>([])
    const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
    const [logFileContents, setLogFileContents] = useState<string[]>([])
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [status])

    const fetchLogFiles = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            return signOut()
        }
        const response = await ApiUtils.GET('departments/logFiles', session.user.access_token)
        if (response.status !== HttpStatus.OK) {
            return
        }
        const logFiles = (await response.json()) as string[]
        const logFilesDate = Object.values(logFiles).map((logFile) => logFile.replace('.log', ''))
        logFilesDate.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        setLogFilesDate(logFilesDate)
        if (logFilesDate.length > 0) {
            setSelectedDate(logFilesDate[0])
        } else {
            setSelectedDate('')
        }
    }, [])

    const fetchLogFileContentBySelectedDate = useCallback(async () => {
        if (CommonUtils.isNullEmptyOrUndefinedString(selectedDate)) {
            return
        }
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            return signOut()
        }
        const response = await ApiUtils.GET(
            `departments/logFileContent?date=${selectedDate}`,
            session.user.access_token,
        )
        if (response.status !== HttpStatus.OK) {
            setLogFileContents([])
            return
        }
        const logFileContents = (await response.json()) as string[]
        setLogFileContents(logFileContents)
    }, [selectedDate])

    useEffect(() => {
        if (show !== true) return
        fetchLogFiles().catch((err) => console.error(err))
    }, [show])

    useEffect(() => {
        fetchLogFileContentBySelectedDate().catch((err) => console.error(err))
    }, [selectedDate])

    const onDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(event.target.value)
    }

    return (
        <div>
            <Modal
                show={show}
                onHide={() => setShow(false)}
                backdrop='static'
                centered
                size='xl'
                dialogClassName='modal-info'
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('View Logs')} </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        <label htmlFor='file-log'>
                            <b>{t('Search')}</b>
                        </label>
                        <input
                            list='file-logs'
                            type='date'
                            name='file-log'
                            id='file-log'
                            defaultValue={selectedDate}
                            className='col-sm-12 px-2'
                            disabled={selectedDate === undefined}
                            onChange={onDateChange}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className='row mt-3'>
                        <div className='col-12'>
                            <h5 className='header-underlined text-center'>
                                {t('Log file on')}: {selectedDate}
                            </h5>
                        </div>
                    </div>
                    <p className='row mt-3 log-content'>
                        {Object.values(logFileContents).map((logFileContent, index) => (
                            <span
                                className='mb-3'
                                key={index}
                            >
                                {logFileContent}
                            </span>
                        ))}
                    </p>
                </Modal.Body>
            </Modal>
            <datalist id='file-logs'>
                {logFilesDate.map((date, index) => (
                    <option
                        key={index}
                        value={date}
                    />
                ))}
            </datalist>
        </div>
    )
}

export default ViewLogsModal
