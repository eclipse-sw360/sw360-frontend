// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { ArchivePreview, ArchiveRequest } from '@/object-types'
import { SW360_API_URL } from '@/utils/env'

function archivalUrl(path: string): string {
    return `${SW360_API_URL}/resource/api/archival/${path}`
}

async function archive(req: ArchiveRequest, token: string): Promise<string> {
    const response = await fetch(archivalUrl('archive'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/gzip',
            Authorization: token,
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

async function preview(req: ArchiveRequest, token: string): Promise<ArchivePreview> {
    const response = await fetch(archivalUrl('preview'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: token,
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
