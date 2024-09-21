// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { RequestContent } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'

const base = SW360_API_URL + '/resource/api'

async function send({
    method,
    path,
    data,
    token,
    signal,
}: {
    method: string
    path: string
    data: object | null
    token: string
    signal?: unknown
}): Promise<Response> {
    const request_content: RequestContent = { method, headers: { Accept: 'application/*' }, body: null }

    if (data) {
        if (data instanceof FormData) {
            request_content['body'] = data
        } else {
            request_content.headers['Content-Type'] = 'application/json'
            request_content['body'] = JSON.stringify(data)
        }
    }

    if (token) {
        request_content.headers['Authorization'] = `${token}`
    }

    if (signal !== undefined) {
        request_content.signal = signal
    }

    return fetch(`${base}/${path}`, request_content).then((r) => r)
}

function GET(path: string, token: string, signal?: unknown): Promise<Response> {
    return send({ method: 'GET', path, token, data: null, signal })
}

function DELETE(path: string, token: string): Promise<Response> {
    return send({ method: 'DELETE', path, token, data: null })
}

function POST(path: string, data: object, token: string): Promise<Response> {
    return send({ method: 'POST', path, data, token })
}

function PUT(path: string, data: object, token: string): Promise<Response> {
    return send({ method: 'PUT', path, data, token })
}

function PATCH(path: string, data: object, token: string): Promise<Response> {
    return send({ method: 'PATCH', path, data, token })
}

const ApiUtils = { GET, DELETE, POST, PUT, PATCH }

export default ApiUtils
