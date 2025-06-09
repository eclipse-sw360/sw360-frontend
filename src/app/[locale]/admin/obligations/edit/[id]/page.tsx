// Copyright (C) TOSHIBA CORPORATION, 2025. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'
import { CommonUtils } from '@/utils'
import { notFound, useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'
import EditObligation from './components/EditObligation'

const ObligationEditPage = (): ReactNode => {
    const searchParams = useSearchParams()
    const obligationId = searchParams.get('id')

    return CommonUtils.isNullEmptyOrUndefinedString(obligationId) ? (
        notFound()
    ) : (
        <EditObligation obligationId={obligationId} />
    )
}

export default ObligationEditPage
