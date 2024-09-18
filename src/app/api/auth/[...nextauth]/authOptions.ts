// Copyright (C) TOSHIBA CORPORATION, 2024. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2024. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { AUTH_PROVIDER } from '@/utils/env';
import keycloakAuth from './keycloakAuthOption';
import { NextAuthOptions } from 'next-auth';
import basicAuthOption from './basicAuthOption';
import sw360OauthOption from './sw360OauthOption';
import sw360OauthPwdGrantTypeOption from './sw360OauthPwdGrantTypeOption';

let authOptions: NextAuthOptions

switch (AUTH_PROVIDER) {
    case 'sw360oauth':
        authOptions = sw360OauthOption
        break;
    case 'keycloak':
        authOptions = keycloakAuth
        break;
    case 'oauth-password-grant':
        authOptions = sw360OauthPwdGrantTypeOption
        break;
    case 'sw360basic':
    default:
        authOptions = basicAuthOption
        break;
}

export default authOptions

