// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'
import PackageDetailTab from './components/PackageDetailTab'
import { ReactNode } from 'react'

interface Context {
    params: { id: string }
}

export const metadata: Metadata = {
    title: 'Packages',
}

const Detail = ({ params }: Context) : ReactNode => {
    return <PackageDetailTab packageId={params.id} />
}

export default Detail
