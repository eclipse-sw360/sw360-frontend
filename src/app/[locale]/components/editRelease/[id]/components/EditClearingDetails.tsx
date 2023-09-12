// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import ReleasePayload from '@/object-types/ReleasePayload'
import ClearingDetails from './ClearingDetails'
import RequestInformation from './RequestInformation'
// import RequestInformation from './RequestInformation'

interface Props {
    releasePayload?: ReleasePayload
    setReleasePayload?: React.Dispatch<React.SetStateAction<ReleasePayload>>
}

const EditClearingDetails = ({ releasePayload, setReleasePayload }: Props) => {
    return (
        <>
            <div className='container' style={{ maxWidth: '98vw', marginTop: '10px', fontSize: '0.875rem' }}>
                <ClearingDetails releasePayload={releasePayload} setReleasePayload={setReleasePayload} />

                <RequestInformation releasePayload={releasePayload} setReleasePayload={setReleasePayload} />
            </div>
        </>
    )
}

export default EditClearingDetails
