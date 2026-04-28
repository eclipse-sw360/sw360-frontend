// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

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
