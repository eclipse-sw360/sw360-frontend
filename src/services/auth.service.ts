// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { SW360_API_URL } from '@/utils/env';
import RequestContent from '@/object-types/RequestContent';
import UserCredentialInfo from '@/object-types/UserCredentialInfo';
import OAuthClient from '@/object-types/OAuthClient';
import HttpStatus from '@/object-types/enums/HttpStatus'
import { AuthToken } from '@/object-types/AuthToken';

const generateToken = async (userData: UserCredentialInfo) => {

    return {

        "access_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsic3czNjAtUkVTVC1BUEkiXSwidXNlcl9uYW1lIjoiYW1yaXQudmVybWFAc2llbWVucy5jb20iLCJzY29wZSI6WyJSRUFEIiwiV1JJVEUiXSwiZXhwIjoxNjk2NDg1ODk1LCJhdXRob3JpdGllcyI6WyJSRUFEIiwiV1JJVEUiXSwianRpIjoiSzNlck1CMmx3aURXTjk1T2UzTkYzSXhRbFpZIiwiY2xpZW50X2lkIjoiNDY2NmQzNzAyNjAzYmNmZWU4MGM4NGJmOTUwMDIxMDMifQ.DBdlzvOiGq7kUFSUzcn9ffa5R-U3fyd6aO31f5ACpxzjM2F3eqSLKUO8Muj459MebXrrbYXSpsVMVSUFVnvirpJtvMwFYDXP7-kSAcCes4-G5prKxbs1gWTCLpbuUjmsKomVJ4riFNp3js6iE82yRulKibED-E1EtU8Ggn-U-y5xy9aGBJ0rxXfhIkdgnsL4eXsCIStv2C7Cmpkx61dLCq9ULfncaipQIqGEmer9TxlGxHpt3nJ7ZDhxLnvYIQrrLDl54X2gZ39--cYvy3RCYtEdsfgS-gVTX6vomisdoLzKFZzBAOXPlhrPip4atA0J3474AClbzfneRxa7LVj_Ug",

        "token_type" : "bearer",

        "refresh_token" : "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsic3czNjAtUkVTVC1BUEkiXSwidXNlcl9uYW1lIjoiYW1yaXQudmVybWFAc2llbWVucy5jb20iLCJzY29wZSI6WyJSRUFEIiwiV1JJVEUiXSwiYXRpIjoiSzNlck1CMmx3aURXTjk1T2UzTkYzSXhRbFpZIiwiZXhwIjoxNzA0MjYxODk1LCJhdXRob3JpdGllcyI6WyJSRUFEIiwiV1JJVEUiXSwianRpIjoiamVHS1kyeU1NODh4SDlwMEtieTQtLTUzaXJVIiwiY2xpZW50X2lkIjoiNDY2NmQzNzAyNjAzYmNmZWU4MGM4NGJmOTUwMDIxMDMifQ.t8mATXhezs2xtezzOLEik2x5Cyq08j_QjunDKYQRHu5qzdlh1hyu-yaxeEBytA1epDEP4YfT9ZRGNDP-d3VP5MNH4yF-CqKKD5x1jy62RZzPnTgtVxJO3NFn_h0RPR2MwMa3aX9jqJ4jR4dymK-SaFq37KVhkNDKAZjAmEia0ALAeaVVPRrGaJW6qT9aFuxqX0camYMPfxtpKcJ_mJ6zqJBwP9n2T8sVkyPQL4B08AJO_eYaGDPteW4wuemrPH6VM4ryThRiwZ-iamBCIjItoxo4VEmx8u_d_6bFHr8SuvIeIXLna-muCkN2MZ7w3M589XhZL2Z7O6sZD9dB76NgZg",

        "expires_in" : 7775999,

        "scope" : "READ WRITE",

        "jti" : "K3erMB2lwiDWN95Oe3NF3IxQlZY"

    }

    const clientManagementURL: string = SW360_API_URL + '/authorization/client-management';
    let credentials: string = Buffer.from(`${userData.username}:${userData.password}`).toString('base64');

    const opts: RequestContent = { method: 'GET', headers: {}, body: null };

    opts.headers['Content-Type'] = 'application/json';
    opts.headers['Authorization'] = `Basic ${credentials}`;

    let oAuthClient: OAuthClient | null = null;

    await fetch(clientManagementURL, opts)
        .then((response) => {
            if (response.status == HttpStatus.OK) {
                return response.text();
            } else {
                return null;
            }
        })
        .then((json) => {
            try {
                oAuthClient = JSON.parse(json)[0];
            } catch (err) {
                oAuthClient = null;
            }
        })
        .catch(() => {
            oAuthClient = null;
        });

    if (oAuthClient == null) {
        return null;
    }

    credentials = Buffer.from(`${oAuthClient.client_id}:${oAuthClient.client_secret}`, `binary`).toString(
        'base64'
    );

    opts.headers['Authorization'] = `Basic ${credentials}`;
    const authorizationURL: string = SW360_API_URL + '/authorization/oauth/token?grant_type=password&username=' + userData.username + '&password=' + userData.password;

    let sw360token: AuthToken | null = null
    await fetch(authorizationURL, opts)
        .then((response) => {
            if (response.status == HttpStatus.OK) {
                return response.text();
            } else {
                return undefined;
            }
        })
        .then((json) => {
            try {
                sw360token = JSON.parse(json);
            } catch (err) {
                sw360token = null;
            }
        })
        .catch(() => {
            oAuthClient = null;
        });;

    return sw360token;
}

const AuthService = {
    generateToken
}

export default AuthService
