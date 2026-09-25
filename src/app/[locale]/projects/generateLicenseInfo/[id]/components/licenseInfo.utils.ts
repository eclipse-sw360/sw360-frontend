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

export interface SelectionStore {
    selected: Set<string>
    deselected: Set<string>
    selectedConcludedUsages: Set<string>
    deselectedConcludedUsages: Set<string>
    ignoredLicenses: Map<string, Set<string>>
}

export const createEmptyStore = (): SelectionStore => ({
    selected: new Set(),
    deselected: new Set(),
    selectedConcludedUsages: new Set(),
    deselectedConcludedUsages: new Set(),
    ignoredLicenses: new Map(),
})

export const storeFromPayload = (payload: SaveUsagesPayload): SelectionStore => ({
    selected: new Set(payload.selected),
    deselected: new Set(payload.deselected),
    selectedConcludedUsages: new Set(payload.selectedConcludedUsages),
    deselectedConcludedUsages: new Set(payload.deselectedConcludedUsages),
    ignoredLicenses: new Map(
        Object.entries(payload.ignoredLicenses).map(([k, v]) => [
            k,
            new Set(v),
        ]),
    ),
})

export const payloadFromStore = (store: SelectionStore): SaveUsagesPayload => {
    const ignoredLicenses: SaveUsagesPayload['ignoredLicenses'] = {}
    for (const [k, v] of store.ignoredLicenses) {
        ignoredLicenses[k] = Array.from(v)
    }
    return {
        selected: Array.from(store.selected),
        deselected: Array.from(store.deselected),
        selectedConcludedUsages: Array.from(store.selectedConcludedUsages),
        deselectedConcludedUsages: Array.from(store.deselectedConcludedUsages),
        ignoredLicenses,
    }
}

// Mutates the store in place and returns whether the attachment ended up selected.
export const applyAttachmentToggle = (store: SelectionStore, key: string): boolean => {
    const wasSelected = store.selected.has(key)
    if (wasSelected) {
        store.ignoredLicenses.delete(key.replace('_licenseInfo_', '_'))
        store.selected.delete(key)
        store.deselected.add(key)
        store.selectedConcludedUsages.delete(key)
        store.deselectedConcludedUsages.delete(key)
    } else {
        store.selected.add(key)
        store.deselected.delete(key)
    }
    return !wasSelected
}

// Mutates the store in place and returns whether the attachment ended up selected.
export const toggleLicenseInStore = (
    store: SelectionStore,
    attKey: string,
    ignoredKey: string,
    licenseName: string,
    siblingLicenses: License[],
): boolean => {
    const attachmentSelectedBefore = store.selected.has(attKey)
    const ignored = new Set(store.ignoredLicenses.get(ignoredKey) ?? [])
    if (!attachmentSelectedBefore) {
        ignored.clear()
        for (const lic of siblingLicenses) {
            if (lic.name !== licenseName) {
                ignored.add(lic.name)
            }
        }
    } else if (ignored.has(licenseName)) {
        ignored.delete(licenseName)
    } else {
        ignored.add(licenseName)
    }
    const allIgnored = siblingLicenses.length > 0 && siblingLicenses.every((lic) => ignored.has(lic.name))
    let attachmentSelectedAfter = attachmentSelectedBefore
    if (attachmentSelectedBefore !== !allIgnored) {
        attachmentSelectedAfter = applyAttachmentToggle(store, attKey)
    }
    if (!allIgnored) {
        store.ignoredLicenses.set(ignoredKey, ignored)
    }
    return attachmentSelectedAfter
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
