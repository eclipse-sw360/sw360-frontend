// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import KeycloakProvider from "next-auth/providers/keycloak";
import { NextAuthOptions } from 'next-auth'
import { jwtDecode } from 'jwt-decode'

import UserGroupType from '../../../../object-types/enums/UserGroupType';

const keycloakProvider = KeycloakProvider({
    clientId: `${process.env.SW360_KEYCLOAK_CLIENT_ID}`,
    clientSecret: `${process.env.SW360_KEYCLOAK_CLIENT_SECRET}`,
    issuer: `${process.env.AUTH_ISSUER}`,
    checks: 'state',
    authorization: { params: { scope: "openid READ WRITE" } },
})


const keycloakAuthOption: NextAuthOptions = {
    providers: [keycloakProvider],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async jwt({ token, account }) {
            const nowTimeStamp = Math.floor(Date.now() / 1000)
            if (account) {
                token.decoded = jwtDecode(account.access_token)
                token.access_token = "Bearer " + account.id_token
                token.expires_in = account.expires_at
                token.refresh_token = account.refresh_token
                const tokenDetails = JSON.parse(JSON.stringify(token.decoded))
                const userGroup = getUserGroup(tokenDetails)
                token.userGroup = Array.isArray(userGroup) ? userGroup[0] : userGroup;
                return token
            } else if (nowTimeStamp < token.expires_in) {
                return token
            } else {
                console.log('Token is expired!!')
            }
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.user.access_token = token.access_token
            const decodedToken = jwtDecode(token.access_token)
            const tokenDetails = JSON.parse(JSON.stringify(decodedToken))
            const user_Group = getUserGroup(tokenDetails)
            session.user.userGroup  = Array.isArray(user_Group) ? user_Group[0] : user_Group;
            return session
        },
    },

    pages: {
        signIn: '/',
    },
}


function getUserGroup(tokenDetails: any) {
    return tokenDetails.userGroup ?
        (tokenDetails.userGroup as string[]).map((elem) => {
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