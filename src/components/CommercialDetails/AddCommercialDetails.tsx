// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Release } from '@/object-types'
import COTSOSSInformation from './COTSOSSInformation'
import CommercialDetailsAdministration from './CommercialDetailsAdministration'

interface Props {
    releasePayload?: Release
    setReleasePayload?: React.Dispatch<React.SetStateAction<Release>>
    cotsResponsible?: { [k: string]: string }
    setCotsResponsible?: React.Dispatch<React.SetStateAction<{ [k: string]: string }>>
}

function AddCommercialDetails({ releasePayload, setReleasePayload, cotsResponsible, setCotsResponsible }: Props) {
    return (
        <>
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px', fontSize: '0.875rem' }}>
                <CommercialDetailsAdministration
                    releasePayload={releasePayload}
                    setReleasePayload={setReleasePayload}
                    cotsResponsible={cotsResponsible}
                    setCotsResponsible={setCotsResponsible}
                />

                <COTSOSSInformation releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
            </div>
        </>
    )
}

export default AddCommercialDetails
