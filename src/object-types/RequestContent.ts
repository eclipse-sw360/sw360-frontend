// Copyright (C) SW360 Frontend Authors (see <https://github.com/eclipse-sw360/sw360-frontend/blob/main/NOTICE>)

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export default interface RequestContent {
    method: string,
    headers: {
        'Content-Type'?: string,
        'Authorization'?: string
    },
    body: string | null
}
