// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

export type ArchivalEntityType = 'PROJECT' | 'COMPONENT' | 'RELEASE' | 'PACKAGE'

export interface ArchiveRequest {
    entityType: ArchivalEntityType
    entityIds: string[]
    comment: string
    includeAttachments: boolean
}

export type ArchivePreviewAction = 'ARCHIVE' | 'KEEP_ALIVE' | 'BLOCKED'

export interface ArchivePreviewEntry {
    entityId: string
    entityName: string
    entityType: ArchivalEntityType
    action: ArchivePreviewAction
    reason?: string
}

export interface ArchivePreview {
    entries: ArchivePreviewEntry[]
    archiveCount: number
    keepAliveCount: number
    blockedCount: number
}

export type ArchivalStatus = 'ARCHIVED' | 'PARTIALLY_ARCHIVED' | 'RESTORED' | 'FAILED'

export interface ArchivalRecord {
    id: string
    bundleId: string
    entityId: string
    entityName?: string
    entityType: ArchivalEntityType
    status: ArchivalStatus
    archivedBy?: string
    archivedAt?: string
    restoredBy?: string
    restoredAt?: string
    attachmentCount?: number
    comment?: string
}

export interface RestorePreviewEntry {
    entityId: string
    entityName?: string
    entityType: ArchivalEntityType
    attachmentCount?: number
    // true when the entity is already present in the live database and would be skipped
    conflict: boolean
}

export interface RestorePreview {
    bundleId: string
    entries: RestorePreviewEntry[]
}

export type RestoreOutcome = 'RESTORED' | 'SKIPPED' | 'FAILED'

export interface RestoreResultEntry {
    entityId: string
    entityType: ArchivalEntityType
    outcome: RestoreOutcome
    reason?: string
}

export interface RestoreResult {
    bundleId: string
    entries: RestoreResultEntry[]
    restoredCount: number
    skippedCount: number
    failedCount: number
}
