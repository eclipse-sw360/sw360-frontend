// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Role-based UI Gates
 *
 * ViewerGate - PRIMARY: Hides content from VIEWER role
 *   Used in: ComponentsTable.tsx, Projects.tsx, LinkedPackagesTab.tsx
 *
 * RoleGate - Generic: Supports allowedRoles/blockedRoles patterns
 */

'use client'

import type { JSX } from 'react'
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

/** Hides content from VIEWER role. Usage: <ViewerGate><EditButton /></ViewerGate> */
export function ViewerGate({
    fallback = null,
    children,
}: {
    fallback?: React.ReactNode
    children: React.ReactNode
}): JSX.Element | null {
    const { isViewer, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated || isViewer) return fallback as JSX.Element | null

    return children as JSX.Element
}

export default RoleGate
