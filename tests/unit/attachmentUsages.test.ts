// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { expect, test } from '@playwright/test'
import {
    indexUsages,
    matchesUsage,
    setUsageSelected,
    type UsageSelection,
    usageKey,
} from '../../src/app/[locale]/projects/detail/[id]/components/attachmentUsages.utils'
import type { AttachmentUsage } from '../../src/object-types/AttachmentUsages'

const licenseSelection: UsageSelection = {
    attachmentContentId: 'attachment',
    releaseId: 'release',
    projectId: 'root',
    projectPath: 'root:left',
    type: 'licenseInfo',
}

const savedLicense: AttachmentUsage = {
    id: 'existing',
    attachmentContentId: 'attachment',
    owner: { releaseId: 'release' },
    usedBy: { projectId: 'root' },
    usageData: {
        licenseInfo: {
            projectPath: 'root:left',
            excludedLicenseIds: ['MIT'],
            includeConcludedLicense: true,
        },
    },
}

test('license selection matches its exact project path and restores existing metadata', () => {
    const otherPath: AttachmentUsage = {
        ...savedLicense,
        id: 'other',
        usageData: { licenseInfo: { ...savedLicense.usageData!.licenseInfo!, projectPath: 'root:right' } },
    }
    const unrelated: AttachmentUsage = { attachmentContentId: 'unrelated' }
    const initial = [savedLicense, otherPath, unrelated]

    expect(matchesUsage(savedLicense, licenseSelection)).toBe(true)
    expect(matchesUsage(otherPath, licenseSelection)).toBe(false)
    const deselected = setUsageSelected(initial, initial, licenseSelection, false)
    expect(deselected).toEqual([otherPath, unrelated])
    expect(setUsageSelected(deselected, initial, licenseSelection, true)).toEqual([otherPath, unrelated, savedLicense])
})

test('new license selections contain the backend defaults', () => {
    expect(setUsageSelected([], [], licenseSelection, true)).toEqual([
        {
            attachmentContentId: 'attachment',
            owner: { releaseId: 'release' },
            usedBy: { projectId: 'root' },
            usageData: {
                licenseInfo: { excludedLicenseIds: [], projectPath: 'root:left', includeConcludedLicense: false },
            },
        },
    ])
})

test('source and manual usage identities are shared across project paths but remain distinct', () => {
    for (const type of ['sourcePackage', 'manuallySet'] as const) {
        const selection: UsageSelection = { ...licenseSelection, type }
        const otherPath = { ...selection, projectPath: 'root:right' }
        expect(usageKey(selection)).toBe(usageKey(otherPath))
        const usages = setUsageSelected([], [], selection, true)
        expect(usages[0].usageData).toEqual({ [type]: {} })
        expect(matchesUsage(usages[0], otherPath)).toBe(true)
        expect(matchesUsage(usages[0], { ...selection, projectId: 'another-project' })).toBe(false)
        expect(setUsageSelected(usages, [], otherPath, true)).toEqual(usages)
        expect(setUsageSelected(usages, [], otherPath, false)).toEqual([])
    }
    expect(usageKey(licenseSelection)).not.toBe(usageKey({ ...licenseSelection, projectPath: 'root:right' }))
})

test('indexes valid usages without discarding incomplete payload records', () => {
    const sourceSelection: UsageSelection = { ...licenseSelection, type: 'sourcePackage' }
    const source = setUsageSelected([], [], sourceSelection, true)[0]
    const incomplete: AttachmentUsage = { attachmentContentId: 'unrelated' }
    const usages = [savedLicense, source, incomplete]
    const index = indexUsages(usages)

    expect(index.has(usageKey(licenseSelection))).toBe(true)
    expect(index.has(usageKey(sourceSelection))).toBe(true)
    expect(index.has(usageKey({ ...licenseSelection, projectPath: 'root:right' }))).toBe(false)
    expect(usages).toHaveLength(3)
})