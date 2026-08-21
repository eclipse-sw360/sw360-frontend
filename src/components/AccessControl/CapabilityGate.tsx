// Copyright (C) Siemens AG, 2026. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * CapabilityGate Component
 *
 * Shows content only if user has the specified capability.
 * Uses the RoleCapabilities matrix from capabilities.config.ts.
 *
 * Usage:
 * <CapabilityGate capability="canEditECCClassifications">
 *     <ECCEditForm />
 * </CapabilityGate>
 */

'use client'

import type { JSX, ReactNode } from 'react'
import type { RoleCapabilities } from '@/config/permissions'
import { usePermissionContext } from '@/contexts'

interface CapabilityGateProps {
    /** Required capability to show children */
    capability: keyof RoleCapabilities
    /** Content to show when capability not met */
    fallback?: ReactNode
    children: ReactNode
}

/**
 * Shows content only if user has the specified capability.
 *
 * @example
 * // Show ECC edit form only for users with canEditECCClassifications
 * <CapabilityGate capability="canEditECCClassifications">
 *     <ECCEditForm />
 * </CapabilityGate>
 *
 * @example
 * // Show vulnerability suppress button with fallback message
 * <CapabilityGate
 *     capability="canSuppressVulnerabilities"
 *     fallback={<span className="text-muted">No permission</span>}
 * >
 *     <Button onClick={handleSuppress}>Suppress</Button>
 * </CapabilityGate>
 */
export function CapabilityGate({ capability, fallback = null, children }: CapabilityGateProps): JSX.Element | null {
    const { hasCapability, isLoading, isAuthenticated } = usePermissionContext()

    if (isLoading || !isAuthenticated) return fallback as JSX.Element | null
    if (!hasCapability(capability)) return fallback as JSX.Element | null

    return children as JSX.Element
}

export default CapabilityGate
