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
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from "@/object-types/Constants"
import { useState, useEffect, useRef, useCallback } from 'react'
import { Session } from '@/object-types/Session'
import styles from './fossologyClearing.module.css'
import EmbeddedAttachment from '@/object-types/EmbeddedAttachment'
import { Alert } from 'react-bootstrap'
import CommonUtils from '@/utils/common.utils'
import ApiUtils from '@/utils/api/api.util'
import { FossologyProcessInfo, FossologyProcessStatus } from '@/object-types/FossologyProcessStatus'

interface Props {
	show?: boolean
	setShow?: React.Dispatch<React.SetStateAction<boolean>>
	session: Session
	releaseId: string
}

const clearingMessages: { [key: string]: { [key: string]: string } } = {
	NUMBER_OF_ATTACHMENTS_NOT_MATCH: {
		message: 'number_of_attachments_not_match_condition',
		variant: 'danger'
	},
	CLEARING_SUCCESS: {
		message: 'fossology_clearing_finished',
		variant: 'success'
	},
	ERROR_PROCESSING: {
		message: 'Error when processing!',
		variant: 'danger'
	}
}

const FossologyClearing = ({ show, setShow, session, releaseId }: Props) => {
	const t = useTranslations(COMMON_NAMESPACE)
	const stepSize = 16.66
	const progressInterval = useRef(undefined)
	const countDownInterval = useRef(undefined)
	const numberOfSourceAttachment = useRef(0)

	const [timeInterval, setTimeInterval] = useState<number>(5)
	const [release, setRelease] = useState(undefined)
	const [confirmShow, setConfirmShow] = useState(false)

	const [message, setMessage] = useState({
		content: '',
		variant: 'success',
		show: false,
	})


	const [progressStatus, setProgressStatus] = useState({
		percent: 0,
		stepName: ''
	})

	const fetchData = async (url: string) => {
		return ApiUtils.GET(url, session.user.access_token)
			.then((response) => response.json())
			.catch(() => undefined)
	}

	const fetchRelease = useCallback(async () => {
		const url = `releases/${releaseId}`
		fetchData(url).then(data => {
			setRelease(data)
			numberOfSourceAttachment.current = countSourceAttachment(data._embedded['sw360:attachments'])
			if (!isClearingAllowed()) {
				showMessage(clearingMessages.NUMBER_OF_ATTACHMENTS_NOT_MATCH)
				setProgressStatus({
					percent: 0,
					stepName: ''
				})
				return
			}
		})
	}, [releaseId])

	const handleCloseDialog = () => {
		hideMessage()
		clearAllInterval()
		setProgressStatus({
			percent: 0,
			stepName: ''
		})
		setRelease(undefined)
		setShow(false)
	}

	const handleOutdated = () => {
		handleFossologyClearing({ markFossologyProcessOutdated: true })
		setConfirmShow(false)
	}

	const reloadReport = () => {
		// Missing API will handle later
		handleFossologyClearing({ markFossologyProcessOutdated: false })
	}

	const handleFossologyClearing = async (params: any) => {
		hideMessage()
		clearAllInterval()

		const triggerStatus = await triggerFossologyClearing(params)
		if (triggerStatus == false) {
			showMessage(clearingMessages.ERROR_PROCESSING)
			return
		}

		setProgressStatus({
			percent: 0,
			stepName: ''
		})

		startCountDownt()

		const interval = setInterval(() => {
			checkFossologyProcessStatus()
			resetTimeCountDown()
		}, 5000)

		progressInterval.current = interval
	}

	const triggerFossologyClearing = async (params: { [key: string]: string }) => {
		const url = CommonUtils.createUrlWithParams(`releases/${releaseId}/triggerFossologyProcess`, params)
		const response = await fetchData(url)
		return (response) ? true : false
	}

	const checkFossologyProcessStatus = async () => {
		const url = `releases/${releaseId}/checkFossologyProcessStatus`
		const response: FossologyProcessStatus = await fetchData(url)

		if (response.status === 'SUCCESS') {
			setProgressStatus({
				percent: 99.96,
				stepName: 'Report generation done'
			})
			showMessage(clearingMessages.CLEARING_SUCCESS)
			return
		}
		if (response.fossologyProcessInfo !== null) {
			updateProgressStatus(response.fossologyProcessInfo)
		}
	}

	const updateProgressStatus = (fossologyProcessInfo: FossologyProcessInfo) => {
		let progressText = '',
			progressPercent = 0
		if (fossologyProcessInfo.processSteps.length === 3) {
			progressText += 'Report generation'
			progressPercent = 4 * stepSize
		} else if (fossologyProcessInfo.processSteps.length === 2) {
			progressText += 'Scanning source'
			progressPercent = 2 * stepSize
		} else {
			progressText += 'Uploading source'
			progressPercent = 0 * stepSize
		}

		if (fossologyProcessInfo.processSteps.at(-1).stepStatus === 'DONE') {
			progressText += ' done'
			progressPercent += 2 * stepSize
		} else if (fossologyProcessInfo.processSteps.at(-1).stepStatus === 'IN_WORK') {
			progressText += ' in progress'
			progressPercent += 1 * stepSize
		} else {
			progressText += ' to be started'
			progressPercent += 0 * stepSize
		}

		setProgressStatus({
			percent: progressPercent,
			stepName: progressText
		})
	}

	const hideMessage = () => {
		setMessage((prev: any) => ({
			...prev,
			show: false,
		}))
	}

	const showMessage = (clearingMessage: { [key: string]: string }) => {
		setMessage({
			content: clearingMessage.message,
			variant: clearingMessage.variant,
			show: true
		})
	}

	const startCountDownt = () => {
		const interval = setInterval(() => {
			setTimeInterval(prev => prev - 1)
		}, 1000)
		countDownInterval.current = interval
	}

	const clearAllInterval = () => {
		countDownInterval.current = clearInterval(countDownInterval.current)
		progressInterval.current = clearInterval(progressInterval.current)
		resetTimeCountDown()
	}

	const resetTimeCountDown = () => {
		setTimeInterval(5)
	}

	const isClearingAllowed = () => {
		if (numberOfSourceAttachment.current != 1) {
			return false
		}
		return true
	}

	const countSourceAttachment = (attachments: Array<EmbeddedAttachment> | undefined) => {
		if (CommonUtils.isNullEmptyOrUndefinedArray(attachments)) {
			return 0
		}
		return attachments.filter((attachment) => attachment.attachmentType === 'SOURCE').length
	}

	useEffect(() => {
		if (show === true) {
			if (release === undefined) {
				fetchRelease()
				checkFossologyProcessStatus()
			}
			else {
				if (progressStatus.percent > 99) {
					showMessage(clearingMessages.CLEARING_SUCCESS)
					return
				}

				if (show === true &&
					!countDownInterval.current &&
					!progressInterval.current &&
					(numberOfSourceAttachment.current == 1)) {
					handleFossologyClearing({})
				}

				if (progressStatus.percent > 99) {
					clearAllInterval()
					showMessage(clearingMessages.CLEARING_SUCCESS)
				}
			}
		}
		
	}, [show, progressStatus.percent, releaseId, fetchRelease]);

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
					<Modal.Title><b>{t('Fossology Process')}</b></Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Alert variant={message.variant} onClose={hideMessage} dismissible show={message.show}>
						{t.rich(message.content, {
							count: numberOfSourceAttachment.current,
						})}
					</Alert>
					<div className={`${styles.guide} form-text`}>
						<h3>{t('How it works')}:</h3>
						<p>
							{t('basic_fossology_process')}:
						</p><ol>
							<li>{t('Upload the sources to FOSSology')}</li>
							<li>{t('Scan the sources')}</li>
							<li>{t('Generate a report out of the scan results and attach it to this release')}</li>
						</ol>
						<p></p>
						<p>
							{t('hand_when_got_stuck_fossology')}
						</p>
					</div>
					<div>{t('Found source attachment')}:
						{(release && (numberOfSourceAttachment.current === 1))
							? release._embedded['sw360:attachments'].filter((attachment: EmbeddedAttachment) => attachment.attachmentType === 'SOURCE').at(0).filename
							: 'unknown'
						}
					</div>
					<div className='row mt-2'>
						<div className='col'>
							<div className='progress' style={{ height: '40px', borderRadius: '100px' }}>
								<div className='progress-bar' style={{
									width: `${progressStatus.percent}%`, backgroundColor: '#F7941E',
									paddingLeft: '1rem', textAlign: 'left', color: 'black', fontSize: '16px'
								}}>
									{progressStatus.stepName}
								</div>
							</div>
						</div>
					</div>
					{(progressStatus.percent < 99.96) && <div>Auto-refresh in {timeInterval}</div>}
				</Modal.Body>
				<Modal.Footer className='justify-content-end' >
					{(numberOfSourceAttachment.current === 1)
						?
						<>
							<Button variant='light' onClick={() => setConfirmShow(true)}> {t('Set Outdated')} </Button>
							<Button variant='light' onClick={reloadReport}> {t('Reload Report')} </Button>
							<Button variant='light' onClick={handleCloseDialog}> {t('Close')} </Button>
						</>
						:
						<>
							<Button variant='primary' onClick={handleCloseDialog}> {t('Close')} </Button>
						</>
					}
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
					<Modal.Title style={{ color: 'red' }}><b>{t('Reset FOSSology Process')}?</b></Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>Do you really want to set the current FOSSology process to state &quot;OUTDATED&quot;?
						This cannot be undone and a new process is started the next time you open this popup.</div>
				</Modal.Body>
				<Modal.Footer className='justify-content-end' >
					<Button variant='light' onClick={() => setConfirmShow(false)}> {t('Cancel')} </Button>
					<Button variant='danger' onClick={handleOutdated}> {t('Set To Outdated')} </Button>
				</Modal.Footer>
			</Modal>
		</>
	)
}

export default FossologyClearing