// Copyright (C) Siemens Healthineers, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Table } from "react-bootstrap";
import { useTranslations } from 'next-intl'


export const ScheduleItem = ({
    scheduleUrl,
    cancelUrl,
    scheduleLabel,
    cancelLabel,
    status,
    handleScheduleService
  }: {
    scheduleUrl: string;
    cancelUrl: string;
    scheduleLabel: string;
    cancelLabel: string;
    status: string;
    handleScheduleService: (url: string, message: string) => void;
  }) => {

    const t = useTranslations('default')
    
    return (
        <>
            <Table className='my-3 ms-1 w-100'>
                <tbody>
                    
                    <tr className='border-bottom'>
                        <td className="p-3 text-white fw-bold"
                            style={{
                                backgroundColor: 'var(--sw360-primary-background-color)',
                                width: '40%', 
                            }}
                        >
                            {t('Schedule Offset')}
                        </td>
                        <td className="p-3" style={{ width: '60%' }}>
                            00:00:00 (hh:mm:ss)
                        </td>
                    </tr>
                    <tr className='border-bottom'>
                        <td className="p-3 text-white fw-bold"
                            style={{
                                backgroundColor: 'var(--sw360-primary-background-color)',
                                width: '40%', 
                            }}
                        >
                            {t('Interval')}
                        </td>
                        <td className="p-3" style={{ width: '60%' }}>
                            24:00:00 (hh:mm:ss)
                        </td>
                    </tr>
                    <tr className='border-bottom'>
                        <td className="p-3 text-white fw-bold"
                            style={{
                                backgroundColor: 'var(--sw360-primary-background-color)',
                                width: '40%', 
                            }}
                        >
                            {t('Next Synchronization')}
                        </td>
                        <td className="p-3" style={{ width: '60%' }}>
                            Sat Feb 01 00:00:00 GMT 2025
                        </td>
                    </tr>
                    
                </tbody>
            </Table>
            <div className="my-1 ms-1">
                <button 
                    className='btn btn-primary me-2 px-5 my-2'
                    onClick={() => handleScheduleService(scheduleUrl, `Task scheduled successfully!`)}
                    disabled={status !== 'authenticated'} 
                >
                    {scheduleLabel}
                </button>
                <button 
                    className="btn btn-secondary me-2 px-5 my-2"
                    onClick={() => handleScheduleService(cancelUrl, `Task unscheduled successfully!`)}
                    disabled={status !== 'authenticated'} 
                >
                    {cancelLabel}
                </button>
            </div>
        </>
    );
}
