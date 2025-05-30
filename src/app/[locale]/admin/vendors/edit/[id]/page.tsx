// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { Metadata } from 'next'

import EditVendor from './components/EditVendor'

import { ReactNode } from "react"

export const metadata: Metadata = {
    title: 'Admin - Vendors',
}

interface Context {
    params: Promise<{ id: string }>
}

const EditVendorPage = async (props: Context): Promise<ReactNode> => {
    const params = await props.params
    const vendorId = params.id
    return <EditVendor id={vendorId} />
}

export default EditVendorPage
