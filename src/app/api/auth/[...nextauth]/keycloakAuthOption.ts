// Copyright (C) Siemens AG, 2024. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { jwtDecode } from 'jwt-decode'
import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import KeycloakProvider from 'next-auth/providers/keycloak'
import { UserGroupType } from '@/object-types'
import { AUTH_ISSUER, SW360_KEYCLOAK_CLIENT_ID, SW360_KEYCLOAK_CLIENT_SECRET } from '@/utils/env'

interface KeycloakRefreshTokenResponse {
    access_token: string
    id_token: string
    expires_in: number
    refresh_token: string
    token_type: string
    scope: string
}

interface KeycloakRefreshTokenError {
    error: string
    error_description: string
}

const keycloakProvider = KeycloakProvider({
    clientId: SW360_KEYCLOAK_CLIENT_ID,
    clientSecret: SW360_KEYCLOAK_CLIENT_SECRET,
    issuer: AUTH_ISSUER,
    checks: 'state',
    authorization: {
        params: {
            scope: 'openid READ WRITE',
        },
    },
})

const keycloakAuthOption: NextAuthOptions = {
    providers: [
        keycloakProvider,
    ],

    session: {
        strategy: 'jwt',
    },

    callbacks: {
        async jwt({ token, account }) {
            if (
                account &&
                account.access_token !== undefined &&
                account.id_token !== undefined &&
                account.expires_at !== undefined &&
                account.refresh_token !== undefined
            ) {
                token.decoded = jwtDecode(account.access_token)
                token.access_token = 'Bearer ' + account.id_token
                token.expires_in = account.expires_at
                token.refresh_token = account.refresh_token
                const tokenDetails = JSON.parse(JSON.stringify(token.decoded)) as {
                    userGroup?: string[]
                }
                const userGroup = getUserGroup(tokenDetails)
                token.userGroup = userGroup[0]
                return token
            }

            if (Date.now() < (token.expires_in - 30) * 1000) {
                return token
            }

            return await refreshAccessToken(token)
        },
        session({ session, token }) {
            // Send properties to the client, like an access_token from a provider.
            session.user.access_token = token.access_token
            const decodedToken = jwtDecode(token.access_token)
            const tokenDetails = JSON.parse(JSON.stringify(decodedToken)) as {
                userGroup?: string[]
            }
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
    return tokenDetails.userGroup
        ? tokenDetails.userGroup.map((elem) => {
              if (elem === '/ADMIN') {
                  return UserGroupType.ADMIN
              } else if (elem === '/CLEARING_ADMIN') {
                  return UserGroupType.CLEARING_ADMIN
              } else if (elem === '/ECC_ADMIN') {
                  return UserGroupType.ECC_ADMIN
              } else if (elem === '/SECURITY_ADMIN') {
                  return UserGroupType.SECURITY_ADMIN
              } else if (elem === '/SW360_ADMIN') {
                  return UserGroupType.SW360_ADMIN
              } else if (elem === '/CLEARING_EXPERT') {
                  return UserGroupType.CLEARING_EXPERT
              } else {
                  return UserGroupType.USER
              }
          })
        : [
              UserGroupType.USER,
          ]
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const tokenEndpoint = `${AUTH_ISSUER}/protocol/openid-connect/token`
        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: SW360_KEYCLOAK_CLIENT_ID,
                client_secret: SW360_KEYCLOAK_CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: token.refresh_token,
            }),
        })

        const refreshedTokens = (await response.json()) as KeycloakRefreshTokenResponse | KeycloakRefreshTokenError

        if (!response.ok) {
            const errorResponse = refreshedTokens as KeycloakRefreshTokenError
            throw new Error(errorResponse.error_description || errorResponse.error)
        }

        const successResponse = refreshedTokens as KeycloakRefreshTokenResponse
        const decoded = jwtDecode(successResponse.access_token)
        const tokenDetails = JSON.parse(JSON.stringify(decoded)) as {
            userGroup?: string[]
        }
        const userGroup = getUserGroup(tokenDetails)

        return {
            ...token,
            access_token: 'Bearer ' + successResponse.id_token,
            expires_in: Math.floor(Date.now() / 1000) + successResponse.expires_in,
            refresh_token: successResponse.refresh_token ?? token.refresh_token,
            decoded: decoded,
            userGroup: userGroup[0],
        }
    } catch (error) {
        console.error(error)
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        }
    }
}

export default keycloakAuthOption
