// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ArchivePreview, ArchiveRequest } from '@/object-types'
import { SW360_ARCHIVAL_URL } from '@/utils/env'

/**
 * Archival lives in its own Spring Boot service at /archival/api/... so we hit it
 * directly instead of going through the resource-server proxy (/resource/api/...).
 */
function archivalUrl(path: string): string {
    return `${SW360_ARCHIVAL_URL}/archival/api/${path}`
}

function userEmailFromToken(token: string): string {
    const basic = token.match(/^Basic\s+(.+)$/i)
    if (!basic) return ''
    try {
        const decoded = atob(basic[1])
        return decoded.split(':')[0] ?? ''
    } catch {
        return ''
    }
}

/**
 * Kicks off an archive on the backend and downloads the resulting TAR.GZ.
 * Returns the filename picked by the browser after the download finishes.
 */
async function archive(req: ArchiveRequest, token: string): Promise<string> {
    const authHeader = /^(Bearer|Basic)\s/i.test(token) ? token : `Bearer ${token}`

    const response = await fetch(archivalUrl('archival/archive'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/gzip',
            Authorization: authHeader,
            'X-User-Email': userEmailFromToken(token),
        },
        body: JSON.stringify(req),
    })

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Archive failed (${response.status}): ${body || response.statusText}`)
    }

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') ?? ''
    const match = disposition.match(/filename="?([^"]+)"?/i)
    const filename = match ? match[1] : `sw360_archive_${Date.now()}.tar.gz`

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    return filename
}

/**
 * Dry run: asks the backend what an archive would do (which dependencies get
 * archived, kept alive, or block the operation) without changing anything.
 */
async function preview(req: ArchiveRequest, token: string): Promise<ArchivePreview> {
    const authHeader = /^(Bearer|Basic)\s/i.test(token) ? token : `Bearer ${token}`

    const response = await fetch(archivalUrl('archival/preview'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: authHeader,
            'X-User-Email': userEmailFromToken(token),
        },
        body: JSON.stringify(req),
    })

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Preview failed (${response.status}): ${body || response.statusText}`)
    }

    return (await response.json()) as ArchivePreview
}

const ArchivalService = {
    archive,
    preview,
}

export default ArchivalService
