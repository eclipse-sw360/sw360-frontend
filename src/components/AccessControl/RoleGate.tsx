// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Role-based UI Gates
 *
 * ViewerGate - Hides content from VIEWER role
 * AdminGate - Shows content only to ADMIN/SW360_ADMIN roles
 * RoleGate - Generic: Supports allowedRoles/blockedRoles patterns
 *
 * Used in: ComponentsTable.tsx, Projects.tsx, LinkedPackagesTab.tsx, etc.
 */

'use client'

import type { JSX, ReactNode } from 'react'
import type { RoleGateProps } from '@/config/permissions'
import { usePermissionContext } from '@/contexts'

/** Generic role gate with allowedRoles (whitelist) or blockedRoles (blacklist) */
export function RoleGate({ allowedRoles, blockedRoles, fallback = null, children }: RoleGateProps): JSX.Element | null {
    const { isAnyRole, isBlocked, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated) return fallback as JSX.Element | null
    if (blockedRoles?.length && isBlocked(blockedRoles)) return fallback as JSX.Element | null
    if (allowedRoles?.length && !isAnyRole(allowedRoles)) return fallback as JSX.Element | null

    return children as JSX.Element
}

/**
 * Hides content from VIEWER role.
 *
 * @example
 * <ViewerGate>
 *     <Button onClick={handleEdit}>Edit</Button>
 * </ViewerGate>
 */
export function ViewerGate({
    fallback = null,
    children,
}: {
    fallback?: ReactNode
    children: ReactNode
}): JSX.Element | null {
    const { isViewer, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated || isViewer) return fallback as JSX.Element | null

    return children as JSX.Element
}

/**
 * Shows content only to ADMIN or SW360_ADMIN roles.
 *
 * @example
 * <AdminGate>
 *     <Button variant="danger" onClick={handleDeleteAll}>Delete All</Button>
 * </AdminGate>
 */
export function AdminGate({
    fallback = null,
    children,
}: {
    fallback?: ReactNode
    children: ReactNode
}): JSX.Element | null {
    const { isAdmin, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated || !isAdmin) return fallback as JSX.Element | null

    return children as JSX.Element
}

/**
 * Shows content only to CLEARING_ADMIN, CLEARING_EXPERT roles (or ADMIN).
 *
 * @example
 * <ClearingGate>
 *     <Button onClick={handleClearingAction}>Approve Clearing</Button>
 * </ClearingGate>
 */
export function ClearingGate({
    fallback = null,
    children,
}: {
    fallback?: ReactNode
    children: ReactNode
}): JSX.Element | null {
    const { isClearingAdmin, isClearingExpert, isAdmin, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated) return fallback as JSX.Element | null
    if (!isClearingAdmin && !isClearingExpert && !isAdmin) return fallback as JSX.Element | null

    return children as JSX.Element
}

/**
 * Shows content only to ECC_ADMIN role (or ADMIN).
 *
 * @example
 * <EccAdminGate>
 *     <ECCEditForm />
 * </EccAdminGate>
 */
export function EccAdminGate({
    fallback = null,
    children,
}: {
    fallback?: ReactNode
    children: ReactNode
}): JSX.Element | null {
    const { isEccAdmin, isAdmin, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated) return fallback as JSX.Element | null
    if (!isEccAdmin && !isAdmin) return fallback as JSX.Element | null

    return children as JSX.Element
}

/**
 * Shows content only to SECURITY_ADMIN role (or ADMIN).
 *
 * @example
 * <SecurityAdminGate>
 *     <Button onClick={handleSuppress}>Suppress Vulnerability</Button>
 * </SecurityAdminGate>
 */
export function SecurityAdminGate({
    fallback = null,
    children,
}: {
    fallback?: ReactNode
    children: ReactNode
}): JSX.Element | null {
    const { isSecurityAdmin, isAdmin, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated) return fallback as JSX.Element | null
    if (!isSecurityAdmin && !isAdmin) return fallback as JSX.Element | null

    return children as JSX.Element
}

export default RoleGate
