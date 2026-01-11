// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'
import { BsCheck2Circle, BsXCircle } from 'react-icons/bs'
import CommonUtils from '@/utils/common.utils'

const ClearingInformationStatus = ({ status }: { status: boolean | undefined }): ReactNode => {
    const t = useTranslations('default')
    return (
        <>
            {!CommonUtils.isNullOrUndefined(status) && status == true ? (
                <span
                    style={{
                        color: '#287d3c',
                    }}
                >
                    <BsCheck2Circle size={20} /> {t('Yes')}
                </span>
            ) : (
                <span
                    style={{
                        color: 'red',
                    }}
                >
                    <BsXCircle size={20} /> {t('No')}
                </span>
            )}
        </>
    )
}

export default ClearingInformationStatus
