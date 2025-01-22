// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { useTranslations } from 'next-intl'

export default function TitleAttachment(): JSX.Element {
    const t = useTranslations('default')
    return (
        <thead>
            <tr role='row'>
                <th className='headLabel' colSpan={12} rowSpan={1}>{t('Attachments')}</th>
            </tr>
            <tr role='row'>
                <th className='headlabel content-middle sorting_asc' rowSpan={2} tabIndex={0} aria-controls='attachmentInfo' colSpan={1}>{t('File name')}</th>
                <th className='headlabel sorting' rowSpan={2} colSpan={1} tabIndex={0} aria-controls='attachmentInfo'>{t('Type')}</th>
                <th className='headlabel' colSpan={4} rowSpan={1}>{t('Upload')}</th>
                <th className='headlabel' colSpan={5} rowSpan={1}>{t('Approval')}</th>
                <th className='headlabel content-middle one' rowSpan={2} colSpan={1}></th>
            </tr>
            <tr role='row'>
                <th className='headlabel sorting' tabIndex={0} aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Comment')}</th>
                <th className='headlabel content-middle sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Group')}</th>
                <th className='headlabel content-middle sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Name')}</th>
                <th className='headlabel content-middle sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Date')}</th>
                <th className='headlabel checkStatus sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Status')}</th>
                <th className='headlabel checkedComment sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Comment')}</th>
                <th className='headlabel content-middle checkedTeam sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Group')}</th>
                <th className='headlabel content-middle checkedBy sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Name')}</th>
                <th className='headlabel content-middle checkedOn sorting' aria-controls='attachmentInfo' rowSpan={1} colSpan={1}>{t('Date')}</th>
            </tr>
        </thead>
    )
}
