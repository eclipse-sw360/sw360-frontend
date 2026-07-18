// Copyright (c) Helio Chissini de Castro, 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import UnauthenticatedApiUtils, { ApiError } from './api/api.util'
import AuthenticatedApiUtils from './api/authenticatedApi.util'
import CommonUtils from './common.utils'

// API client usage guide:
// - Use AuthenticatedApiUtils for protected backend endpoints.
//   It resolves the current session token and dispatches session-expired flow on 401.
// - Use UnauthenticatedApiUtils for public/anonymous endpoints (for example, version/footer calls).
// Backward compatibility: ApiUtils stays mapped to the unauthenticated/transport client.
const ApiUtils = UnauthenticatedApiUtils

export { ApiError, ApiUtils, AuthenticatedApiUtils, CommonUtils, UnauthenticatedApiUtils }
