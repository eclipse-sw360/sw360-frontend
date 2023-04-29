// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export default interface OAuthClient {
    description: string,
    client_id: string,
    client_secret: string,
    authorities: Array<string>
    scope: Array<string>
    access_token_validity: number,
    refresh_token_validity: number
}