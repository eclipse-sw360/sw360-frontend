// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Route Permissions Configuration
 *
 * Used by: proxy.ts for route-level access control
 * Pattern: Blacklist approach - specify blockedRoles to restrict access
 *
 * Routes are matched by longest prefix. More specific rules take precedence.
 * Format: { [routePrefix]: { blockedRoles?, allowedRoles? } }
 */

import { UserGroupType } from '@/object-types'
import type { RoutePermission } from './types'

/** Roles blocked from write operations */
const WRITE_BLOCKED: UserGroupType[] = [
    UserGroupType.VIEWER,
]

/** Admin-only roles */
const ADMIN_ONLY: UserGroupType[] = [
    UserGroupType.ADMIN,
    UserGroupType.SW360_ADMIN,
]

export const routePermissions: Record<string, RoutePermission> = {
    // Admin section - restricted to admins
    '/admin': {
        allowedRoles: ADMIN_ONLY,
    },

    // ECC - blocked for VIEWER
    '/ecc': {
        blockedRoles: WRITE_BLOCKED,
    },

    // Vulnerabilities - entire section blocked for VIEWER
    '/vulnerabilities': {
        blockedRoles: WRITE_BLOCKED,
    },

    // Add/Create routes - blocked for VIEWER
    '/components/add': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/projects/add': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/projects/duplicate': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/packages/add': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/licenses/add': {
        blockedRoles: WRITE_BLOCKED,
    },

    // Edit routes - blocked for VIEWER
    '/components/edit': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/components/editRelease': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/projects/edit': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/packages/edit': {
        blockedRoles: WRITE_BLOCKED,
    },
    '/licenses/edit': {
        blockedRoles: WRITE_BLOCKED,
    },

    // Clearing request routes - blocked for VIEWER
    '/requests/clearingRequest/edit': {
        blockedRoles: WRITE_BLOCKED,
    },

    // Moderation request routes - blocked for VIEWER
    '/requests/moderationRequest': {
        blockedRoles: WRITE_BLOCKED,
    },

    // Source code bundle - blocked for VIEWER
    '/projects/generateSourceCodeBundle': {
        blockedRoles: WRITE_BLOCKED,
    },
}
