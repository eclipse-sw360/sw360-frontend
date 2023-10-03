// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { CiCircleRemove } from 'react-icons/ci'
import { FiCheckCircle } from 'react-icons/fi'
import { useTranslations } from 'next-intl'
import { COMMON_NAMESPACE } from '@/object-types/Constants'

const ClearingInformationStatus = ({ status }: { status: boolean | undefined }) => {
    const t = useTranslations(COMMON_NAMESPACE)
    return status ? (
        <span style={{ color: '#287d3c' }}>
            <FiCheckCircle /> {t('Yes')}
        </span>
    ) : (
        <span style={{ color: 'red' }}>
            <CiCircleRemove /> {t('No')}
        </span>
    )
}

export default ClearingInformationStatus
