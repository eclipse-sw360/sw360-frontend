// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import crypto from 'crypto';

import { CREDENTIAL_PROVIDER } from '@/constants'
import { HttpStatus, UserCredentialInfo } from '@/object-types'
import AuthService from '@/services/auth.service'
import { ApiUtils } from '@/utils'
import { SW360User } from '../../../../../nextauth'
import { SW360_API_URL, SW360_REST_CLIENT_ID, SW360_REST_CLIENT_SECRET } from '@/utils/env';

let codeVerifier: crypto.BinaryLike;
export const authOptions: NextAuthOptions = {
    // Configure one or more authentication providers
    providers: [
        {
            id: "sw360-backend",
            name: "sw360 backend",
            type: "oauth",
            version: "2.0",
            wellKnown: SW360_API_URL+"/authorization/.well-known/oauth-authorization-server",
            checks: ["pkce", "state"],
            idToken: true,
            // Partial GH Copilot generated- start
            authorization: { params: { scope: "openid READ WRITE ADMIN" , code_challenge_method: "S256", code_challenge: (() => {
                codeVerifier = codeVerifierGenerator();
                const codeChallenge = codeChallengeGenerator(codeVerifier);
                return codeChallenge;
              })(), } },
            // Partial GH Copilot generated- end
            clientId: SW360_REST_CLIENT_ID,
            clientSecret: SW360_REST_CLIENT_SECRET,
            profile: async (profiles, tokens) => {
                return {
                    exp: tokens.exp,
                    expires_in: tokens.expires_in,
                    iat: tokens.iat,
                    refresh_token: tokens.refresh_token,
                    scope: tokens.scope,
                    token_type: tokens.token_type,
                    userGroup: profiles.userGroup,
                    email: profiles.email,
                    access_token: 'Bearer ' +tokens.access_token,
                    id: profiles.sub,
                } as SW360User;
            },
        },
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
                    return { access_token: authToken, userGroup: data.userGroup, email: username} as any
                } catch (e) {
                    console.error(e)
                    return null
                }
            },
        }),
        CredentialsProvider({
            name: CREDENTIAL_PROVIDER,
            credentials: {},
            async authorize(credentials) {
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
                    return { ...authToken, userGroup: data.userGroup, email: username } as any
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


  // GH Copilot generated- start
  function codeVerifierGenerator() {
    const randomBytes = crypto.randomBytes(32);
    const verifier = base64urlEncode(randomBytes);
    return verifier;
  }

  function base64urlEncode(buffer: Buffer) {
    return buffer.toString('base64')
      .replace('+', '-')
      .replace('/', '_')
      .replace(/=+$/, '');
  }


  function codeChallengeGenerator(verifier: crypto.BinaryLike) {
    const hash = crypto.createHash('sha256').update(verifier).digest();
    const challenge = base64urlEncode(hash);
    return challenge;
  }
  // GH Copilot generated- end


