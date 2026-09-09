// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { AttachmentUsages, SaveUsagesPayload } from '@/object-types'

export interface License {
    name: string
    text: string
}

export function restoreLicenseUsages(attachmentUsages: AttachmentUsages): SaveUsagesPayload {
    const releasesByAttachment = new Map<string, Set<string>>()
    for (const release of attachmentUsages._embedded['sw360:release']) {
        const releaseId = release._links?.self.href.split('/').at(-1) ?? ''
        for (const attachment of release.attachments ?? []) {
            if (!attachment.attachmentContentId) continue
            const releaseIds = releasesByAttachment.get(attachment.attachmentContentId) ?? new Set<string>()
            releaseIds.add(releaseId)
            releasesByAttachment.set(attachment.attachmentContentId, releaseIds)
        }
    }

    const selected = new Set<string>()
    const selectedConcludedUsages = new Set<string>()
    const deselectedConcludedUsages = new Set<string>()
    const ignoredLicenses: SaveUsagesPayload['ignoredLicenses'] = {}
    for (const usage of attachmentUsages._embedded['sw360:attachmentUsages']) {
        const licenseInfo = usage.usageData?.licenseInfo
        if (!licenseInfo) continue
        const attachmentReleaseIds = releasesByAttachment.get(usage.attachmentContentId) ?? new Set<string>()
        const releaseIds = usage.owner?.releaseId
            ? [
                  ...attachmentReleaseIds,
              ].filter((releaseId) => releaseId === usage.owner?.releaseId)
            : attachmentReleaseIds
        for (const releaseId of releaseIds) {
            const prefix = `${licenseInfo.projectPath ? `${licenseInfo.projectPath}-` : ''}${releaseId}`
            const key = `${prefix}_licenseInfo_${usage.attachmentContentId}`
            selected.add(key)
            ignoredLicenses[`${prefix}_${usage.attachmentContentId}`] = [
                ...(licenseInfo.excludedLicenseIds ?? []),
            ]
            if (licenseInfo.includeConcludedLicense === true) selectedConcludedUsages.add(key)
            else if (licenseInfo.includeConcludedLicense === false) deselectedConcludedUsages.add(key)
        }
    }
    return {
        selected: [
            ...selected,
        ],
        deselected: [],
        selectedConcludedUsages: [
            ...selectedConcludedUsages,
        ],
        deselectedConcludedUsages: [
            ...deselectedConcludedUsages,
        ],
        ignoredLicenses,
    }
}

export function toggleAttachmentUsage(payload: SaveUsagesPayload, key: string): SaveUsagesPayload {
    const selected = payload.selected.includes(key)
    const ignoredLicenses = {
        ...payload.ignoredLicenses,
    }
    if (selected) delete ignoredLicenses[key.replace('_licenseInfo_', '_')]
    return {
        ...payload,
        ignoredLicenses,
        selectedConcludedUsages: selected
            ? payload.selectedConcludedUsages.filter((value) => value !== key)
            : payload.selectedConcludedUsages,
        deselectedConcludedUsages: selected
            ? payload.deselectedConcludedUsages.filter((value) => value !== key)
            : payload.deselectedConcludedUsages,
        selected: selected
            ? payload.selected.filter((value) => value !== key)
            : [
                  ...payload.selected,
                  key,
              ],
        deselected: selected
            ? [
                  ...payload.deselected,
                  key,
              ]
            : payload.deselected.filter((value) => value !== key),
    }
}

export function toggleLicenseUsage(
    payload: SaveUsagesPayload,
    attachmentKey: string,
    ignoredKey: string,
    licenseName: string,
    licenses: License[],
): SaveUsagesPayload {
    const attachmentSelected = payload.selected.includes(attachmentKey)
    const ignored = new Set(payload.ignoredLicenses[ignoredKey] ?? [])
    if (!attachmentSelected) {
        ignored.clear()
        for (const license of licenses) {
            if (license.name !== licenseName) ignored.add(license.name)
        }
    } else if (ignored.has(licenseName)) {
        ignored.delete(licenseName)
    } else {
        ignored.add(licenseName)
    }
    const allIgnored = licenses.every((license) => ignored.has(license.name))
    const nextPayload = attachmentSelected === !allIgnored ? payload : toggleAttachmentUsage(payload, attachmentKey)
    if (allIgnored) return nextPayload
    return {
        ...nextPayload,
        ignoredLicenses: {
            ...nextPayload.ignoredLicenses,
            [ignoredKey]: [
                ...ignored,
            ],
        },
    }
}

// One cache per page load, shared across project paths. Only explicitly requested details enter the queue.
export class LicenseDetailLoader {
    private readonly controller = new AbortController()
    private readonly cache = new Map<string, Promise<License[]>>()
    private readonly queue: Array<() => Promise<void>> = []
    private active = 0

    constructor(
        private readonly fetchDetails: (
            releaseId: string,
            attachmentId: string,
            signal: AbortSignal,
        ) => Promise<License[]>,
        private readonly concurrency = 4,
    ) {}

    get signal(): AbortSignal {
        return this.controller.signal
    }

    load(releaseId: string, attachmentId: string): Promise<License[]> {
        if (this.signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'))
        const key = `${releaseId}_${attachmentId}`
        const cached = this.cache.get(key)
        if (cached) return cached
        const promise = new Promise<License[]>((resolve, reject) => {
            const abort = () => reject(new DOMException('Aborted', 'AbortError'))
            this.signal.addEventListener('abort', abort, {
                once: true,
            })
            this.queue.push(async () => {
                try {
                    this.signal.throwIfAborted()
                    const licenses = await this.fetchDetails(releaseId, attachmentId, this.signal)
                    this.signal.throwIfAborted()
                    const uniqueLicenses = new Map<string, License>()
                    for (const license of licenses) {
                        if (!uniqueLicenses.has(license.name)) uniqueLicenses.set(license.name, license)
                    }
                    resolve(
                        [
                            ...uniqueLicenses.values(),
                        ].sort((a, b) => a.name.localeCompare(b.name)),
                    )
                } catch (error) {
                    this.cache.delete(key)
                    reject(error)
                } finally {
                    this.signal.removeEventListener('abort', abort)
                }
            })
        })
        this.cache.set(key, promise)
        this.run()
        return promise
    }

    dispose(): void {
        this.controller.abort()
        this.queue.length = 0
        this.cache.clear()
    }

    private run(): void {
        while (!this.signal.aborted && this.active < this.concurrency && this.queue.length > 0) {
            const task = this.queue.shift()
            if (!task) break
            this.active++
            void (async () => {
                try {
                    await task()
                } finally {
                    this.active--
                    this.run()
                }
            })()
        }
    }
}
