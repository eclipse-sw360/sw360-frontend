// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession, signOut, useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { type JSX, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, Button, Modal } from 'react-bootstrap'
import { Attachment, FossologyProcessInfo, FossologyProcessStatus, ReleaseDetail } from '@/object-types'
import MessageService from '@/services/message.service'
import { ApiUtils, CommonUtils } from '@/utils'

interface Props {
    show: boolean
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    releaseId: string
}

const clearingMessages: {
    [key: string]: {
        [key: string]: string
    }
} = {
    NUMBER_OF_ATTACHMENTS_NOT_MATCH: {
        message: 'number_of_attachments_not_match_condition',
        variant: 'danger',
    },
    CLEARING_SUCCESS: {
        message: 'fossology_clearing_finished',
        variant: 'success',
    },
    ERROR_PROCESSING: {
        message: 'Error when processing!',
        variant: 'danger',
    },
    SET_OUTDATED: {
        message: 'fossology_process_outdated',
        variant: 'success',
    },
}

interface Message {
    content: string
    variant: string
    show: boolean
}

const FossologyClearing = ({ show, setShow, releaseId }: Props): JSX.Element => {
    const t = useTranslations('default')
    const STEP_PERCENT = 16.66
    const PERCENT_DONE = 99.96
    const RELOAD_ATTACHMENTS_PERCENT = 66.46
    const progressInterval = useRef<number | undefined>(undefined)
    const countDownInterval = useRef<number | undefined>(undefined)
    const numberOfSourceAttachment = useRef(0)

    const [timeInterval, setTimeInterval] = useState<number>(5)
    const [release, setRelease] = useState<ReleaseDetail | undefined>(undefined)
    const [confirmShow, setConfirmShow] = useState(false)

    const [message, setMessage] = useState<Message>({
        content: '',
        variant: 'success',
        show: false,
    })

    const [progressStatus, setProgressStatus] = useState({
        percent: 0,
        stepName: '',
    })
    const { status } = useSession()

    useEffect(() => {
        if (status === 'unauthenticated') {
            signOut()
        }
    }, [
        status,
    ])

    const resetTimeCountDown = () => {
        setTimeInterval(5)
    }

    const clearAllInterval = useCallback(() => {
        if (countDownInterval.current !== undefined) {
            clearInterval(countDownInterval.current)
            countDownInterval.current = undefined
        }

        if (progressInterval.current !== undefined) {
            clearInterval(progressInterval.current)
            progressInterval.current = undefined
        }
        resetTimeCountDown()
    }, [])

    const fetchData = useCallback(async (url: string) => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === StatusCodes.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return undefined
        } else if (response.status === StatusCodes.OK) {
            const data = (await response.json()) as ReleaseDetail & FossologyProcessStatus
            return data
        } else {
            return undefined
        }
    }, [])

    const fetchRelease = useCallback(() => {
        const url = `releases/${releaseId}`
        fetchData(url)
            .then((data: ReleaseDetail | undefined) => {
                if (data === undefined) return
                setRelease(data)
                numberOfSourceAttachment.current = countSourceAttachment(data._embedded['sw360:attachments'])
                if (!isClearingAllowed()) {
                    clearAllInterval()
                    showMessage(clearingMessages.NUMBER_OF_ATTACHMENTS_NOT_MATCH)
                    setProgressStatus({
                        percent: 0,
                        stepName: '',
                    })
                    return
                }
            })
            .catch((err) => console.error(err))
    }, [
        releaseId,
        clearAllInterval,
        fetchData,
    ])

    const handleCloseDialog = () => {
        hideMessage()
        clearAllInterval()
        setProgressStatus({
            percent: 0,
            stepName: '',
        })
        setRelease(undefined)
        setShow(false)
    }

    const handleOutdated = async () => {
        await handleFossologyClearing({
            markFossologyProcessOutdated: 'true',
        })
        showMessage(clearingMessages.SET_OUTDATED)
        setConfirmShow(false)
    }

    const triggerFossologyClearing = useCallback(
        async (params: { [key: string]: string }) => {
            const url = CommonUtils.createUrlWithParams(`releases/${releaseId}/triggerFossologyProcess`, params)
            const response = await fetchData(url)
            return response ? true : false
        },
        [
            releaseId,
            fetchData,
        ],
    )

    const checkFossologyProcessStatus = useCallback(async () => {
        const url = `releases/${releaseId}/checkFossologyProcessStatus`
        const response = (await fetchData(url)) as FossologyProcessStatus | undefined
        if (response === undefined) return

        if (response.status === 'SUCCESS') {
            setProgressStatus({
                percent: PERCENT_DONE,
                stepName: 'Report generation done',
            })
            showMessage(clearingMessages.CLEARING_SUCCESS)
            clearAllInterval()
            return
        }

        if (response.fossologyProcessInfo !== null) {
            updateProgressStatus(response.fossologyProcessInfo)
        }
        // RECURSIVE CALL
        // if (progressStatus.percent < PERCENT_DONE && progressStatus.percent > 0) {
        //     clearAllInterval()
        //     startIntervalCheckFossologyProcessStatus()
        // }
    }, [
        clearAllInterval,
        fetchData,
        releaseId,
    ])

    const startIntervalCheckFossologyProcessStatus = useCallback(() => {
        startCountDownt()

        const interval = window.setInterval(() => {
            checkFossologyProcessStatus().catch((err) => console.error(err))
            resetTimeCountDown()
        }, 5000)
        progressInterval.current = interval
    }, [
        checkFossologyProcessStatus,
    ])

    const reloadReport = async () => {
        hideMessage()
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const url = `releases/${releaseId}/reloadFossologyReport`
        const response = await ApiUtils.GET(url, session.user.access_token)
        if (response.status === StatusCodes.OK) {
            clearAllInterval()
            setProgressStatus({
                percent: RELOAD_ATTACHMENTS_PERCENT,
                stepName: 'Report generation to be started',
            })
            startIntervalCheckFossologyProcessStatus()
        }
    }

    const handleFossologyClearing = useCallback(
        async (params: { [key: string]: string }) => {
            hideMessage()
            clearAllInterval()
            const triggerStatus = await triggerFossologyClearing(params)
            if (triggerStatus == false) {
                showMessage(clearingMessages.ERROR_PROCESSING)
                return
            }

            setProgressStatus({
                percent: 0,
                stepName: '',
            })

            startIntervalCheckFossologyProcessStatus()
        },
        [
            clearAllInterval,
            triggerFossologyClearing,
            startIntervalCheckFossologyProcessStatus,
        ],
    )

    const updateProgressStatus = (fossologyProcessInfo: FossologyProcessInfo) => {
        let progressText = '',
            progressPercent = 0
        if (fossologyProcessInfo.processSteps.length === 3) {
            progressText += 'Report generation'
            progressPercent = 4 * STEP_PERCENT
        } else if (fossologyProcessInfo.processSteps.length === 2) {
            progressText += 'Scanning source'
            progressPercent = 2 * STEP_PERCENT
        } else {
            progressText += 'Uploading source'
            progressPercent = 0 * STEP_PERCENT
        }

        if (fossologyProcessInfo.processSteps.at(-1)?.stepStatus === 'DONE') {
            progressText += ' done'
            progressPercent += 2 * STEP_PERCENT
        } else if (fossologyProcessInfo.processSteps.at(-1)?.stepStatus === 'IN_WORK') {
            progressText += ' in progress'
            progressPercent += 1 * STEP_PERCENT
        } else {
            progressText += ' to be started'
            progressPercent += 0 * STEP_PERCENT
        }

        setProgressStatus({
            percent: progressPercent,
            stepName: progressText,
        })
    }

    const hideMessage = () => {
        setMessage((prev: Message) => ({
            ...prev,
            show: false,
        }))
    }

    const showMessage = (clearingMessage: { [key: string]: string }) => {
        setMessage({
            content: clearingMessage.message,
            variant: clearingMessage.variant,
            show: true,
        })
    }

    const startCountDownt = () => {
        const interval = window.setInterval(() => {
            setTimeInterval((prev) => prev - 1)
        }, 1000)
        countDownInterval.current = interval
    }

    const isClearingAllowed = () => {
        if (numberOfSourceAttachment.current != 1) {
            return false
        }
        return true
    }

    const countSourceAttachment = (attachments: Array<Attachment> | undefined) => {
        if (CommonUtils.isNullEmptyOrUndefinedArray(attachments)) {
            return 0
        }
        return attachments.filter((attachment) => attachment.attachmentType === 'SOURCE').length
    }

    useEffect(() => {
        if (show === true) {
            if (release === undefined) {
                fetchRelease()
                checkFossologyProcessStatus().catch((err) => console.error(err))
            } else {
                if (progressStatus.percent >= PERCENT_DONE) {
                    showMessage(clearingMessages.CLEARING_SUCCESS)
                    return
                }
                if (
                    countDownInterval.current !== undefined &&
                    progressInterval.current !== undefined &&
                    progressStatus.percent === 0 &&
                    numberOfSourceAttachment.current == 1
                ) {
                    handleFossologyClearing({}).catch((err) => console.error(err))
                }

                if (progressStatus.percent >= PERCENT_DONE) {
                    clearAllInterval()
                    showMessage(clearingMessages.CLEARING_SUCCESS)
                }
            }
        }
    }, [
        show,
        progressStatus.percent,
        releaseId,
        numberOfSourceAttachment,
        fetchRelease,
        handleFossologyClearing,
        release,
        clearAllInterval,
        checkFossologyProcessStatus,
    ])

    return (
        <>
            <Modal
                show={show}
                onHide={handleCloseDialog}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        <b>{t('Fossology Process')}</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert
                        variant={message.variant}
                        onClose={hideMessage}
                        dismissible
                        show={message.show}
                    >
                        {message.content}
                    </Alert>
                    <div className='fossology-guide form-text'>
                        <h3>{t('How it works')}:</h3>
                        <p>{t('basic_fossology_process')}:</p>
                        <ol>
                            <li>{t('Upload the sources to FOSSology')}</li>
                            <li>{t('Scan the sources')}</li>
                            <li>{t('Generate a report out of the scan results and attach it to this release')}</li>
                        </ol>
                        <p></p>
                        <p>{t('hand_when_got_stuck_fossology')}</p>
                    </div>
                    <div>
                        {t('Found source attachment')}:
                        {release &&
                            numberOfSourceAttachment.current === 1 &&
                            release._embedded['sw360:attachments'] !== undefined
                            ? release._embedded['sw360:attachments']
                                .filter((attachment: Attachment) => attachment.attachmentType === 'SOURCE')
                                .at(0)?.filename
                            : 'unknown'}
                    </div>
                    <div className='row mt-2'>
                        <div className='col'>
                            <div
                                className='progress'
                                style={{
                                    height: '40px',
                                    borderRadius: '100px',
                                }}
                            >
                                <div
                                    className='progress-bar'
                                    style={{
                                        width: `${progressStatus.percent}%`,
                                        backgroundColor: '#F7941E',
                                        paddingLeft: '1rem',
                                        textAlign: 'left',
                                        color: 'black',
                                        fontSize: '16px',
                                    }}
                                >
                                    {progressStatus.stepName}
                                </div>
                            </div>
                        </div>
                    </div>
                    {progressStatus.percent < 99.96 && <div>Auto-refresh in {timeInterval}</div>}
                </Modal.Body>
                <Modal.Footer className='justify-content-end'>
                    {numberOfSourceAttachment.current === 1 ? (
                        <>
                            <Button
                                variant='light'
                                onClick={() => setConfirmShow(true)}
                            >
                                {' '}
                                {t('Set Outdated')}{' '}
                            </Button>
                            <Button
                                variant='light'
                                onClick={() => void reloadReport()}
                            >
                                {' '}
                                {t('Reload Report')}{' '}
                            </Button>
                            <Button
                                variant='light'
                                onClick={handleCloseDialog}
                            >
                                {' '}
                                {t('Close')}{' '}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant='primary'
                                onClick={handleCloseDialog}
                            >
                                {' '}
                                {t('Close')}{' '}
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
            <Modal
                show={confirmShow}
                onHide={() => setConfirmShow(false)}
                backdrop='static'
                centered
                size='lg'
            >
                <Modal.Header closeButton>
                    <Modal.Title
                        style={{
                            color: 'red',
                        }}
                    >
                        <b>{t('Reset FOSSology Process')}?</b>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        Do you really want to set the current FOSSology process to state &quot;OUTDATED&quot;? This
                        cannot be undone and a new process is started the next time you open this popup.
                    </div>
                </Modal.Body>
                <Modal.Footer className='justify-content-end'>
                    <Button
                        variant='light'
                        onClick={() => setConfirmShow(false)}
                    >
                        {' '}
                        {t('Cancel')}{' '}
                    </Button>
                    <Button
                        variant='danger'
                        onClick={() => void handleOutdated()}
                    >
                        {' '}
                        {t('Set To Outdated')}{' '}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default FossologyClearing
