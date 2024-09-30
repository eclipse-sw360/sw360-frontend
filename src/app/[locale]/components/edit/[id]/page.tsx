// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import EditComponent from './components/EditComponent'

interface Context {
    params: { id: string }
}

const ComponentEditPage = ({ params }: Context) : ReactNode => {
    const componentId = params.id

    return <EditComponent componentId={componentId} />
}

export default ComponentEditPage
