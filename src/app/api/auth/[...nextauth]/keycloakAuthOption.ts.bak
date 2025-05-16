// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import KeycloakProvider from "next-auth/providers/keycloak"
import { NextAuthOptions } from 'next-auth'
import { jwtDecode } from 'jwt-decode'
import { UserGroupType } from '@/object-types'
import { SW360_KEYCLOAK_CLIENT_ID, SW360_KEYCLOAK_CLIENT_SECRET, AUTH_ISSUER } from '@/utils/env'

const keycloakProvider = KeycloakProvider({
    clientId: SW360_KEYCLOAK_CLIENT_ID,
    clientSecret: SW360_KEYCLOAK_CLIENT_SECRET,
    issuer: AUTH_ISSUER,
    checks: 'state',
    authorization: { params: { scope: "openid READ WRITE" } },
})

const keycloakAuthOption: NextAuthOptions = {
    providers: [keycloakProvider],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        jwt({ token, account }) {
            if (account && account.access_token !== undefined && account.id_token !== undefined 
                && account.expires_at !== undefined && account.refresh_token !== undefined) {
                token.decoded = jwtDecode(account.access_token)
                token.access_token = "Bearer " + account.id_token
                token.expires_in = account.expires_at
                token.refresh_token = account.refresh_token
                const tokenDetails = JSON.parse(JSON.stringify(token.decoded)) as { userGroup?: string[] }
                const userGroup = getUserGroup(tokenDetails)
                token.userGroup = userGroup[0]
            }
            return token
        },
        session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.user.access_token = token.access_token
            const decodedToken = jwtDecode(token.access_token)
            const tokenDetails = JSON.parse(JSON.stringify(decodedToken)) as { userGroup?: string[] }
            const userGroup = getUserGroup(tokenDetails)
            session.user.userGroup = userGroup[0]
            return session
        },
    },

    pages: {
        signIn: '/',
    },
}


function getUserGroup(tokenDetails: { userGroup?: string[] }): UserGroupType[] {
    return tokenDetails.userGroup ?
        tokenDetails.userGroup.map((elem) => {
            if (elem === '/ADMIN') {
                return UserGroupType.ADMIN;
            } else if (elem === '/CLEARING_ADMIN') {
                return UserGroupType.CLEARING_ADMIN;
            } else if (elem === '/ECC_ADMIN') {
                return UserGroupType.ECC_ADMIN;
            } else if (elem === '/SECURITY_ADMIN') {
                return UserGroupType.SECURITY_ADMIN;
            } else if (elem === '/SW360_ADMIN') {
                return UserGroupType.SW360_ADMIN;
            } else if (elem === '/CLEARING_EXPERT') {
                return UserGroupType.CLEARING_EXPERT;
            } else {
                return UserGroupType.USER;
            }
        }) : [UserGroupType.USER];
}

export default keycloakAuthOption;
