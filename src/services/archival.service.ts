// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import {
    ArchivalEntityType,
    ArchivalRecord,
    ArchivePreview,
    ArchiveRequest,
    RestorePreview,
    RestoreResult,
} from '@/object-types'
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

async function listRecords(token: string): Promise<ArchivalRecord[]> {
    const response = await fetch(archivalUrl('records'), {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: token,
        },
    })

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Loading archival records failed (${response.status}): ${body || response.statusText}`)
    }

    return (await response.json()) as ArchivalRecord[]
}

async function restorePreview(bundle: File, token: string): Promise<RestorePreview> {
    const form = new FormData()
    form.append('bundle', bundle)
    // No Content-Type header: the browser sets multipart/form-data with the boundary.
    const response = await fetch(archivalUrl('restore/preview'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: token,
        },
        body: form,
    })

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Restore preview failed (${response.status}): ${body || response.statusText}`)
    }

    return (await response.json()) as RestorePreview
}

async function restore(bundle: File, token: string): Promise<RestoreResult> {
    const form = new FormData()
    form.append('bundle', bundle)
    const response = await fetch(archivalUrl('restore'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: token,
        },
        body: form,
    })

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Restore failed (${response.status}): ${body || response.statusText}`)
    }

    return (await response.json()) as RestoreResult
}

async function deleteRecord(id: string, token: string): Promise<void> {
    const response = await fetch(archivalUrl(`records/${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: {
            Authorization: token,
        },
    })

    if (!response.ok && response.status !== 404) {
        const body = await response.text().catch(() => '')
        throw new Error(`Deleting archival record failed (${response.status}): ${body || response.statusText}`)
    }
}

async function searchArchived(name: string, type: ArchivalEntityType, token: string): Promise<ArchivalRecord[]> {
    const response = await fetch(
        archivalUrl(`records/search?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`),
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: token,
            },
        },
    )

    if (!response.ok) {
        const body = await response.text().catch(() => '')
        throw new Error(`Archived-entity search failed (${response.status}): ${body || response.statusText}`)
    }

    return (await response.json()) as ArchivalRecord[]
}

const ArchivalService = {
    archive,
    preview,
    listRecords,
    restorePreview,
    restore,
    deleteRecord,
    searchArchived,
}

export default ArchivalService
