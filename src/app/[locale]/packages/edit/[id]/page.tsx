// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'

import EditPackage from './components/EditPackage'
import { ReactNode } from 'react'

interface Context {
    params: { id: string }
}

export const metadata: Metadata = {
    title: 'Packages',
}

function PackagesList({ params }: Context) : ReactNode {
    return <EditPackage packageId={params.id} />
}

export default PackagesList
