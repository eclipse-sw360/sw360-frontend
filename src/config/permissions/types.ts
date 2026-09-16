// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { UserGroupType } from '@/object-types'

/** Route permission rule with blockedRoles (blacklist approach) */
export interface RoutePermission {
    /** Roles blocked from accessing this route */
    blockedRoles?: UserGroupType[]
    /** Roles explicitly allowed (whitelist - optional) */
    allowedRoles?: UserGroupType[]
}

/** Props for RoleGate component */
export interface RoleGateProps {
    allowedRoles?: UserGroupType[]
    blockedRoles?: UserGroupType[]
    fallback?: React.ReactNode
    children: React.ReactNode
}

/**
 * Capability flags per role.
 * Based on: https://eclipse.dev/sw360/docs/administrationguide/user-management-roles/
 */
export interface RoleCapabilities {
    /** Can create new records (components, releases, projects) */
    canCreateRecords: boolean
    /** Can edit own records */
    canEditOwnRecords: boolean
    /** Can edit others' records directly (without moderation) */
    canEditOthersRecords: boolean
    /** Can approve moderation requests */
    canApproveModerationRequests: boolean
    /** Can edit license details */
    canEditLicenses: boolean
    /** Can import/delete licenses (OSADL, SPDX) */
    canImportDeleteLicenses: boolean
    /** Can edit obligations */
    canEditObligations: boolean
    /** Can handle clearing requests */
    canHandleClearingRequests: boolean
    /** Can delete clearing requests */
    canDeleteClearingRequests: boolean
    /** Can edit clearing request details (requesting user, clearing type) */
    canEditClearingRequestDetails: boolean
    /** Can edit ECC classifications */
    canEditECCClassifications: boolean
    /** Can view vulnerability data */
    canViewVulnerabilities: boolean
    /** Can suppress vulnerabilities */
    canSuppressVulnerabilities: boolean
    /** Can create/add new vulnerabilities */
    canCreateVulnerabilities: boolean
    /** Can manage users and promote roles */
    canManageUsers: boolean
    /** Can access admin configurations */
    canAccessAdminConfig: boolean
}
