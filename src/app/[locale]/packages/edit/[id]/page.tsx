// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'

import { ReactNode } from 'react'
import EditPackage from './components/EditPackage'

interface Context {
    params: Promise<{ id: string }>
}

export const metadata: Metadata = {
    title: 'Packages',
}

async function PackagesList(props: Context): Promise<ReactNode> {
    const params = await props.params
    return <EditPackage packageId={params.id} />
}

export default PackagesList
