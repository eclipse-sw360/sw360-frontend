// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import {
    type License,
    LicenseDetailLoader,
    restoreLicenseUsages,
    toggleAttachmentUsage,
    toggleLicenseUsage,
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

test('restores all path-specific choices and concluded settings without loading any license details', () => {
    const usages = attachmentUsages([
        savedUsage('root:left', true),
        savedUsage('root:right', false, [
            'Apache-2.0',
        ]),
        savedUsage('root:left', true),
    ])
    const payload = restoreLicenseUsages(usages)
    expect(payload.selected).toEqual([
        'root:left-release_licenseInfo_attachment',
        'root:right-release_licenseInfo_attachment',
    ])
    expect(payload.ignoredLicenses).toEqual({
        'root:left-release_attachment': [
            'MIT',
        ],
        'root:right-release_attachment': [
            'Apache-2.0',
        ],
    })
    expect(payload.selectedConcludedUsages).toEqual([
        'root:left-release_licenseInfo_attachment',
    ])
    expect(payload.deselectedConcludedUsages).toEqual([
        'root:right-release_licenseInfo_attachment',
    ])
})

test('restores large saved usage sets in one pass without collapsing project paths', () => {
    const payload = restoreLicenseUsages(
        attachmentUsages(
            Array.from(
                {
                    length: 15170,
                },
                (_, index) => savedUsage(`root:path${index}`, true),
            ),
        ),
    )
    expect(payload.selected).toHaveLength(15170)
    expect(Object.keys(payload.ignoredLicenses)).toHaveLength(15170)
})

test('uses the usage owner when multiple releases share attachment content, with a legacy fallback', () => {
    const usage = savedUsage('root', true)
    const usages = attachmentUsages([
        usage,
    ])
    usages._embedded['sw360:release'].push({
        _links: {
            self: {
                href: '/releases/other',
            },
        },
        attachments: [
            {
                attachmentContentId: 'attachment',
                filename: 'licenses.xml',
            },
        ],
    })
    expect(restoreLicenseUsages(usages).selected).toEqual([
        'root-release_licenseInfo_attachment',
    ])
    delete usage.owner
    expect(restoreLicenseUsages(usages).selected).toEqual([
        'root-release_licenseInfo_attachment',
        'root-other_licenseInfo_attachment',
    ])
})

test('attachment selection does not erase exclusions or concluded settings in unloaded paths', () => {
    const payload = restoreLicenseUsages(
        attachmentUsages([
            savedUsage('root:left', true),
            savedUsage('root:right', false),
            savedUsage('root:unopened', true),
        ]),
    )
    const key = 'root:left-release_licenseInfo_attachment'
    const deselected = toggleAttachmentUsage(payload, key)
    expect(deselected.selected).toEqual([
        'root:right-release_licenseInfo_attachment',
        'root:unopened-release_licenseInfo_attachment',
    ])
    expect(deselected.deselected).toEqual([
        key,
    ])
    const reselected = toggleAttachmentUsage(deselected, key)
    expect(deselected.ignoredLicenses).not.toHaveProperty('root:left-release_attachment')
    expect(deselected.selectedConcludedUsages).not.toContain(key)
    expect(deselected.deselectedConcludedUsages).not.toContain(key)
    expect(reselected.ignoredLicenses).toEqual({
        'root:right-release_attachment': [
            'MIT',
        ],
        'root:unopened-release_attachment': [
            'MIT',
        ],
    })
    expect(reselected.selectedConcludedUsages).toEqual([
        'root:unopened-release_licenseInfo_attachment',
    ])
    expect(reselected.deselectedConcludedUsages).toEqual(payload.deselectedConcludedUsages)
    expect(payload.selected).toHaveLength(3)
    expect(payload.ignoredLicenses['root:left-release_attachment']).toEqual([
        'MIT',
    ])
    const deselectedFalseUsage = toggleAttachmentUsage(payload, 'root:right-release_licenseInfo_attachment')
    expect(deselectedFalseUsage.deselectedConcludedUsages).toEqual([])
    expect(deselectedFalseUsage.selectedConcludedUsages).toEqual(payload.selectedConcludedUsages)
})

test('license selection is immutable, path-specific, and handles all licenses deselected', () => {
    const payload = restoreLicenseUsages(
        attachmentUsages([
            savedUsage('root:left', true, [
                'MIT',
                'old-license',
            ]),
            savedUsage('root:right', false),
        ]),
    )
    const attachmentKey = 'root:left-release_licenseInfo_attachment'
    const ignoredKey = 'root:left-release_attachment'
    const deselected = toggleLicenseUsage(payload, attachmentKey, ignoredKey, 'Apache-2.0', licenses)
    expect(deselected.selected).not.toContain(attachmentKey)
    expect(deselected.deselected).toContain(attachmentKey)
    expect(deselected.selectedConcludedUsages).not.toContain(attachmentKey)
    expect(deselected.ignoredLicenses).not.toHaveProperty(ignoredKey)
    const selected = toggleLicenseUsage(deselected, attachmentKey, ignoredKey, 'MIT', licenses)
    expect(selected.selected).toContain(attachmentKey)
    expect(selected.deselected).not.toContain(attachmentKey)
    expect(selected.ignoredLicenses[ignoredKey]).toEqual([
        'Apache-2.0',
    ])
    expect(selected.ignoredLicenses['root:right-release_attachment']).toEqual([
        'MIT',
    ])
    expect(payload.ignoredLicenses[ignoredKey]).toEqual([
        'MIT',
        'old-license',
    ])
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
