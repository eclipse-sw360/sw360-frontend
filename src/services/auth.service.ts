// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { StatusCodes } from 'http-status-codes'
import { AuthToken, OAuthClient, RequestContent, UserCredentialInfo } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'

const generateToken = async (userData: UserCredentialInfo): Promise<null | AuthToken> => {
    try {
        const clientManagementURL: string = SW360_API_URL + '/authorization/client-management'
        let credentials: string = Buffer.from(`${userData.username}:${userData.password}`).toString('base64')

        const opts: RequestContent = {
            method: 'GET',
            headers: {},
            body: null,
        }

        opts.headers['Content-Type'] = 'application/json'
        opts.headers['Authorization'] = `Basic ${credentials}`

        let oAuthClient: OAuthClient | null = null

        const response = await fetch(clientManagementURL, opts)
        if (response.status === StatusCodes.OK) {
            const oauth_clients = (await response.json()) as Array<OAuthClient>
            oAuthClient = oauth_clients[0]
        }

        if (oAuthClient == null) {
            return null
        }

        credentials = Buffer.from(`${oAuthClient.client_id}:${oAuthClient.client_secret}`, `binary`).toString('base64')

        opts.headers['Authorization'] = `Basic ${credentials}`
        opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'

        const authorizationURL: string = SW360_API_URL + '/authorization/oauth/token'

        const tokenRequestBody = new URLSearchParams({
            grant_type: 'password',
            username: userData.username,
            password: userData.password,
        })

        let sw360token: AuthToken | null = null
        const tokenResponse = await fetch(authorizationURL, {
            method: 'POST',
            headers: opts.headers,
            body: tokenRequestBody,
        })
        if (tokenResponse.status == StatusCodes.OK) {
            sw360token = (await tokenResponse.json()) as AuthToken
        }
        return sw360token
    } catch (e) {
        console.error(e)
        return null
    }
}

const generateBasicToken = (userData: UserCredentialInfo): string => {
    const credentials: string = Buffer.from(`${userData.username}:${userData.password}`).toString('base64')
    const sw360token = `Basic ${credentials}`
    return sw360token
}

const AuthService = {
    generateToken,
    generateBasicToken,
}

export default AuthService
