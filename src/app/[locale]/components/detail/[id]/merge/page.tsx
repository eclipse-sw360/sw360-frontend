// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import MergeOverview from './components/MergeOverview'

interface Context {
    params: Promise<{ id: string }>
}

const Detail = async (props: Context): Promise<ReactNode> => {
    const params = await props.params;
    const componentId = params.id

    return <MergeOverview id={componentId} />
}

export default Detail
