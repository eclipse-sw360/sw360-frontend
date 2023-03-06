/*
 * Copyright (C) TOSHIBA CORPORATION, 2023.
 * Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023.
 * SPDX-License-Identifier: EPL-2.0
 * License-Filename: LICENSE
 */

export default interface OAuthClient {
    description: string,
    client_id: string,
    client_secret: string,
    authorities: Array<string>
    scope: Array<string>
    access_token_validity: number,
    refresh_token_validity: number
}