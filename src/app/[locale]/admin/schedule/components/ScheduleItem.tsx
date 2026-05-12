// Copyright (C) Siemens Healthineers, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { useTranslations } from 'next-intl'
import { JSX } from 'react'
import { Table } from 'react-bootstrap'
import { ServiceDetail } from '@/object-types'

const secondsToHHMMSS = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const ScheduleItem = ({
    serviceName,
    scheduleLabel,
    cancelLabel,
    status,
    handleScheduleService,
    serviceDetail,
}: {
    serviceName: string
    scheduleLabel: string
    cancelLabel: string
    status: string
    handleScheduleService: (serviceName: string, action: 'schedule' | 'unschedule', message: string) => void
    serviceDetail?: ServiceDetail
}): JSX.Element => {
    const t = useTranslations('default')

    const scheduleOffset =
        serviceDetail !== undefined ? `${secondsToHHMMSS(serviceDetail.firstOffsetSeconds)} (hh:mm:ss)` : '—'

    const interval = serviceDetail !== undefined ? `${secondsToHHMMSS(serviceDetail.intervalSeconds)} (hh:mm:ss)` : '—'

    const nextSync = serviceDetail !== undefined ? serviceDetail.nextSynchronization : '—'

    return (
        <>
            <Table className='my-3 ms-1 w-100'>
                <tbody>
                    <tr className='border-bottom'>
                        <td className='p-3 text-white fw-bold w-50 sw360-background'>{t('Schedule Offset')}</td>
                        <td className='p-3 w-50'>{scheduleOffset}</td>
                    </tr>
                    <tr className='border-bottom'>
                        <td className='p-3 text-white fw-bold w-50 sw360-background'>{t('Interval')}</td>
                        <td className='p-3 w-50'>{interval}</td>
                    </tr>
                    <tr className='border-bottom'>
                        <td className='p-3 text-white fw-bold w-50 sw360-background'>{t('Next Synchronization')}</td>
                        <td className='p-3 w-50'>{nextSync}</td>
                    </tr>
                </tbody>
            </Table>
            <div className='my-1 ms-1'>
                <button
                    className='btn btn-primary me-2 px-5 my-2'
                    onClick={() => handleScheduleService(serviceName, 'schedule', `Task scheduled successfully!`)}
                    disabled={status !== 'authenticated' || serviceDetail?.isScheduled === true}
                >
                    {scheduleLabel}
                </button>
                <button
                    className='btn btn-secondary me-2 px-5 my-2'
                    onClick={() => handleScheduleService(serviceName, 'unschedule', `Task unscheduled successfully!`)}
                    disabled={status !== 'authenticated' || serviceDetail?.isScheduled === false}
                >
                    {cancelLabel}
                </button>
            </div>
        </>
    )
}
