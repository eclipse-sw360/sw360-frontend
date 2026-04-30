// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { type JSX } from 'react'
import LinkProjectsModal from '@/components/sw360/LinkedProjectsModal/LinkProjectsModal'

interface Props {
    projectId: string
    show: boolean
    setShow: (show: boolean) => void
}

/**
 * LinkProjects component wraps the unified LinkProjectsModal in direct mode.
 * This allows project details page to link projects directly via API call.
 */
export default function LinkProjects({ projectId, show, setShow }: Props): JSX.Element {
    return (
        <LinkProjectsModal
            mode='direct'
            projectId={projectId}
            show={show}
            setShow={setShow}
        />
    )
}
