// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ReactNode } from 'react'
import DetailOverview from './components/DetailOverview'

interface Context {
    params: { id: string }
}

const Detail = ({ params }: Context) : ReactNode => {
    const releaseId = params.id

    return <DetailOverview releaseId={releaseId} />
}

export default Detail
