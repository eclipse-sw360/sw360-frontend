// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import CredentialsProvider from 'next-auth/providers/credentials'
import { CREDENTIAL_PROVIDER } from '@/constants'
import AuthService from '@/services/auth.service'
import { HttpStatus, UserCredentialInfo } from '@/object-types'
import { ApiUtils } from '@/utils'
import { NextAuthOptions, User } from 'next-auth'

const basicAuthOption: NextAuthOptions = {
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

                    const authToken = await AuthService.generateBasicToken(userCredential)

                    if (authToken === null) throw new Error('Error while fetching Auth Token')

                    const response = await ApiUtils.GET(`users/${username}`, authToken)
                    if (response.status !== HttpStatus.OK) {
                        throw new Error('Error while fetching User Group')
                    }
                    const data = await response.json()
                    return { access_token: authToken, userGroup: data.userGroup, email: username } as any
                } catch (e) {
                    console.error(e)
                    return null
                }
            },
        })
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user } as User
        },
        async session({ session, token }) {
            session.user = token
            return session
        },
    },

    pages: {
        signIn: '/',
    },
}

export default basicAuthOption