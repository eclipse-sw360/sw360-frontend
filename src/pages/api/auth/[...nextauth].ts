// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import UserCredentialInfo from "@/object-types/UserCredentialInfo"
import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import AuthService from "@/services/auth.service"
import { CREDENTIAL_PROVIDER } from "@/object-types/Constants"

export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        CredentialsProvider({
            name: CREDENTIAL_PROVIDER,
            credentials: {
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                const { username, password } = credentials as any;
                const userCredential: UserCredentialInfo = {
                    username: username,
                    password: password
                }
                const authToken = AuthService.generateToken(userCredential);
                return authToken as any;
            }
        })
    ],

    session: {
        strategy: "jwt"
    },

    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            session.user = token;

            return session;
        },
    },

    pages: {
        signIn: "/"
    },
}
export default NextAuth(authOptions)