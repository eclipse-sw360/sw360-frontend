// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import type { AttachmentUsage } from '@/object-types'

export type UsageType = 'licenseInfo' | 'sourcePackage' | 'manuallySet'

export interface UsageSelection {
    attachmentContentId: string
    releaseId: string
    projectId: string
    projectPath: string
    type: UsageType
}

export const usageKey = (selection: UsageSelection): string =>
    JSON.stringify([
        selection.attachmentContentId,
        selection.releaseId,
        selection.projectId,
        selection.type === 'licenseInfo' ? selection.projectPath : '',
        selection.type,
    ])

export const matchesUsage = (usage: AttachmentUsage, selection: UsageSelection): boolean =>
    usage.attachmentContentId === selection.attachmentContentId &&
    usage.owner?.releaseId === selection.releaseId &&
    usage.usedBy?.projectId === selection.projectId &&
    usage.usageData?.[selection.type] !== undefined &&
    (selection.type !== 'licenseInfo' || usage.usageData.licenseInfo?.projectPath === selection.projectPath)

export const indexUsages = (usages: AttachmentUsage[]): Set<string> => {
    const keys = new Set<string>()
    for (const usage of usages) {
        const releaseId = usage.owner?.releaseId
        const projectId = usage.usedBy?.projectId
        if (!releaseId || !projectId) continue
        const usageData = usage.usageData
        if (!usageData) continue
        for (const type of Object.keys(usageData) as UsageType[]) {
            const projectPath = type === 'licenseInfo' ? usageData.licenseInfo?.projectPath : ''
            if (projectPath === undefined) continue
            keys.add(
                usageKey({
                    attachmentContentId: usage.attachmentContentId,
                    releaseId,
                    projectId,
                    projectPath,
                    type,
                }),
            )
        }
    }
    return keys
}

export const setUsageSelected = (
    usages: AttachmentUsage[],
    initialUsages: AttachmentUsage[],
    selection: UsageSelection,
    selected: boolean,
): AttachmentUsage[] => {
    if (!selected) return usages.filter((usage) => !matchesUsage(usage, selection))
    if (usages.some((usage) => matchesUsage(usage, selection))) return usages

    const original = initialUsages.filter((usage) => matchesUsage(usage, selection))
    if (original.length > 0)
        return [
            ...usages,
            ...original,
        ]

    const usageData: NonNullable<AttachmentUsage['usageData']> =
        selection.type === 'licenseInfo'
            ? {
                  licenseInfo: {
                      excludedLicenseIds: [],
                      projectPath: selection.projectPath,
                      includeConcludedLicense: false,
                  },
              }
            : {
                  [selection.type]: {},
              }
    return [
        ...usages,
        {
            attachmentContentId: selection.attachmentContentId,
            owner: {
                releaseId: selection.releaseId,
            },
            usedBy: {
                projectId: selection.projectId,
            },
            usageData,
        },
    ]
}
