// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { StatusCodes } from 'http-status-codes'
import { RequestContent } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'

const base = SW360_API_URL + '/resource/api'

// Configuration constants
const DEFAULT_TIMEOUT_MS = 30000 // 30 seconds
const DEFAULT_RETRIES = 3
const RETRY_STATUS_CODES = [
    StatusCodes.REQUEST_TIMEOUT,
    StatusCodes.TOO_MANY_REQUESTS,
    StatusCodes.INTERNAL_SERVER_ERROR,
    StatusCodes.BAD_GATEWAY,
    StatusCodes.SERVICE_UNAVAILABLE,
    StatusCodes.GATEWAY_TIMEOUT,
]

/**
 * Custom API Error class for centralized error handling
 */
export class ApiError extends Error {
    public status?: number
    public code: string
    public isRetryable: boolean
    public cause?: unknown

    constructor(
        message: string,
        options: {
            status?: number
            code?: string
            isRetryable?: boolean
            cause?: unknown
        } = {},
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = options.status
        this.code = options.code ?? 'UNKNOWN_ERROR'
        this.isRetryable = options.isRetryable ?? false
        this.cause = options.cause
    }
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    return Math.min(baseDelay * Math.pow(2, attempt), 10000) // Max 10 seconds
}

/**
 * Determine if an error or response status is retryable
 */
function isRetryableError(error: unknown): boolean {
    if (error instanceof TypeError) {
        // Network errors (failed to fetch)
        return true
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
        // Timeout - could be temporary
        return true
    }
    return false
}

/**
 * Transform errors into ApiError instances
 */
function handleError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error
    }

    if (error instanceof TypeError) {
        return new ApiError('Network error - please check your connection', {
            code: 'NETWORK_ERROR',
            isRetryable: true,
            cause: error,
        })
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
        return new ApiError('Request timed out', {
            code: 'TIMEOUT',
            isRetryable: true,
            cause: error,
        })
    }

    if (error instanceof Error) {
        return new ApiError(error.message, {
            code: 'UNKNOWN_ERROR',
            cause: error,
        })
    }

    return new ApiError('An unexpected error occurred', {
        code: 'UNKNOWN_ERROR',
    })
}

/**
 * Core send function with timeout, retry, and error handling
 */
async function send({
    method,
    path,
    data,
    token,
    signal,
    headers,
    timeout = DEFAULT_TIMEOUT_MS,
    retries = DEFAULT_RETRIES,
}: {
    method: string
    path: string
    data: object | null
    token: string
    signal?: unknown
    headers?: {
        [key: string]: string
    }
    timeout?: number
    retries?: number
}): Promise<Response> {
    const request_content: RequestContent = {
        method,
        headers: {
            Accept: 'application/*',
        },
        body: null,
    }

    if (data) {
        if (data instanceof FormData) {
            request_content['body'] = data
        } else {
            request_content.headers['Content-Type'] = 'application/json'
            request_content['body'] = JSON.stringify(data)
        }
    }

    if (headers) {
        request_content.headers = {
            ...request_content.headers,
            ...headers,
        }
    }

    if (token) {
        request_content.headers['Authorization'] = `${token}`
    }

    // Handle abort signal - use provided signal or create timeout-based one
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined

    if (signal !== undefined && signal instanceof AbortSignal) {
        request_content.signal = signal
    } else if (timeout > 0) {
        controller = new AbortController()
        request_content.signal = controller.signal
        timeoutId = setTimeout(() => controller?.abort(), timeout)
    }

    const url = `${base}/${path}`
    let lastError: ApiError | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, request_content)

            // Clear timeout on successful response
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            // Check if response status indicates a retryable error
            if (RETRY_STATUS_CODES.includes(response.status) && attempt < retries) {
                lastError = new ApiError(`Request failed with status ${response.status}`, {
                    status: response.status,
                    code: 'HTTP_ERROR',
                    isRetryable: true,
                })
                await sleep(getRetryDelay(attempt))
                continue
            }

            return response
        } catch (error) {
            // Clear timeout on error
            if (timeoutId) {
                clearTimeout(timeoutId)
            }

            lastError = handleError(error)

            // Only retry if error is retryable and we have retries left
            if (isRetryableError(error) && attempt < retries) {
                await sleep(getRetryDelay(attempt))

                // Reset timeout for retry
                if (controller && timeout > 0) {
                    controller = new AbortController()
                    request_content.signal = controller.signal
                    timeoutId = setTimeout(() => controller?.abort(), timeout)
                }
                continue
            }

            throw lastError
        }
    }

    // If we've exhausted all retries
    throw (
        lastError ??
        new ApiError('Request failed after maximum retries', {
            code: 'MAX_RETRIES_EXCEEDED',
        })
    )
}

function GET(
    path: string,
    token: string,
    signal?: unknown,
    headers?: {
        [key: string]: string
    },
): Promise<Response> {
    return send({
        method: 'GET',
        path,
        token,
        data: null,
        signal,
        headers,
    })
}

function DELETE(path: string, token: string): Promise<Response> {
    return send({
        method: 'DELETE',
        path,
        token,
        data: null,
    })
}

function POST(path: string, data: object, token: string): Promise<Response> {
    return send({
        method: 'POST',
        path,
        data,
        token,
    })
}

function PUT(path: string, data: object, token: string): Promise<Response> {
    return send({
        method: 'PUT',
        path,
        data,
        token,
    })
}

function PATCH(path: string, data: object, token: string): Promise<Response> {
    return send({
        method: 'PATCH',
        path,
        data,
        token,
    })
}

const ApiUtils = {
    GET,
    DELETE,
    POST,
    PUT,
    PATCH,
}

export default ApiUtils
