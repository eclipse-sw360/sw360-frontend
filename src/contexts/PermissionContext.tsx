// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Permission Context
 *
 * Provides role-based permission checking for UI components.
 * Used by: ViewerGate, RoleGate, CapabilityGate, AdminGate components
 *
 * Features:
 * - Quick role checks (isViewer, isAdmin, etc.)
 * - Generic role checks (isAnyRole, isBlocked)
 * - Capability-based checks (hasCapability)
 */

'use client'

import { useSession } from 'next-auth/react'
import { createContext, type JSX, type ReactNode, useCallback, useContext, useMemo } from 'react'
import { getCapabilitiesForRole, type RoleCapabilities } from '@/config/permissions'
import { UserGroupType } from '@/object-types'

interface PermissionContextValue {
    // Role state
    userRole: UserGroupType | null
    isAuthenticated: boolean
    isLoading: boolean

    // Quick role checks
    isViewer: boolean
    isAdmin: boolean
    isClearingAdmin: boolean
    isClearingExpert: boolean
    isEccAdmin: boolean
    isSecurityAdmin: boolean
    isSecurityUser: boolean

    // Generic role checks
    isBlocked: (blockedRoles: UserGroupType[]) => boolean
    isAnyRole: (roles: UserGroupType[]) => boolean

    // Capability-based checks
    hasCapability: (capability: keyof RoleCapabilities) => boolean
    capabilities: RoleCapabilities
}

const defaultCapabilities: RoleCapabilities = {
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

const defaultContextValue: PermissionContextValue = {
    userRole: null,
    isAuthenticated: false,
    isLoading: true,
    isViewer: false,
    isAdmin: false,
    isClearingAdmin: false,
    isClearingExpert: false,
    isEccAdmin: false,
    isSecurityAdmin: false,
    isSecurityUser: false,
    isBlocked: () => true,
    isAnyRole: () => false,
    hasCapability: () => false,
    capabilities: defaultCapabilities,
}

const PermissionContext = createContext<PermissionContextValue>(defaultContextValue)

interface PermissionProviderProps {
    children: ReactNode
}

export function PermissionProvider({ children }: PermissionProviderProps): JSX.Element {
    const { data: session, status } = useSession()

    const userRole = useMemo(() => {
        return (session?.user?.userGroup as UserGroupType) ?? null
    }, [
        session?.user?.userGroup,
    ])

    const isAuthenticated = useMemo(() => {
        return status === 'authenticated' && !!userRole
    }, [
        status,
        userRole,
    ])

    const isLoading = useMemo(
        () => status === 'loading',
        [
            status,
        ],
    )

    // Quick role checks
    const isViewer = useMemo(
        () => userRole === UserGroupType.VIEWER,
        [
            userRole,
        ],
    )

    const isAdmin = useMemo(
        () => userRole === UserGroupType.ADMIN || userRole === UserGroupType.SW360_ADMIN,
        [
            userRole,
        ],
    )

    const isClearingAdmin = useMemo(
        () => userRole === UserGroupType.CLEARING_ADMIN,
        [
            userRole,
        ],
    )

    const isClearingExpert = useMemo(
        () => userRole === UserGroupType.CLEARING_EXPERT,
        [
            userRole,
        ],
    )

    const isEccAdmin = useMemo(
        () => userRole === UserGroupType.ECC_ADMIN,
        [
            userRole,
        ],
    )

    const isSecurityAdmin = useMemo(
        () => userRole === UserGroupType.SECURITY_ADMIN,
        [
            userRole,
        ],
    )

    const isSecurityUser = useMemo(
        () => userRole === UserGroupType.SECURITY_USER,
        [
            userRole,
        ],
    )

    // Capabilities for current role
    const capabilities = useMemo(
        () => getCapabilitiesForRole(userRole),
        [
            userRole,
        ],
    )

    // Generic role checks
    const isBlocked = useCallback(
        (blockedRoles: UserGroupType[]): boolean => {
            return userRole !== null && blockedRoles.includes(userRole)
        },
        [
            userRole,
        ],
    )

    const isAnyRole = useCallback(
        (roles: UserGroupType[]): boolean => {
            return userRole !== null && roles.includes(userRole)
        },
        [
            userRole,
        ],
    )

    // Capability check
    const hasCapability = useCallback(
        (capability: keyof RoleCapabilities): boolean => {
            return capabilities[capability]
        },
        [
            capabilities,
        ],
    )

    const contextValue = useMemo<PermissionContextValue>(
        () => ({
            userRole,
            isAuthenticated,
            isLoading,
            isViewer,
            isAdmin,
            isClearingAdmin,
            isClearingExpert,
            isEccAdmin,
            isSecurityAdmin,
            isSecurityUser,
            isBlocked,
            isAnyRole,
            hasCapability,
            capabilities,
        }),
        [
            userRole,
            isAuthenticated,
            isLoading,
            isViewer,
            isAdmin,
            isClearingAdmin,
            isClearingExpert,
            isEccAdmin,
            isSecurityAdmin,
            isSecurityUser,
            isBlocked,
            isAnyRole,
            hasCapability,
            capabilities,
        ],
    )

    return <PermissionContext.Provider value={contextValue}>{children}</PermissionContext.Provider>
}

export function usePermissionContext(): PermissionContextValue {
    return useContext(PermissionContext)
}

export default PermissionContext
