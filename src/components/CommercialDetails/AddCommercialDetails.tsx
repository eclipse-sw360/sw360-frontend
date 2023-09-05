// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { Session } from '@/object-types/Session'
import COTSOSSInformation from './COTSOSSInformation'
import CommercialDetailsAdministration from './CommercialDetailsAdministration'
import ReleasePayload from '@/object-types/ReleasePayload'
import ComponentOwner from '@/object-types/ComponentOwner'

interface Props {
    session?: Session
    releasePayload?: ReleasePayload
    setReleasePayload?: React.Dispatch<React.SetStateAction<ReleasePayload>>
    cotsResponsible?: ComponentOwner
    setCotsResponsible?: React.Dispatch<React.SetStateAction<ComponentOwner>>
}

const AddCommercialDetails = ({
    session,
    releasePayload,
    setReleasePayload,
    cotsResponsible,
    setCotsResponsible,
}: Props) => {
    return (
        <>
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px', fontSize: '0.875rem' }}>
                <CommercialDetailsAdministration
                    session={session}
                    releasePayload={releasePayload}
                    setReleasePayload={setReleasePayload}
                    cotsResponsible={cotsResponsible}
                    setCotsResponsible={setCotsResponsible}
                />

                <COTSOSSInformation />
            </div>
        </>
    )
}

export default AddCommercialDetails
