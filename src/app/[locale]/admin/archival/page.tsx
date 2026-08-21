// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'
import type { JSX } from 'react'
import ArchivalRestore from './components/ArchivalRestore'

export const metadata: Metadata = {
    title: 'Admin - Archive and Restore',
}

const Archival = (): JSX.Element => {
    return <ArchivalRestore />
}

export default Archival
