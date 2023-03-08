/*
 * Copyright (C) TOSHIBA CORPORATION, 2023.
 * Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023.
 * SPDX-License-Identifier: EPL-2.0
 * License-Filename: LICENSE
 */

export interface AuthToken {
    access_token: string,
    token_type: string,
    refresh_token: string,
    expires_in: number,
    scope: string,
    jti: string
}
