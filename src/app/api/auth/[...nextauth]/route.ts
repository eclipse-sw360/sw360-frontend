// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import KeycloakProvider from 'next-auth/providers/keycloak'

import { CREDENTIAL_PROVIDER } from '@/constants'
import { HttpStatus, UserCredentialInfo } from '@/object-types'
import AuthService from '@/services/auth.service'
import { ApiUtils } from '@/utils'
import { jwtDecode } from 'jwt-decode'
// import {encrypt, decrypt} from '@/utils/encryption';

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: CREDENTIAL_PROVIDER,
            credentials: {},
            async authorize(credentials) {
                // Add logic here to look up the user from the credentials supplied
                try {
                    const { username, password } = credentials as any
                    const userCredential: UserCredentialInfo = {
                        username: username,
                        password: password,
                    }
                    const authToken = await AuthService.generateToken(userCredential)

                    if (authToken === null) throw new Error('Error while fetching Auth Token')

                    const response = await ApiUtils.GET(`users/${username}`, authToken.access_token)
                    if (response.status !== HttpStatus.OK) {
                        throw new Error('Error while fetching User Group')
                    }

                    const data = await response.json()
                    return { ...authToken, userGroup: data.userGroup } as any
                } catch (e) {
                    console.error(e)
                    return null
                }
            },
        }),

        KeycloakProvider({
            clientId: `${process.env.SW360_KEYCLOAK_CLIENT_ID}`,
            clientSecret: `${process.env.SW360_KEYCLOAK_CLIENT_SECRET}`,
            issuer: `${process.env.AUTH_ISSUER}`,
            checks: 'state',
            // authorization: { params: { scope: "openid" } },
        }),
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async jwt({ token, account }) {
            const nowTimeStamp = Math.floor(Date.now() / 1000)
            if (account) {
                token.decoded = jwtDecode(account.access_token)
                token.access_token = account.id_token
                token.expires_in = account.expires_at
                token.refresh_token = account.refresh_token
                return token
            } else if (nowTimeStamp < token.expires_in) {
                return token
            } else {
                console.log('Token is expired!!')
            }

            // return { ...token, ...account }
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            // session.user.access_token = encrypt(token.access_token);
            session.user.access_token = token.access_token
            // session.user.id_token = encrypt(token.id_token);
            // session.user.scope = token.decoded.realm_access.roles;
            return session
        },
    },

    pages: {
        signIn: '/',
    },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
