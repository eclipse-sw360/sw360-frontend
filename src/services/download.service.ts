// Copyright (C) TOSHIBA CORPORATION, 2023. Part of the SW360 Frontend Project.
// Copyright (C) Toshiba Software Development (Vietnam) Co., Ltd., 2023. Part of the SW360 Frontend Project.
// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import ApiUtils from '@/utils/api/authenticatedApi.util'

const parseFilenameFromContentDisposition = (response: Response): string | null => {
    const header = response.headers.get('Content-Disposition')
    if (!header) return null

    // Prefer RFC 5987 filename* (UTF-8 encoded)
    const filenameStar = header.match(/filename\*=UTF-8''(.+?)(?:;|$)/i)
    if (filenameStar) {
        return decodeURIComponent(filenameStar[1].trim())
    }

    // Fallback to plain filename="..."
    const filenameQuoted = header.match(/filename="(.+?)"/) || header.match(/filename=([^;\s]+)/)
    if (filenameQuoted) {
        return filenameQuoted[1].trim()
    }

    return null
}

const download = async (
    url: string,
    fileName: string,
    headers?: {
        [key: string]: string
    },
): Promise<number | undefined> => {
    try {
        const response = await ApiUtils.GET(url, undefined, headers)
        if (!response.ok) {
            return response.status
        }
        const resolvedFileName = parseFilenameFromContentDisposition(response) ?? fileName
        const blob = await response.blob()
        const objectURL = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = objectURL
        link.setAttribute('download', resolvedFileName)
        link.click()
        setTimeout(() => window.URL.revokeObjectURL(objectURL), 0)
        return response.status
    } catch (error: unknown) {
        ApiUtils.reportError(error)
    }
}

const DownloadService = {
    download,
}

export default DownloadService
