// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { AuthToken, HttpStatus, OAuthClient, RequestContent, UserCredentialInfo } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'

const generateToken = async (userData: UserCredentialInfo) => {
    const clientManagementURL: string = SW360_API_URL + '/rest/authorization/client-management'
    let credentials: string = Buffer.from(`${userData.username}:${userData.password}`).toString('base64')

    const opts: RequestContent = { method: 'GET', headers: {}, body: null }

    opts.headers['Content-Type'] = 'application/json'
    opts.headers['Authorization'] = `Basic ${credentials}`

    let oAuthClient: OAuthClient | null = null

    await fetch(clientManagementURL, opts)
        .then((response) => {
            if (response.status == HttpStatus.OK) {
                return response.text()
            } else {
                return null
            }
        })
        .then((json) => {
            try {
                const oauth_clients: Array<OAuthClient> = JSON.parse(json) as Array<OAuthClient>
                oAuthClient = oauth_clients[0]
            } catch (err) {
                oAuthClient = null
            }
        })
        .catch(() => {
            oAuthClient = null
        })

    if (oAuthClient == null) {
        return null
    }

    credentials = Buffer.from(`${oAuthClient.client_id}:${oAuthClient.client_secret}`, `binary`).toString('base64')

    opts.headers['Authorization'] = `Basic ${credentials}`
    const authorizationURL: string =
        SW360_API_URL +
        '/rest/authorization/oauth/token?grant_type=password&username=' +
        userData.username +
        '&password=' +
        userData.password

    let sw360token: AuthToken | null = null
    await fetch(authorizationURL, opts)
        .then((response) => {
            if (response.status == HttpStatus.OK) {
                return response.text()
            } else {
                return undefined
            }
        })
        .then((json) => {
            try {
                sw360token = JSON.parse(json) as AuthToken
            } catch (err) {
                sw360token = null
            }
        })
        .catch(() => {
            oAuthClient = null
        })
    return sw360token
}

const AuthService = {
    generateToken,
}

export default AuthService
