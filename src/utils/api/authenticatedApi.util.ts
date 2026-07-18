// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

'use client'

import { StatusCodes } from 'http-status-codes'
import { getSession } from 'next-auth/react'
import CommonUtils from '@/utils/common.utils'
import { dispatchSessionExpiredEvent } from '@/utils/sessionExpiry.utils'
import CoreApiUtils, { ApiError } from './api.util'

type RequestHeaders = {
    [key: string]: string
}

const resolveAccessToken = async (): Promise<string> => {
    const session = await getSession()

    if (
        CommonUtils.isNullOrUndefined(session) ||
        CommonUtils.isNullOrUndefined(session.user?.access_token) ||
        session.user.access_token === ''
    ) {
        dispatchSessionExpiredEvent()
        throw new ApiError('Session has expired', {
            code: 'UNAUTHORIZED',
        })
    }

    return session.user.access_token
}

export const getAuthenticatedAccessToken = async (): Promise<string> => resolveAccessToken()

const withUnauthorizedHandling = (response: Response): Response => {
    if (response.status === StatusCodes.UNAUTHORIZED) {
        dispatchSessionExpiredEvent()
    }
    return response
}

const GET = async (path: string, signal?: unknown, headers?: RequestHeaders): Promise<Response> => {
    return withUnauthorizedHandling(await CoreApiUtils.GET(path, await resolveAccessToken(), signal, headers))
}

const DELETE = async (path: string, data?: object, headers?: RequestHeaders): Promise<Response> => {
    return withUnauthorizedHandling(await CoreApiUtils.DELETE(path, await resolveAccessToken(), data, headers))
}

const POST = async (path: string, data: object, headers?: RequestHeaders): Promise<Response> => {
    return withUnauthorizedHandling(await CoreApiUtils.POST(path, data, await resolveAccessToken(), headers))
}

const PUT = async (path: string, data: object, headers?: RequestHeaders): Promise<Response> => {
    return withUnauthorizedHandling(await CoreApiUtils.PUT(path, data, await resolveAccessToken(), headers))
}

const PATCH = async (path: string, data: object, headers?: RequestHeaders): Promise<Response> => {
    return withUnauthorizedHandling(await CoreApiUtils.PATCH(path, data, await resolveAccessToken(), headers))
}

const AuthenticatedApiUtils = {
    GET,
    DELETE,
    POST,
    PUT,
    PATCH,
    reportError: CoreApiUtils.reportError,
}

export default AuthenticatedApiUtils
