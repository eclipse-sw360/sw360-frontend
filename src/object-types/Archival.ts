// Copyright Taanvi Khevaria, 2026. Part of the SW360 Frontend Project.
//
// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/
//
// SPDX-License-Identifier: EPL-2.0

export type ArchivalEntityType = 'PROJECT' | 'COMPONENT' | 'RELEASE' | 'PACKAGE'

export interface ArchiveRequest {
    entityType: ArchivalEntityType
    entityIds: string[]
    comment: string
    includeAttachments: boolean
    includeChangelogs: boolean
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
