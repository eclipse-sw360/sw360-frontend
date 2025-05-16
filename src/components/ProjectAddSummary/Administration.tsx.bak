// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client';
import { ProjectPayload } from '@/object-types'
import Clearing from './component/Administration/Clearing'
import LicenseInfoHeader from './component/Administration/LicenseInfoHeader'
import Lifecycle from './component/Administration/LifeCycle'

import type { JSX } from "react";

interface Props {
    projectPayload: ProjectPayload
    setProjectPayload: React.Dispatch<React.SetStateAction<ProjectPayload>>
}

export default function Administration({ projectPayload, setProjectPayload }: Props): JSX.Element {
    return (
        <>
            <div className='ms-1'>
                <Clearing projectPayload={projectPayload} setProjectPayload={setProjectPayload} />
                <Lifecycle projectPayload={projectPayload} setProjectPayload={setProjectPayload} />
                <LicenseInfoHeader projectPayload={projectPayload} setProjectPayload={setProjectPayload} />
            </div>
        </>
    )
}
