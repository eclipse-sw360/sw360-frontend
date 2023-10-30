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

import { CREDENTIAL_PROVIDER } from '@/constants'
import { HttpStatus, UserCredentialInfo } from '@/object-types'
import AuthService from '@/services/auth.service'
import { ApiUtils } from '@/utils'

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
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user }
        },
        async session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.user = token

            return session
        },
    },

    pages: {
        signIn: '/',
    },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
