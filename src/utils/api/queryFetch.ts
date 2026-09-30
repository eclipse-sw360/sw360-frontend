// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { StatusCodes } from "http-status-codes"
import AuthenticatedApiUtils from "@/utils/api/authenticatedApi.util"
import { ErrorDetails } from "@/object-types"
import { ApiError } from "@/utils/api/api.util"


export async function fetchData<TData>(path: string, signal?: AbortSignal): Promise<TData> {
    // Goes through the Layer of token resolution, 401 handling and retry
    const response = await AuthenticatedApiUtils.GET(path, signal)

    if (response.status === StatusCodes.OK) {
        return (await response.json()) as TData
    }

    // Non-OK: surface the backend's message when available
    let message = `Request failed with status ${response.status}`
    try {
        const body = (await response.json()) as ErrorDetails
        if (body?.message) message = body.message
    } catch {
        // ignore parse errors; keep the generic message
    }

    throw new ApiError(message, { status: response.status })
}
