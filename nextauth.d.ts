// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import 'next-auth'

enum UserGroupType {
    USER = 'USER',
    ADMIN = 'ADMIN',
    CLEARING_ADMIN = 'CLEARING_ADMIN',
    ECC_ADMIN = 'ECC_ADMIN',
    SECURITY_ADMIN = 'SECURITY_ADMIN',
    SW360_ADMIN = 'SW360_ADMIN',
    CLEARING_EXPERT = 'CLEARING_EXPERT',
}

interface SW360User extends DefaultUser {
    id: string
    access_token: string
    exp: number
    expires_in: number
    iat: number
    jti: string
    refresh_token: string
    scope: string
    token_type: string
    userGroup: UserGroupType
    email: string
}

declare module 'next-auth' {
    type User = SW360User
    interface Session {
        user?: User
    }
}

declare module 'next-auth/jwt' {
    type JWT = SW360User
}
