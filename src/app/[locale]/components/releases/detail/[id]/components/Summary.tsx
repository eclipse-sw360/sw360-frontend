// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Session } from '@/object-types/Session'
import ReleaseGeneral from './ReleaseGeneral'
import ReleaseVendor from './ReleaseVendor'
import ResoucesUsing from '@/components/ResourcesUsing/ResoucesUsing'
import DocumentTypes from '@/object-types/enums/DocumentTypes'
import ReleaseDetail from '@/object-types/ReleaseDetail'

interface Props {
    release: ReleaseDetail
    releaseId: string
    session: Session
}

const Summary = ({ release, releaseId, session }: Props) => {
    return (
        <div className='col'>
            <div>
                <p id='up_Summary'>{release.description}</p>
            </div>
            <div>
                <ReleaseGeneral release={release} releaseId={releaseId} />
                <ReleaseVendor release={release} />
                <ResoucesUsing
                    session={session}
                    documentId={releaseId}
                    documentType={DocumentTypes.RELEASE}
                    documentName={`${release.name} (${release.version})`}
                />
            </div>
        </div>
    )
}

export default Summary
