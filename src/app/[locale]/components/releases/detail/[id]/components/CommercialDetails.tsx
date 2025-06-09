// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { COTSDetails } from '@/object-types'
import { ReactNode } from 'react'
import CommercialDetailsAdministration from './CommercialDetailsAdministration'
import CotsOssInformation from './CotsOssInformation'

const CommercialDetails = ({ costDetails }: { costDetails: COTSDetails | undefined }): ReactNode => {
    return (
        <div className='col'>
            <CommercialDetailsAdministration costDetails={costDetails} />
            <CotsOssInformation costDetails={costDetails} />
        </div>
    )
}

export default CommercialDetails
