// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { createHash } from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    if (!email) {
        return NextResponse.json(
            {
                error: 'Email is required',
            },
            {
                status: 400,
            },
        )
    }

    // Hash the email as required by Gravatar
    const md5 = createHash('md5').update(email.trim().toLowerCase()).digest('hex')
    console.log(md5)
    const apiKey = process.env.GRAVATAR_API_KEY
    const gravatarUrl = `https://secure.gravatar.com/avatar/${md5}?d=identicon&s=200&apikey=${apiKey}`
    console.log(gravatarUrl)

    const response = await fetch(gravatarUrl)
    const imageBuffer = await response.arrayBuffer()

    return new NextResponse(Buffer.from(imageBuffer), {
        headers: {
            'Content-Type': response.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=3600',
        },
    })
}
