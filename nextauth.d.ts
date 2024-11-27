// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import 'next-auth'
import { UserGroupType } from '@/object-types'
import { Profile, DefaultUser } from 'next-auth'

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
    email: string
    userGroup: UserGroupType
    id_token: string
    decoded: string
}

interface SW360Profile extends Profile {
    userGroup: UserGroupType
}

declare module 'next-auth' {
    type User = SW360User
    type AuthProfile = SW360Profile
    interface Session {
        user: User
    }
}

declare module 'next-auth/jwt' {
    type JWT = SW360User
}
