// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import React from 'react'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'
import styles from './TitleAttachment.module.css'

export default function TitleAttachment() {
    const t = useTranslations(COMMON_NAMESPACE)
    return (
        <>
            <div className={`${styles['div-title']}`}>
                <div className={`${styles['div-title-first']}`}>
                    <p className={`${styles['p-attachment']}`}>{t('Attachments')}</p>
                </div>
                <div className={`${styles['div-title-second']}`}>
                    <div className={`${styles['div-filename']}`}>
                        <p className={`${styles['p-filename']}`}>{t('File name')}</p>
                    </div>
                    <div className={`${styles['div-type']}`}>
                        <p className={`${styles['p-type']}`}>{t('Type')}</p>
                    </div>
                    <div className={`${styles['div-upload']}`}>
                        <div className={`${styles['div-upload-first']}`}>{t('Upload')}</div>
                        <div className={`${styles['div-upload-second']}`}>
                            <div className={`${styles['div-comment']}`}>{t('Comments')}</div>
                            <div className={`${styles['div-group']}`}>{t('Group')}</div>
                            <div className={`${styles['div-name']}`}>{t('Name')}</div>
                            <div className={`${styles['div-date']}`}>{t('Date')}</div>
                        </div>
                    </div>
                    <div className={`${styles['div-approval']}`}>
                        <div className={`${styles['div-approval-first']}`}>{t('Approval')}</div>
                        <div className={`${styles['div-approval-second']}`}>
                            <div className={`${styles['div-status']}`}>{t('Status')}</div>
                            <div className={`${styles['div-comment']}`}>{t('Comments')}</div>
                            <div className={`${styles['div-group']}`}>{t('Group')}</div>
                            <div className={`${styles['div-name']}`}>{t('Name')}</div>
                            <div className={`${styles['div-date']}`}>{t('Date')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
