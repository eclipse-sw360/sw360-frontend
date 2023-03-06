/*
 * Copyright (C) TOSHIBA CORPORATION, 2023.
 * Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023.
 * SPDX-License-Identifier: EPL-2.0
 * License-Filename: LICENSE
 */

export default interface RequestContent {
    method: string,
    headers: {
        'Content-Type'?: string,
        'Authorization'?: string
    },
    body: string | null
}
