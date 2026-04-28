// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

import { UserGroupType } from '@/object-types'

/**
 * Mirrors `org.eclipse.sw360.datahandler.thrift.users.RequestedAction`.
 * Only the actions modelled in the frontend-relevant subset of the thrift enum are listed.
 */
export enum RequestedAction {
    READ = 'READ',
    WRITE = 'WRITE',
    WRITE_ECC = 'WRITE_ECC',
    ATTACHMENTS = 'ATTACHMENTS',
    DELETE = 'DELETE',
    USERS = 'USERS',
    CLEARING = 'CLEARING',
}

/**
 * Minimal shape representing a user returned by the SW360 REST API.
 * Includes the fields needed for permission checks.
 */
export interface SessionUser {
    email?: string
    userGroup?: UserGroupType
    /** Primary department / organisation string (user.getDepartment() in Java). */
    department?: string
    /**
     * Secondary departments mapped to their role arrays.
     * Mirrors `User.getSecondaryDepartmentsAndRoles()` in the thrift model.
     * Keys are department strings; values are arrays of UserGroupType strings.
     */
    secondaryDepartmentsAndRoles?: Record<string, string[]>
}

/**
 * Minimal shape representing a user with an email address.
 * Compatible with the embedded User objects returned by the SW360 REST API.
 */
interface UserEmail {
    email?: string
}

/**
 * The subset of a project's `_embedded` response that carries user-role information.
 * Fields mirror the SW360 Project thrift struct and the REST API's SummaryDataType
 * `_embedded` block.
 */
export interface ProjectUserRolesEmbedded {
    createdBy?: UserEmail
    leadArchitect?: UserEmail
    projectResponsible?: UserEmail
    'sw360:moderators'?: UserEmail[]
    'sw360:contributors'?: UserEmail[]
    /** Project business unit — used for BU-based permission checks. */
    businessUnit?: string
}

// ---------------------------------------------------------------------------
// Role-level helpers — mirrors PermissionUtils.java
// ---------------------------------------------------------------------------

/**
 * Mirrors `PermissionUtils.isAdmin(User user)`.
 * Returns `true` for ADMIN or SW360_ADMIN.
 */
const isAdmin = (user: SessionUser | undefined | null): boolean =>
    user?.userGroup === UserGroupType.ADMIN || user?.userGroup === UserGroupType.SW360_ADMIN

/**
 * Mirrors `PermissionUtils.isClearingAdmin(User user)`.
 * Returns `true` for CLEARING_ADMIN **or** CLEARING_EXPERT (matches Java exactly).
 */
const isClearingAdmin = (user: SessionUser | undefined | null): boolean =>
    user?.userGroup === UserGroupType.CLEARING_ADMIN || user?.userGroup === UserGroupType.CLEARING_EXPERT

/**
 * Mirrors `PermissionUtils.isClearingExpert(User user)`.
 */
const isClearingExpert = (user: SessionUser | undefined | null): boolean =>
    user?.userGroup === UserGroupType.CLEARING_EXPERT

/**
 * Mirrors `PermissionUtils.isEccAdmin(User user)`.
 */
const isEccAdmin = (user: SessionUser | undefined | null): boolean => user?.userGroup === UserGroupType.ECC_ADMIN

/**
 * Mirrors `PermissionUtils.isSecurityAdmin(User user)`.
 */
const isSecurityAdmin = (user: SessionUser | undefined | null): boolean =>
    user?.userGroup === UserGroupType.SECURITY_ADMIN

/**
 * Mirrors `PermissionUtils.isSecurityUser(User user)`.
 */
const isSecurityUser = (user: SessionUser | undefined | null): boolean =>
    user?.userGroup === UserGroupType.SECURITY_USER

/**
 * Mirrors `PermissionUtils.isNormalUser(User user)`.
 */
const isNormalUser = (user: SessionUser | undefined | null): boolean => user?.userGroup === UserGroupType.USER

/**
 * Mirrors `PermissionUtils.isUserAtLeast(UserGroup group, User user)`.
 *
 * The Java implementation is a switch-case — NOT ordinal comparison.
 * Each case explicitly defines which user groups satisfy "at least X":
 *
 */
const isUserAtLeast = (group: UserGroupType, user: SessionUser | undefined | null): boolean => {
    switch (group) {
        case UserGroupType.USER:
            return (
                isNormalUser(user) ||
                isAdmin(user) ||
                isClearingAdmin(user) ||
                isEccAdmin(user) ||
                isSecurityAdmin(user) ||
                isSecurityUser(user)
            )
        case UserGroupType.CLEARING_ADMIN:
            return isClearingAdmin(user) || isAdmin(user)
        case UserGroupType.CLEARING_EXPERT:
            return isClearingExpert(user) || isAdmin(user)
        case UserGroupType.ECC_ADMIN:
            return isEccAdmin(user) || isAdmin(user)
        case UserGroupType.SECURITY_ADMIN:
            return isSecurityAdmin(user) || isAdmin(user)
        case UserGroupType.SW360_ADMIN:
            return isAdmin(user)
        case UserGroupType.ADMIN:
            return isAdmin(user)
        case UserGroupType.SECURITY_USER:
            return isSecurityUser(user)
        default:
            throw new Error(`Unknown UserGroupType: ${group}`)
    }
}

// ---------------------------------------------------------------------------
// BU / department helpers — mirrors ProjectPermissions.java
// ---------------------------------------------------------------------------

/**
 * Mirrors `SW360Utils.getBUFromOrganisation(String)`.
 *
 * The backend trims the organisation string to produce a canonical BU identifier.
 * The REST API already stores and returns the normalised `businessUnit` value so a
 * simple trim is sufficient on the frontend.
 */
const getBUFromOrganisation = (department: string | undefined | null): string => (department ?? '').trim()

/**
 * Mirrors `ProjectPermissions.getUserEquivalentOwnerGroup()`.
 *
 * Collects all departments the user belongs to (primary + keys of secondaryDepartmentsAndRoles)
 * and returns the subset that matches the project's `businessUnit`.
 * Returns `null` when no department matches .
 */
const getUserEquivalentOwnerGroupForProject = (
    projectBusinessUnit: string | undefined | null,
    user: SessionUser | undefined | null,
): Set<string> | null => {
    if (!user) return null

    const departments = new Set<string>()
    if (user.department) departments.add(user.department)
    if (user.secondaryDepartmentsAndRoles) {
        for (const dept of Object.keys(user.secondaryDepartmentsAndRoles)) {
            departments.add(dept)
        }
    }

    const projectBU = getBUFromOrganisation(projectBusinessUnit)
    if (!projectBU) return null

    const matched = new Set<string>()
    for (const dept of departments) {
        if (getBUFromOrganisation(dept) === projectBU) {
            matched.add(dept)
        }
    }

    return matched.size > 0 ? matched : null
}

/**
 * Mirrors `DocumentPermissions.isUserOfOwnGroupHasRole(Set<UserGroup>, UserGroup)`.
 *
 * For each entry in `userEquivalentOwnerGroups`:
 * - If entry is empty-string OR equals the user's primary department → the user is
 *   acting in their primary-department context: check the primary role via a switch on
 *   `checkPermissionForGroup` (CLEARING_ADMIN, ADMIN, CLEARING_EXPERT).
 * - Otherwise → the entry is a secondary department: check whether any of the user's
 *   secondary roles for that department are present in `desiredRoles`.
 *
 * @param desiredRoles           Full role set for this action (e.g. `{CLEARING_ADMIN, CLEARING_EXPERT}`).
 * @param checkPermissionForGroup Representative group for the primary-dept switch
 *                               (always CLEARING_ADMIN or ADMIN in `getStandardPermissions`).
 * @param userEquivalentOwnerGroups Output of `getUserEquivalentOwnerGroupForProject()`.
 * @param user                   The session user.
 */
const isUserOfOwnGroupHasRole = (
    desiredRoles: Set<UserGroupType>,
    checkPermissionForGroup: UserGroupType,
    userEquivalentOwnerGroups: Set<string> | null,
    user: SessionUser | undefined | null,
): boolean => {
    if (!userEquivalentOwnerGroups || userEquivalentOwnerGroups.size === 0) return false

    for (const ownerGroup of userEquivalentOwnerGroups) {
        // Primary department context (empty string sentinel OR actual primary dept)
        if (ownerGroup === '' || ownerGroup === user?.department) {
            switch (checkPermissionForGroup) {
                case UserGroupType.CLEARING_ADMIN:
                    if (isClearingAdmin(user)) return true
                    break
                case UserGroupType.ADMIN:
                    if (isAdmin(user)) return true
                    break
                case UserGroupType.CLEARING_EXPERT:
                    if (isClearingExpert(user)) return true
                    break
            }
        } else {
            // Secondary department context — check secondary roles
            const secondaryRoles = user?.secondaryDepartmentsAndRoles?.[ownerGroup] ?? []
            for (const role of secondaryRoles) {
                if (desiredRoles.has(role as UserGroupType)) return true
            }
        }
    }

    return false
}

// ---------------------------------------------------------------------------
// Document-level helpers — mirrors DocumentPermissions.java
// ---------------------------------------------------------------------------

/**
 * Mirrors `DocumentPermissions.isModerator()`.
 *
 * For projects, `moderators` is built in `ProjectPermissions` as:
 *   createdBy + projectResponsible + moderators[]
 */
const isModerator = (
    embedded: ProjectUserRolesEmbedded | undefined | null,
    userEmail: string | undefined | null,
): boolean => {
    if (!userEmail || !embedded) return false
    return (
        embedded.createdBy?.email === userEmail ||
        embedded.projectResponsible?.email === userEmail ||
        (embedded['sw360:moderators'] ?? []).some((u) => u.email === userEmail)
    )
}

/**
 * Mirrors `DocumentPermissions.isContributor()`.
 *
 * For projects, `contributors` is built in `ProjectPermissions` as:
 *   moderators (see above) + contributors[] + leadArchitect
 */
const isContributor = (
    embedded: ProjectUserRolesEmbedded | undefined | null,
    userEmail: string | undefined | null,
): boolean => {
    if (!userEmail || !embedded) return false
    return (
        isModerator(embedded, userEmail) ||
        embedded.leadArchitect?.email === userEmail ||
        (embedded['sw360:contributors'] ?? []).some((u) => u.email === userEmail)
    )
}

// ---------------------------------------------------------------------------
// Standard permissions switch — mirrors DocumentPermissions.getStandardPermissions()
// ---------------------------------------------------------------------------

/**
 * Mirrors `DocumentPermissions.getStandardPermissions(RequestedAction action)` with
 * the role sets constructed exactly as `ProjectPermissions` does.
 *
 * @param action  The action to check (use `RequestedAction` enum values).
 * @param embedded  The `_embedded` block from the project's REST response.
 * @param user  The currently authenticated session user.
 */
const getStandardPermissions = (
    action: RequestedAction,
    embedded: ProjectUserRolesEmbedded | undefined | null,
    user: SessionUser | undefined | null,
): boolean => {
    // clearingAdminRoles = ImmutableSet.of(CLEARING_ADMIN, CLEARING_EXPERT)
    const clearingAdminRoles = new Set<UserGroupType>([
        UserGroupType.CLEARING_ADMIN,
        UserGroupType.CLEARING_EXPERT,
    ])
    // adminRoles = ImmutableSet.of(ADMIN, SW360_ADMIN)
    const adminRoles = new Set<UserGroupType>([
        UserGroupType.ADMIN,
        UserGroupType.SW360_ADMIN,
    ])

    // Compute the user's equivalent owner group for this project (BU-matching departments)
    const userEquivalentOwnerGroups = getUserEquivalentOwnerGroupForProject(embedded?.businessUnit, user)

    switch (action) {
        case RequestedAction.READ:
            return true

        case RequestedAction.WRITE:
        case RequestedAction.ATTACHMENTS:
            return (
                isUserAtLeast(UserGroupType.ADMIN, user) ||
                isContributor(embedded, user?.email) ||
                isUserOfOwnGroupHasRole(
                    clearingAdminRoles,
                    UserGroupType.CLEARING_ADMIN,
                    userEquivalentOwnerGroups,
                    user,
                ) ||
                isUserOfOwnGroupHasRole(adminRoles, UserGroupType.ADMIN, userEquivalentOwnerGroups, user)
            )

        case RequestedAction.DELETE:
        case RequestedAction.USERS:
        case RequestedAction.CLEARING:
            return (
                isAdmin(user) ||
                isModerator(embedded, user?.email) ||
                isUserOfOwnGroupHasRole(adminRoles, UserGroupType.ADMIN, userEquivalentOwnerGroups, user) ||
                isUserOfOwnGroupHasRole(
                    clearingAdminRoles,
                    UserGroupType.CLEARING_ADMIN,
                    userEquivalentOwnerGroups,
                    user,
                )
            )

        case RequestedAction.WRITE_ECC:
            return (
                isAdmin(user) ||
                isUserOfOwnGroupHasRole(adminRoles, UserGroupType.ADMIN, userEquivalentOwnerGroups, user)
            )

        default:
            throw new Error(`Unknown RequestedAction: ${action}`)
    }
}

// ---------------------------------------------------------------------------
// Convenience helper kept for backwards-compatibility
// ---------------------------------------------------------------------------

/**
 * Mirrors the backend method
 * `ProjectPermissions.userIsEquivalentToModeratorInProject(Project, String)`.
 *
 * Convenience wrapper around `getStandardPermissions(RequestedAction.WRITE, ...)`
 * that only requires the user email (no `userGroup` needed, so admin elevation is not
 * applied — purely role-membership based).
 *
 * Returns `true` when `userEmail` is listed under any of:
 *   createdBy, leadArchitect, projectResponsible, moderators[], contributors[]
 */
const userIsEquivalentToProjectModerator = (
    embedded: ProjectUserRolesEmbedded | undefined | null,
    userEmail: string | undefined | null,
): boolean => {
    if (!userEmail || !embedded) return false

    if (embedded.createdBy?.email === userEmail) return true
    if (embedded.leadArchitect?.email === userEmail) return true
    if (embedded.projectResponsible?.email === userEmail) return true
    if ((embedded['sw360:moderators'] ?? []).some((u) => u.email === userEmail)) return true
    if ((embedded['sw360:contributors'] ?? []).some((u) => u.email === userEmail)) return true

    return false
}

const PermissionUtils = {
    // Role-level helpers
    isAdmin,
    isClearingAdmin,
    isClearingExpert,
    isEccAdmin,
    isSecurityAdmin,
    isSecurityUser,
    isNormalUser,
    isUserAtLeast,
    // BU / department helpers
    getBUFromOrganisation,
    getUserEquivalentOwnerGroupForProject,
    isUserOfOwnGroupHasRole,
    // Document-level helpers
    isModerator,
    isContributor,
    // Standard permissions (full switch-case)
    getStandardPermissions,
    // Project-specific convenience
    userIsEquivalentToProjectModerator,
}

export default PermissionUtils
