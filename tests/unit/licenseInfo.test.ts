// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import {
    applyAttachmentToggle,
    clearExcludedLicenses,
    createStoreFromAttachmentUsages,
    type License,
    LicenseDetailLoader,
    isLicenseExcluded,
    payloadFromStore,
    toggleLicenseInStore,
} from '../../src/app/[locale]/projects/generateLicenseInfo/[id]/components/licenseInfo.utils'
import type { AttachmentUsage, AttachmentUsages } from '../../src/object-types/AttachmentUsages'

const licenses: License[] = [
    {
        name: 'Apache-2.0',
        text: 'Apache license',
    },
    {
        name: 'MIT',
        text: 'MIT license',
    },
]

function savedUsage(
    projectPath: string,
    concluded: boolean,
    excludedLicenseIds = [
        'MIT',
    ],
): AttachmentUsage {
    return {
        attachmentContentId: 'attachment',
        owner: {
            releaseId: 'release',
        },
        usageData: {
            licenseInfo: {
                projectPath,
                includeConcludedLicense: concluded,
                excludedLicenseIds,
            },
        },
    }
}

function attachmentUsages(usages: AttachmentUsage[]): AttachmentUsages {
    return {
        _embedded: {
            'sw360:release': [
                {
                    _links: {
                        self: {
                            href: '/releases/release',
                        },
                    },
                    attachments: [
                        {
                            attachmentContentId: 'attachment',
                            filename: 'licenses.xml',
                        },
                    ],
                },
            ],
            'sw360:attachmentUsages': usages,
        },
    }
}

const storeKey = (projectPath: string, usageType: string = 'licenseInfo', attachmentId = 'attachment'): string => JSON.stringify([
    attachmentId,
    'release',
    projectPath,
    usageType,
])

test('creates a path-specific store from attachment usages', () => {
    const usages = attachmentUsages([
        savedUsage('root:left', true),
        savedUsage('root:right', false, [
            'Apache-2.0',
        ]),
        {
            attachmentContentId: 'source-only',
            owner: {
                releaseId: 'release',
            },
            usedBy: {
                projectId: 'source-project',
            },
            usageData: {
                sourcePackage: {},
            },
        },
        {
            attachmentContentId: 'manual-only',
            owner: {
                releaseId: 'release',
            },
            usedBy: {
                projectId: 'manual-project',
            },
            usageData: {
                manuallySet: {},
            },
        },
    ])
    const store = createStoreFromAttachmentUsages(usages)

    expect(Object.keys(store)).toEqual([
        storeKey('root:left'),
        storeKey('root:right'),
        storeKey('source-project', 'sourcePackage', 'source-only'),
        storeKey('manual-project', 'manuallySet', 'manual-only'),
    ])
    expect(store[storeKey('root:left')]).toEqual(savedUsage('root:left', true))
    expect(store[storeKey('root:right')]).toEqual(savedUsage('root:right', false, [
        'Apache-2.0',
    ]))
    expect(store[storeKey('source-project', 'sourcePackage', 'source-only')]).toEqual(usages._embedded[
        'sw360:attachmentUsages'
    ][2])
    expect(store[storeKey('manual-project', 'manuallySet', 'manual-only')]).toEqual(usages._embedded[
        'sw360:attachmentUsages'
    ][3])
})

test('payloadFromStore returns selected attachment usage records', () => {
    const left = savedUsage('root:left', true)
    const right = savedUsage('root:right', false)
    const store = createStoreFromAttachmentUsages(attachmentUsages([
        left,
        right,
    ]))

    expect(payloadFromStore(store)).toEqual([
        left,
        right,
    ])
})

test('attachment toggle removes an existing usage and creates a fresh usage when reselected', () => {
    const key = storeKey('root:left')
    const store = createStoreFromAttachmentUsages(attachmentUsages([
        savedUsage('root:left', true),
    ]))

    expect(applyAttachmentToggle(store, key)).toBe(false)
    expect(store[key]).toBeUndefined()
    expect(payloadFromStore(store)).toEqual([])

    expect(applyAttachmentToggle(store, key)).toBe(true)
    expect(store[key]).toEqual({
        attachmentContentId: 'attachment',
        owner: {
            releaseId: 'release',
        },
        usedBy: {
            projectId: 'root',
        },
        usageData: {
            licenseInfo: {
                excludedLicenseIds: [],
                projectPath: 'root:left',
                includeConcludedLicense: false,
            },
        },
    })
})

test('license toggles add and remove exclusions and deselect when every license is excluded', () => {
    const key = storeKey('root:left')
    const store = createStoreFromAttachmentUsages(attachmentUsages([
        savedUsage('root:left', true, [
            'MIT',
        ]),
    ]))

    expect(toggleLicenseInStore(store, key, 'MIT', licenses)).toBe(true)
    expect(store[key].usageData?.licenseInfo?.excludedLicenseIds).toEqual([])
    expect(toggleLicenseInStore(store, key, 'Apache-2.0', licenses)).toBe(true)
    expect(store[key].usageData?.licenseInfo?.excludedLicenseIds).toEqual([
        'Apache-2.0',
    ])
    expect(toggleLicenseInStore(store, key, 'MIT', licenses)).toBe(false)
    expect(store[key].usageData?.licenseInfo?.excludedLicenseIds).toEqual([
        'Apache-2.0',
        'MIT',
    ])
})

test('toggling a license creates a usage with all sibling licenses except the selected one excluded', () => {
    const key = storeKey('root:left')
    const store: Record<string, AttachmentUsage> = {}

    expect(toggleLicenseInStore(store, key, 'MIT', licenses)).toBe(true)
    expect(store[key].usageData?.licenseInfo?.excludedLicenseIds).toEqual([
        'Apache-2.0',
    ])
})

test('excluded-license helpers report and clear exclusions without disturbing other usage fields', () => {
    const key = storeKey('root:left')
    const store = createStoreFromAttachmentUsages(attachmentUsages([
        savedUsage('root:left', true),
    ]))

    expect(isLicenseExcluded(store, key, 'MIT')).toBe(true)
    expect(isLicenseExcluded(store, key, 'Apache-2.0')).toBe(false)
    clearExcludedLicenses(store, key)
    expect(isLicenseExcluded(store, key, 'MIT')).toBe(false)
    expect(store[key].usageData?.licenseInfo).toEqual({
        excludedLicenseIds: [],
        projectPath: 'root:left',
        includeConcludedLicense: true,
    })
})

test('does no eager work, deduplicates requests across paths and retains normalized results', async () => {
    let requests = 0
    const loader = new LicenseDetailLoader(() => {
        requests++
        return Promise.resolve([
            ...licenses,
            licenses[0],
        ])
    })
    expect(requests).toBe(0)
    const first = loader.load('release', 'attachment')
    expect(loader.load('release', 'attachment')).toBe(first)
    expect(await first).toEqual(licenses)
    expect(await loader.load('release', 'attachment')).toEqual(licenses)
    expect(requests).toBe(1)
    loader.dispose()
})

test('bounds concurrent detail requests even when many attachments are expanded', async () => {
    const complete: Array<(value: License[]) => void> = []
    let requests = 0
    const loader = new LicenseDetailLoader(
        () =>
            new Promise((resolve) => {
                requests++
                complete.push(resolve)
            }),
    )
    const pending = Array.from(
        {
            length: 8,
        },
        (_, index) => loader.load('release', `attachment${index}`),
    )
    expect(requests).toBe(4)
    for (let index = 0; index < pending.length; index++) {
        complete[index](licenses)
        await pending[index]
    }
    expect(requests).toBe(8)
    loader.dispose()
})

test('failed requests can be retried and empty successful results are cached', async () => {
    let requests = 0
    const loader = new LicenseDetailLoader(() => {
        requests++
        if (requests === 1) return Promise.reject(new Error('Parsing failed'))
        return Promise.resolve([])
    })
    await expect(loader.load('release', 'attachment')).rejects.toThrow('Parsing failed')
    expect(await loader.load('release', 'attachment')).toEqual([])
    expect(await loader.load('release', 'attachment')).toEqual([])
    expect(requests).toBe(2)
    loader.dispose()
})

test('navigation cancels active and queued work without starting queued requests', async () => {
    const signals: AbortSignal[] = []
    const loader = new LicenseDetailLoader((_release, _attachment, signal) => {
        signals.push(signal)
        return new Promise(() => {
            // Simulate a request that never completes, even after its signal is aborted.
        })
    }, 1)
    const active = loader.load('release', 'active')
    const queued = loader.load('release', 'queued')
    loader.dispose()
    await expect(active).rejects.toMatchObject({
        name: 'AbortError',
    })
    await expect(queued).rejects.toMatchObject({
        name: 'AbortError',
    })
    await expect(loader.load('release', 'after-unmount')).rejects.toMatchObject({
        name: 'AbortError',
    })
    expect(signals).toHaveLength(1)
    expect(signals[0].aborted).toBe(true)
})
