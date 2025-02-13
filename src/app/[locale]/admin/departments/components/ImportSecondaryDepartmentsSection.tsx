// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Button } from 'react-bootstrap'
import { useState, useEffect, useCallback, type JSX } from 'react'
import { ApiUtils, CommonUtils } from '@/utils/index'
import { getSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import MessageService from '@/services/message.service'
import { HttpStatus } from '@/object-types'
import { Modal } from 'react-bootstrap'
import { FaRegQuestionCircle } from 'react-icons/fa'
import { Spinner } from 'react-bootstrap'
import ViewLogsModal from './ViewLogsModal'

interface ImportDepartmentInformation {
    folderPath: string
    interval: string
    isSchedulerStarted: boolean
    lastRunningTime: string
    nextRunningTime: string
}

interface ImportManualResponse {
    requestStatus?: string
    totalAffectedElements?: number
    totalElements?: number
    message?: string
}

enum ImportStatus {
    NOT_STARTED,
    IMPORTING,
    SUCCESS,
    FAILURE
}

const ImportSecondaryDepartmentsSection = (): JSX.Element => {
    const t = useTranslations('default')
    const [importDepartmentInformation, setImportDepartmentInformation] = useState<ImportDepartmentInformation | undefined>(undefined)
    const [folderPath, setFolderPath] = useState<string>('')
    const [importedManuallyStatus, setImportedManuallyStatus] = useState<ImportStatus>(ImportStatus.NOT_STARTED)
    const [showImportManuallyModal, setShowImportManuallyModal] = useState<boolean>(false)
    const [importManualResponse, setImportManualResponse] = useState<ImportManualResponse | undefined>(undefined)
    const [showLogsModal, setShowLogsModal] = useState<boolean>(false)

    const fetchImportSchedulerStatus = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const response = await ApiUtils.GET('departments/importInformation', session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        if (response.status === HttpStatus.OK) {
            const data = await response.json() as ImportDepartmentInformation
            setImportDepartmentInformation(data)
            setFolderPath(data.folderPath)
        }
    }, [])

    const changePathFolder = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFolderPath(event.target.value)
    }

    const toggleImportScheduler = useCallback(async () => {
        if (importDepartmentInformation === undefined) {
            return
        }
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const response = await ApiUtils.POST(`departments/${importDepartmentInformation.isSchedulerStarted ? 'unscheduleImport' : 'scheduleImport'}`, {}, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const data = await response.json() as { message: string }
        if (response.status === HttpStatus.OK) {
            MessageService.success(data.message)
            setImportDepartmentInformation((prev) => prev ? { ...prev, isSchedulerStarted: !prev.isSchedulerStarted } : prev)
        } else {
            MessageService.error(data.message)
        }
    }, [importDepartmentInformation])

    const updateFolderPath = async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        const response = await ApiUtils.POST(`departments/writePathFolder?pathFolder=${folderPath}`, {}, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        if (response.status !== HttpStatus.OK) {
            MessageService.error(t('Update folder path failed'))
        } else {
            MessageService.success(t('Update folder path successfully'))
            setImportDepartmentInformation((prev) => prev ? { ...prev, folderPath } : prev)
        }
    }

    const importDeparmentManually = useCallback(async () => {
        const session = await getSession()
        if (CommonUtils.isNullOrUndefined(session)) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        setImportedManuallyStatus(ImportStatus.IMPORTING)
        const response = await ApiUtils.POST(`departments/manuallyactive`, {}, session.user.access_token)
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            setImportedManuallyStatus(ImportStatus.FAILURE)
            return signOut()
        }
        if (response.status === HttpStatus.UNAUTHORIZED) {
            MessageService.error(t('Session has expired'))
            return signOut()
        }
        if (response.status === HttpStatus.OK) {
            const data = await response.json() as ImportManualResponse
            if (data.requestStatus === 'SUCCESS') {
                setImportedManuallyStatus(ImportStatus.SUCCESS)
                setImportManualResponse(data)
            } else {
                setImportedManuallyStatus(ImportStatus.FAILURE)
            }
            setImportedManuallyStatus(ImportStatus.SUCCESS)
        } else {
            setImportedManuallyStatus(ImportStatus.FAILURE)
        }
    }, [])

    const closeImportManuallyModal = () => {
        setShowImportManuallyModal(false)
        setImportedManuallyStatus(ImportStatus.NOT_STARTED)
    }

    const renderImportManualModalBody = () => {
        switch (importedManuallyStatus) {

            case ImportStatus.IMPORTING:
                return (
                    <p>{t('Importing departments')}...</p>
                )
            case ImportStatus.SUCCESS:
                return (
                    importManualResponse !== undefined && <div className='import-department-success p-3'>
                        <table className='result-table table'>
                            <tbody>
                                <tr>
                                    <th>{t('File Success')}</th>
                                    <td>{importManualResponse.totalAffectedElements ?? 0}</td>
                                </tr>
                                <tr>
                                    <th>{t('File Fail')}</th>
                                    <td>{(importManualResponse.totalElements ?? 0) - (importManualResponse.totalAffectedElements ?? 0)}</td>
                                </tr>
                                <tr>
                                    <th>{t('Total Files')}</th>
                                    <td>{importManualResponse.totalElements ?? 0}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )
            case ImportStatus.FAILURE:
                return (
                    <div className='import-department-failure p-3'>{t('Failed to import department')}!</div>
                )
            case ImportStatus.NOT_STARTED:
            default:
                return (
                    <p>
                        {t('Do you really want to import department')}?
                    </p>
                )
        }
    }

    const renderImportManualModalFooter = () => {
        switch (importedManuallyStatus) {
            case ImportStatus.IMPORTING:
                return (
                    <button className='btn btn-primary' id='submit' disabled>
                        {t('Import Departments')} <Spinner size='sm' className='ms-1' />
                    </button>
                )
            case ImportStatus.SUCCESS:
            case ImportStatus.FAILURE:
                return (
                    <button className='btn close-btn btn-primary' onClick={() => { closeImportManuallyModal(); window.location.reload() }}>
                        {t('Close')}
                    </button>
                )
            case ImportStatus.NOT_STARTED:
            default:
                return (
                    <>
                        <button className='btn close-btn btn-light' onClick={() => closeImportManuallyModal()}>
                            {t('Cancel')}
                        </button>
                        <button className='btn btn-primary' id='submit' onClick={() => importDeparmentManually()}>
                            {t('Import Departments')}
                        </button>
                    </>
                )
        }
    }

    useEffect(() => {
        fetchImportSchedulerStatus().catch((err) => console.error(err))
    }, [])

    return (
        (importDepartmentInformation !== undefined)
            ? <>
                <div>
                    <div className='row'>
                        <div className='col-lg-6'>
                            <table className='table import-config-table'>
                                <tbody>
                                    <tr>
                                        <th style={{ lineHeight: '40px' }} className='table-header'>{t('Registration Folder Path')}</th>
                                        <td>
                                            <input id='pathFolderDepartment' type='text'
                                                className='form-control' name='import-folder-path'
                                                placeholder='Enter the directory path folder'
                                                defaultValue={folderPath}
                                                onChange={changePathFolder}
                                            />
                                        </td>
                                        <td width='3%'>
                                            <button type='button' className='btn btn-primary'
                                                disabled={CommonUtils.isNullEmptyOrUndefinedString(folderPath) || folderPath === importDepartmentInformation.folderPath}
                                                onClick={() => updateFolderPath().catch(err => console.error(err))}
                                            >{t('Update')}</button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className='table-header'>{t('Interval')}</th>
                                        <td>{importDepartmentInformation.interval} (hh:mm:ss)</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th className='table-header'>{t('Last Running Time')}</th>
                                        <td>{importDepartmentInformation.lastRunningTime}</td>
                                        <td></td>
                                    </tr>
                                    <tr>
                                        <th className='table-header'>{t('Next Running Time')}</th>
                                        <td>{importDepartmentInformation.nextRunningTime}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='row mb-3 mt-3'>
                        <div className='col'>
                            <Button variant='primary'
                                disabled={importDepartmentInformation.isSchedulerStarted === true}
                                onClick={() => toggleImportScheduler().catch(err => console.error(err))}
                            >
                                {t('schedule_deparments_generating')}
                            </Button>
                            <Button variant='light' className='ms-4'
                                disabled={importDepartmentInformation.isSchedulerStarted !== true}
                                onClick={() => toggleImportScheduler().catch(err => console.error(err))}>
                                {t('cancel_departments_generating')}
                            </Button>
                            <Button variant='info' className='ms-4' onClick={() => { setShowImportManuallyModal(true) }}>{t('Manually Activate')}</Button>
                            <Button variant='secondary' className='ms-4' onClick={() => { setShowLogsModal(true) }}>{t('View Logs')}</Button>
                        </div>
                    </div>
                </div>

                <Modal show={showImportManuallyModal} onHide={() => closeImportManuallyModal()} backdrop='static' centered size='lg'>
                    <Modal.Header>
                        <Modal.Title><FaRegQuestionCircle /> {t('Import Departments')}? </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {renderImportManualModalBody()}
                    </Modal.Body>
                    <Modal.Footer className='justify-content-end'>
                        {renderImportManualModalFooter()}
                    </Modal.Footer>
                </Modal>
                <ViewLogsModal show={showLogsModal} setShow={setShowLogsModal} />
            </>
            : <></>
    )
}

export default ImportSecondaryDepartmentsSection