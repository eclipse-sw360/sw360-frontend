// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { AttachmentUsage, AttachmentUsages } from '@/object-types'

export interface License {
    name: string
    text: string
}

type AttachmentId = string
type ReleaseId = string
type ProjectPath = string
export type UsageType = 'sourcePackage' | 'licenseInfo' | 'manuallySet'
export type AttachmentKey = [
    AttachmentId,
    ReleaseId,
    ProjectPath,
    UsageType,
]

export const isLicenseExcluded = (
    store: {
        [key: string]: AttachmentUsage
    },
    key: string,
    license: string,
): boolean => store[key]?.usageData?.licenseInfo?.excludedLicenseIds.includes(license) ?? false

export const clearExcludedLicenses = (store: Record<string, AttachmentUsage>, key: string): void => {
    const licenseInfo = store[key]?.usageData?.licenseInfo
    if (licenseInfo) licenseInfo.excludedLicenseIds = []
}

export const createStoreFromAttachmentUsages = (
    attachmentUsages: AttachmentUsages,
): Record<string, AttachmentUsage> => {
    const store: Record<string, AttachmentUsage> = {}

    for (const usage of attachmentUsages._embedded['sw360:attachmentUsages']) {
        const releaseId = usage.owner?.releaseId
        const usageType = (Object.keys(usage.usageData ?? {}) as UsageType[]).find(
            (type) => usage.usageData?.[type] !== undefined,
        )
        if (!releaseId || !usageType) continue

        const projectPath =
            usageType === 'licenseInfo' ? usage.usageData?.licenseInfo?.projectPath : usage.usedBy?.projectId
        if (projectPath === undefined) continue

        const key = JSON.stringify([
            usage.attachmentContentId,
            releaseId,
            projectPath,
            usageType,
        ])
        store[key] = usage
    }

    return store
}

export const payloadFromStore = (store: Record<string, AttachmentUsage>): AttachmentUsage[] => Object.values(store)

export const applyAttachmentToggle = (
    store: {
        [key: string]: AttachmentUsage
    },
    key: string,
) => {
    const [attachmentId, releaseId, projectPath, _] = JSON.parse(key) as AttachmentKey
    if (store[key]) {
        delete store[key]
        return false
    }
    store[key] = {
        attachmentContentId: attachmentId,
        owner: {
            releaseId: releaseId,
        },
        usedBy: {
            projectId: projectPath.split(':')[0],
        },
        usageData: {
            licenseInfo: {
                excludedLicenseIds: [],
                projectPath: projectPath,
                includeConcludedLicense: false,
            },
        },
    }
    return true
}

// Toggle a specific license in the store, adding it to or removing it from the excludedLicenseIds array.
// Returns whether the attachment should be selected or not
export const toggleLicenseInStore = (
    store: {
        [key: string]: AttachmentUsage
    },
    key: string,
    license: string,
    allLicenses: License[],
) => {
    const [attachmentId, releaseId, projectPath, _] = JSON.parse(key) as AttachmentKey
    const usage = store[key]
    if (usage) {
        if (!usage.usageData?.licenseInfo) return false
        const ind = usage.usageData.licenseInfo.excludedLicenseIds.indexOf(license)
        if (ind >= 0) {
            usage.usageData.licenseInfo.excludedLicenseIds.splice(ind, 1)
            return true
        } else {
            usage.usageData.licenseInfo.excludedLicenseIds.push(license)
            if (usage.usageData.licenseInfo.excludedLicenseIds.length === allLicenses.length) {
                applyAttachmentToggle(store, key)
                return false
            }
            return true
        }
    }
    store[key] = {
        attachmentContentId: attachmentId,
        owner: {
            releaseId: releaseId,
        },
        usedBy: {
            projectId: projectPath.split(':')[0],
        },
        usageData: {
            licenseInfo: {
                excludedLicenseIds: allLicenses.filter((l) => l.name !== license).map((l) => l.name),
                projectPath: projectPath,
                includeConcludedLicense: false,
            },
        },
    }
    return true
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
