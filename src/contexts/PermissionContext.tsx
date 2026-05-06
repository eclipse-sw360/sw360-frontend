// Copyright (C) Siemens AG, 2025. Part of the SW360 Frontend Project.

// This program and the accompanying materials are made
// available under the terms of the Eclipse Public License 2.0
// which is available at https://www.eclipse.org/legal/epl-2.0/

// SPDX-License-Identifier: EPL-2.0
// License-Filename: LICENSE

/**
 * Permission Context
 *
 * Provides role-based permission checking for UI components.
 * Used by: ViewerGate, RoleGate components
 */

'use client'

import { useSession } from 'next-auth/react'
import { createContext, type JSX, type ReactNode, useCallback, useContext, useMemo } from 'react'
import { UserGroupType } from '@/object-types'

interface PermissionContextValue {
    userRole: UserGroupType | null
    isAuthenticated: boolean
    isLoading: boolean
    isViewer: boolean
    isBlocked: (blockedRoles: UserGroupType[]) => boolean
    isAnyRole: (roles: UserGroupType[]) => boolean
}

const defaultContextValue: PermissionContextValue = {
    userRole: null,
    isAuthenticated: false,
    isLoading: true,
    isViewer: false,
    isBlocked: () => true,
    isAnyRole: () => false,
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

    const isViewer = useMemo(
        () => userRole === UserGroupType.VIEWER,
        [
            userRole,
        ],
    )

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

    const contextValue = useMemo<PermissionContextValue>(
        () => ({
            userRole,
            isAuthenticated,
            isLoading,
            isViewer,
            isBlocked,
            isAnyRole,
        }),
        [
            userRole,
            isAuthenticated,
            isLoading,
            isViewer,
            isBlocked,
            isAnyRole,
        ],
    )

    return <PermissionContext.Provider value={contextValue}>{children}</PermissionContext.Provider>
}

export function usePermissionContext(): PermissionContextValue {
    return useContext(PermissionContext)
}

export default PermissionContext
