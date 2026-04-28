// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Role Capabilities Matrix
 *
 * Defines what each role can do in SW360. Based on:
 * https://eclipse.dev/sw360/docs/administrationguide/user-management-roles/
 *
 * Note: This is a frontend-only configuration for UI display purposes.
 * The backend enforces actual permissions via its own PermissionUtils.java.
 */

import { UserGroupType } from '@/object-types'
import type { RoleCapabilities } from './types'

/**
 * Default capabilities for all roles (base permissions)
 */
const DEFAULT_CAPABILITIES: RoleCapabilities = {
    canCreateRecords: false,
    canEditOwnRecords: false,
    canEditOthersRecords: false,
    canApproveModerationRequests: false,
    canEditLicenses: false,
    canImportDeleteLicenses: false,
    canEditObligations: false,
    canHandleClearingRequests: false,
    canDeleteClearingRequests: false,
    canEditClearingRequestDetails: false,
    canEditECCClassifications: false,
    canViewVulnerabilities: false,
    canSuppressVulnerabilities: false,
    canCreateVulnerabilities: false,
    canManageUsers: false,
    canAccessAdminConfig: false,
}

/**
 * Role Capabilities Matrix
 *
 * Maps each UserGroupType to its specific capabilities.
 * Uses spread operator to inherit from DEFAULT_CAPABILITIES.
 */
export const roleCapabilities: Record<UserGroupType, RoleCapabilities> = {
    /**
     * USER - Default role
     * Can create and edit own records. To modify others' records, must submit moderation request.
     */
    [UserGroupType.USER]: {
        ...DEFAULT_CAPABILITIES,
        canCreateRecords: true,
        canEditOwnRecords: true,
        canCreateVulnerabilities: true,
        // Note: canEditClearingRequestDetails remains false - USER role cannot edit clearing request details
    },

    /**
     * VIEWER - Read-only role (new from backend PR #3242)
     * Cannot create, edit, or delete any records. View-only access.
     */
    [UserGroupType.VIEWER]: {
        ...DEFAULT_CAPABILITIES,
        // All capabilities remain false - read-only
    },

    /**
     * CLEARING_EXPERT - Member of clearing team
     * Can work on projects within own group, edit licenses, handle clearing requests.
     */
    [UserGroupType.CLEARING_EXPERT]: {
        ...DEFAULT_CAPABILITIES,
        canCreateRecords: true,
        canEditOwnRecords: true,
        canEditLicenses: true,
        canHandleClearingRequests: true,
        canEditClearingRequestDetails: true,
        canCreateVulnerabilities: true,
    },

    /**
     * CLEARING_ADMIN - Higher-level clearing role
     * Same as Clearing Expert but actions don't generate moderation requests.
     * Can approve moderation requests for own department.
     */
    [UserGroupType.CLEARING_ADMIN]: {
        ...DEFAULT_CAPABILITIES,
        canCreateRecords: true,
        canEditOwnRecords: true,
        canEditOthersRecords: true, // Same dept
        canApproveModerationRequests: true, // Same dept
        canEditLicenses: true,
        canImportDeleteLicenses: true,
        canEditObligations: true,
        canHandleClearingRequests: true,
        canDeleteClearingRequests: true,
        canEditClearingRequestDetails: true,
        canCreateVulnerabilities: true,
    },

    /**
     * ECC_ADMIN - Export Control and Customs administrator
     * Can edit and approve ECC classifications on components and releases.
     */
    [UserGroupType.ECC_ADMIN]: {
        ...DEFAULT_CAPABILITIES,
        canCreateRecords: true,
        canEditOwnRecords: true,
        canEditECCClassifications: true,
        canEditClearingRequestDetails: true,
        canCreateVulnerabilities: true,
    },

    /**
     * SECURITY_ADMIN - Security administrator
     * Can view and suppress security vulnerabilities across the instance.
     */
    [UserGroupType.SECURITY_ADMIN]: {
        ...DEFAULT_CAPABILITIES,
        canCreateRecords: true,
        canEditOwnRecords: true,
        canViewVulnerabilities: true,
        canSuppressVulnerabilities: true,
        canCreateVulnerabilities: true,
        canEditClearingRequestDetails: true,
    },

    /**
     * SECURITY_USER - Read-only security role
     * Can view vulnerability data but cannot suppress findings.
     */
    [UserGroupType.SECURITY_USER]: {
        ...DEFAULT_CAPABILITIES,
        canCreateRecords: true,
        canEditOwnRecords: true,
        canViewVulnerabilities: true, // Read-only access
        canEditClearingRequestDetails: true,
        // Note: canCreateVulnerabilities remains false - SECURITY_USER cannot add vulnerabilities
    },

    /**
     * SW360_ADMIN - Full administrative rights
     * Can do everything including user management and admin configurations.
     */
    [UserGroupType.SW360_ADMIN]: {
        canCreateRecords: true,
        canEditOwnRecords: true,
        canEditOthersRecords: true,
        canApproveModerationRequests: true,
        canEditLicenses: true,
        canImportDeleteLicenses: true,
        canEditObligations: true,
        canHandleClearingRequests: true,
        canDeleteClearingRequests: true,
        canEditClearingRequestDetails: true,
        canEditECCClassifications: true,
        canViewVulnerabilities: true,
        canSuppressVulnerabilities: true,
        canCreateVulnerabilities: true,
        canManageUsers: true,
        canAccessAdminConfig: true,
    },

    /**
     * ADMIN - Legacy admin role (identical to SW360_ADMIN)
     * Retained for backwards compatibility from Liferay deployment.
     */
    [UserGroupType.ADMIN]: {
        canCreateRecords: true,
        canEditOwnRecords: true,
        canEditOthersRecords: true,
        canApproveModerationRequests: true,
        canEditLicenses: true,
        canImportDeleteLicenses: true,
        canEditObligations: true,
        canHandleClearingRequests: true,
        canDeleteClearingRequests: true,
        canEditClearingRequestDetails: true,
        canEditECCClassifications: true,
        canViewVulnerabilities: true,
        canSuppressVulnerabilities: true,
        canCreateVulnerabilities: true,
        canManageUsers: true,
        canAccessAdminConfig: true,
    },
}

/**
 * Get capabilities for a specific role.
 * Returns DEFAULT_CAPABILITIES if role is not found.
 */
export const getCapabilitiesForRole = (role: UserGroupType | undefined | null): RoleCapabilities => {
    if (!role) return DEFAULT_CAPABILITIES
    return roleCapabilities[role] ?? DEFAULT_CAPABILITIES
}

/**
 * Check if a role has a specific capability.
 */
export const hasCapability = (role: UserGroupType | undefined | null, capability: keyof RoleCapabilities): boolean => {
    return getCapabilitiesForRole(role)[capability]
}
