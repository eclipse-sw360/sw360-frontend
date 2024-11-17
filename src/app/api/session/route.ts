// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import authOptions from '../auth/[...nextauth]/authOptions'

export async function GET(): Promise<NextResponse> {
    const session = await getServerSession(authOptions)

    if (!session) {
        return new NextResponse(JSON.stringify({ status: 'fail', message: 'You are not logged in' }), { status: 401 })
    }

    return NextResponse.json({
        authenticated: true,
        session,
    })
}
